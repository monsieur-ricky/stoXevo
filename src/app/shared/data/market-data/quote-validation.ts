import { Instrument, MarketSource, QuoteResult } from './market-data.types';
import {
  containsToken,
  exchangeAliases,
  normalizedCurrency,
  normalizedEvidence,
  quoteBlocks,
  sameExchange,
  supportsNumber,
  supportsTimestamp
} from './market-evidence';

export const QUOTE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    quotes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'integer' },
          status: { type: 'string', enum: ['ok', 'unavailable'] },
          symbol: { type: 'string' },
          exchange: { type: ['string', 'null'] },
          currency: { type: 'string' },
          unit: {
            type: 'string',
            enum: [
              'share',
              'coin',
              'nav-unit',
              'base-unit',
              'contract',
              'bond-unit'
            ]
          },
          price: { type: ['number', 'null'] },
          marketAsOf: { type: ['string', 'null'] },
          kind: { type: 'string', enum: ['latest', 'close', 'nav'] },
          sourceIds: { type: 'array', items: { type: 'string' } },
          evidence: {
            type: ['string', 'null'],
            description:
              'Exact verbatim quote excerpt from the cited answer, including this ticker, currency, unit and market timestamp. Do not rewrite it.'
          }
        },
        required: [
          'id',
          'status',
          'symbol',
          'exchange',
          'currency',
          'unit',
          'price',
          'marketAsOf',
          'kind',
          'sourceIds',
          'evidence'
        ]
      }
    }
  },
  required: ['quotes']
} as const;

export function safeSourceUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password)
      return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/** Reject missing/duplicate identities and unsupported values; never fabricate zero. */
export function validateQuotes(
  value: unknown,
  instruments: Instrument[],
  sources: MarketSource[],
  provider: string,
  model: string,
  groundedText: string,
  now = Date.now()
): QuoteResult[] {
  const rows: unknown[] =
    value &&
    typeof value === 'object' &&
    Array.isArray((value as Record<string, unknown>)['quotes'])
      ? (value as { quotes: unknown[] }).quotes
      : [];
  return instruments.map((instrument, id) => {
    const fail = (reason: string): QuoteResult => ({
      instrument,
      status: 'unavailable',
      reason
    });
    const matches = rows.filter(
      row =>
        row &&
        typeof row === 'object' &&
        (row as Record<string, unknown>)['id'] === id
    );
    if (matches.length !== 1) return fail('Missing or duplicate quote.');
    const row = matches[0] as Record<string, unknown>;
    if (row['status'] !== 'ok') return fail('No sourced quote available.');
    const units: Record<string, string> = {
      stock: 'share',
      etf: 'share',
      crypto: 'coin',
      fund: 'nav-unit',
      forex: 'base-unit',
      futures: 'contract',
      bond: 'bond-unit'
    };
    const unit = units[instrument.type ?? 'stock'];
    if (!unit || row['unit'] !== unit) return fail('Quote unit mismatch.');
    if (
      row['symbol'] !== instrument.symbol ||
      typeof row['currency'] !== 'string' ||
      normalizedCurrency(row['currency']) !==
        normalizedCurrency(instrument.currency) ||
      (instrument.exchange &&
        !sameExchange(row['exchange'], instrument.exchange))
    )
      return fail('Instrument or currency mismatch.');
    const price = row['price'];
    if (
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price > Number.MAX_SAFE_INTEGER
    )
      return fail('Invalid price.');
    const date = row['marketAsOf'];
    const kind = row['kind'];
    if (
      typeof date !== 'string' ||
      !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(date) ||
      !['latest', 'close', 'nav'].includes(String(kind))
    )
      return fail('Missing market timestamp.');
    const age = now - Date.parse(date);
    const maxAge = kind === 'latest' ? 15 * 60_000 : 7 * 24 * 60 * 60_000;
    if (!Number.isFinite(age) || age < -60_000 || age > maxAge)
      return fail('Stale or invalid market timestamp.');
    const ids = row['sourceIds'];
    if (
      !Array.isArray(ids) ||
      !ids.length ||
      ids.some(
        id =>
          typeof id !== 'string' ||
          !sources.some(source => source.id === id && safeSourceUrl(source.url))
      )
    )
      return fail('Missing provider citation.');
    // A grounded answer must actually contain the extracted number and identity.
    // This is not independent verification of the original publisher's data.
    const excerpt = row['evidence'];
    if (
      typeof excerpt === 'string' &&
      !normalizedEvidence(groundedText).includes(normalizedEvidence(excerpt))
    )
      return fail('Quote excerpt was not retrieved.');
    const text = typeof excerpt === 'string' ? excerpt : groundedText;
    if (
      !quoteBlocks(text, instrument.symbol).some(
        block =>
          supportsNumber(block, price) &&
          containsToken(block, instrument.currency) &&
          supportsTimestamp(block, date) &&
          containsToken(block, unit) &&
          (!instrument.exchange ||
            exchangeAliases(instrument.exchange).some(alias =>
              containsToken(block.toUpperCase(), alias)
            )) &&
          !instruments.some(
            other =>
              other.symbol !== instrument.symbol &&
              containsToken(block, other.symbol)
          )
      )
    )
      return fail('Quote not supported by retrieved answer.');
    return {
      instrument,
      status: 'ok',
      price,
      evidence: {
        provider,
        model,
        marketAsOf: date,
        retrievedAt: new Date(now).toISOString(),
        kind: kind as 'latest' | 'close' | 'nav',
        unit,
        timestampKind: 'market',
        sources: sources.filter(source => ids.includes(source.id))
      }
    };
  });
}
