import { inject, Injectable } from '@angular/core';
import { Profile, Symbol } from '@shared/models';
import { AiTransportService } from './ai-transport.service';
import {
  AI_BATCH_SIZE,
  Instrument,
  MarketSource,
  QuoteResult
} from './market-data.types';
import {
  QUOTE_SCHEMA,
  safeSourceUrl,
  validateQuotes
} from './quote-validation';
import {
  PROFILE_SCHEMA,
  PROFILE_TEXT_FIELDS,
  supportedProfileMetrics
} from './profile-data';
import { normalizedCurrency, sameExchange } from './market-evidence';

const SYMBOL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          symbol: { type: 'string' },
          name: { type: 'string' },
          currency: { type: 'string' },
          exchangeShortName: { type: 'string' },
          type: {
            type: ['string', 'null'],
            enum: [
              'stock',
              'etf',
              'fund',
              'bond',
              'crypto',
              'forex',
              'futures',
              null
            ]
          }
        },
        required: ['symbol', 'name', 'currency', 'exchangeShortName', 'type']
      }
    }
  },
  required: ['symbols']
};

@Injectable({ providedIn: 'root' })
export class AiMarketDataService {
  private readonly transport = inject(AiTransportService);

  async getQuotes(
    instruments: Instrument[],
    signal?: AbortSignal
  ): Promise<QuoteResult[]> {
    if (!instruments.length) return [];
    if (instruments.length > AI_BATCH_SIZE)
      throw new Error('AI quote batch exceeds its limit.');
    if (
      instruments.some(item =>
        ['commodity', 'gold', 'silver', 'physical'].includes(item.type ?? '')
      )
    )
      throw new Error('Metals and physical assets must never be priced by AI.');
    const identifiers = instruments.map(
      ({ symbol, currency, exchange, type }, id) => ({
        id,
        symbol,
        currency,
        exchange: exchange ?? null,
        type
      })
    );
    const result = await this.transport.extract(
      `Find one sourced indicative quote per instrument. Preserve each numeric id. Return unavailable for unknown identities or prices/timestamps. Instruments: ${JSON.stringify(identifiers)}`,
      QUOTE_SCHEMA,
      signal
    );
    return validateQuotes(
      result.value,
      instruments,
      result.sources,
      result.provider,
      result.model,
      result.text
    );
  }

  async searchSymbols(query: string, signal?: AbortSignal): Promise<Symbol[]> {
    if (query.trim().length < 3 || query.length > 100) return [];
    const result = await this.transport.extract(
      `Find at most five publicly traded financial instruments matching this literal query: ${JSON.stringify(query)}. Include exact ticker, listing exchange, name and quoted currency; never include metal prices.`,
      SYMBOL_SCHEMA,
      signal
    );
    const value = result.value as { symbols?: unknown[] } | null;
    return (Array.isArray(value?.symbols) ? value.symbols : [])
      .slice(0, 5)
      .filter((item): item is Symbol => {
        if (!item || typeof item !== 'object') return false;
        const row = item as Record<string, unknown>;
        return (
          ['symbol', 'name', 'currency', 'exchangeShortName'].every(
            key =>
              typeof row[key] === 'string' &&
              row[key].length > 0 &&
              row[key].length < 200
          ) &&
          result.text.includes(String(row['symbol'])) &&
          result.text.includes(String(row['currency']))
        );
      })
      .map(({ symbol, name, currency, exchangeShortName, type }) => ({
        symbol,
        name,
        currency,
        exchangeShortName,
        type:
          type &&
          [
            'stock',
            'etf',
            'fund',
            'bond',
            'crypto',
            'forex',
            'futures'
          ].includes(type)
            ? type
            : undefined,
        sources: result.sources
      }));
  }

  async getProfile(
    symbol: string,
    signal?: AbortSignal,
    identity: Partial<Instrument> = {}
  ): Promise<Profile & { sources: MarketSource[] }> {
    const result = await this.transport.extract(
      `Build the asset details page for this exact public instrument: ${JSON.stringify({ symbol, currency: identity.currency, exchange: identity.exchange, type: identity.type })}.
Search established financial quote/profile pages AND official company/investor-relations pages, not just a company FAQ. Retrieve name, type, quoted currency, listing exchange, company description, industry, sector, country, website, CEO, employee count, phone and address when supported.
Also retrieve the latest available sourced market quote with request id 0, or the most recent market close/NAV when the market is closed. Include its actual market timestamp, not the request time. Put it in quotes; use an empty array if no acceptable price is available.
Retrieve available day high/low, change value/percent, 50-day average, 52-week high/low, annual dividend and dividend yield (percent, not fractional). Each metric must include its own exact verbatim supporting evidence and sourceIds. Null is better than an estimate; do not invent missing fields.`,
      PROFILE_SCHEMA,
      signal,
      { searchContext: 'medium' }
    );
    if (!result.value || typeof result.value !== 'object')
      throw new Error('Invalid asset profile.');
    const row = result.value as Record<string, unknown>;
    if (row['symbol'] !== symbol)
      throw new Error('Profile instrument mismatch.');
    if (
      (identity.currency &&
        typeof row['currency'] === 'string' &&
        normalizedCurrency(identity.currency) !==
          normalizedCurrency(row['currency'])) ||
      (identity.exchange &&
        typeof row['exchangeShortName'] === 'string' &&
        !sameExchange(row['exchangeShortName'], identity.exchange))
    ) {
      throw new Error(
        'Profile listing or currency does not match the selected instrument.'
      );
    }
    const profile: Profile = {
      symbol,
      currency: identity.currency,
      exchangeShortName: identity.exchange,
      type: identity.type
    };
    for (const key of PROFILE_TEXT_FIELDS) {
      if (
        typeof row[key] === 'string' &&
        row[key].trim() &&
        row[key].length < 10_000
      )
        profile[key] = row[key];
    }
    profile.website = safeSourceUrl(row['website']);
    if (
      typeof row['type'] === 'string' &&
      ['stock', 'etf', 'fund', 'bond', 'crypto', 'forex', 'futures'].includes(
        row['type']
      )
    )
      profile.type = identity.type ?? (row['type'] as Instrument['type']);
    const instrument: Instrument = {
      symbol,
      currency: identity.currency ?? profile.currency ?? '',
      exchange: identity.exchange ?? profile.exchangeShortName,
      type: identity.type ?? profile.type
    };
    const [quote] = validateQuotes(
      { quotes: row['quotes'] },
      [instrument],
      result.sources,
      result.provider,
      result.model,
      result.text
    );
    if (quote.status === 'ok') {
      profile.price = quote.price;
      profile.quoteEvidence = quote.evidence;
    } else profile.quoteMessage = quote.reason;
    return {
      ...profile,
      ...supportedProfileMetrics(row['metrics'], result.text, result.sources),
      sources: result.sources
    };
  }
}
