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
          exchangeShortName: { type: 'string' }
        },
        required: ['symbol', 'name', 'currency', 'exchangeShortName']
      }
    }
  },
  required: ['symbols']
};
const PROFILE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    symbol: { type: 'string' },
    name: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    website: { type: ['string', 'null'] },
    sector: { type: ['string', 'null'] },
    industry: { type: ['string', 'null'] },
    country: { type: ['string', 'null'] }
  },
  required: [
    'symbol',
    'name',
    'description',
    'website',
    'sector',
    'industry',
    'country'
  ]
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
      .map(({ symbol, name, currency, exchangeShortName }) => ({
        symbol,
        name,
        currency,
        exchangeShortName,
        sources: result.sources
      }));
  }

  async getProfile(
    symbol: string,
    signal?: AbortSignal
  ): Promise<Profile & { sources: MarketSource[] }> {
    const result = await this.transport.extract(
      `Find sourced company/fund metadata for the exact ticker ${JSON.stringify(symbol)}. Return null for unknown fields. Do not supply price metrics, dividends or numerical estimates.`,
      PROFILE_SCHEMA,
      signal
    );
    if (!result.value || typeof result.value !== 'object')
      throw new Error('Invalid asset profile.');
    const row = result.value as Record<string, unknown>;
    if (row['symbol'] !== symbol)
      throw new Error('Profile instrument mismatch.');
    const profile: Profile = { symbol };
    for (const key of [
      'name',
      'description',
      'sector',
      'industry',
      'country'
    ] as const) {
      if (typeof row[key] === 'string' && row[key].length < 10_000)
        profile[key] = row[key];
    }
    profile.website = safeSourceUrl(row['website']);
    return { ...profile, sources: result.sources };
  }
}
