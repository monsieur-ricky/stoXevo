import { Profile } from '@shared/models';
import { MarketSource } from './market-data.types';
import { normalizedEvidence, supportsNumber } from './market-evidence';
import { QUOTE_SCHEMA } from './quote-validation';

export const PROFILE_TEXT_FIELDS = [
  'name',
  'currency',
  'exchangeShortName',
  'description',
  'website',
  'sector',
  'industry',
  'country',
  'ceo',
  'fullTimeEmployees',
  'phone',
  'address'
] as const;
export const PROFILE_METRICS = [
  'changeValue',
  'changePercent',
  'regularMarketDayHigh',
  'regularMarketDayLow',
  'fiftyDayAverage',
  'fiftyTwoWeekHigh',
  'fiftyTwoWeekLow',
  'trailingAnnualDividendRate',
  'dividendYield'
] as const;
const METRIC_LABELS: Record<(typeof PROFILE_METRICS)[number], RegExp> = {
  changeValue: /\b(?:change|delta)\b/i,
  changePercent: /\b(?:change|delta)\b/i,
  regularMarketDayHigh: /\bhigh\b/i,
  regularMarketDayLow: /\blow\b/i,
  fiftyDayAverage: /\b50[\s-]*(?:day|d)\b.*(?:average|avg)|fifty.day.*average/i,
  fiftyTwoWeekHigh: /\b52[\s-]*(?:week|wk)\b.*high|fifty.two.week.*high/i,
  fiftyTwoWeekLow: /\b52[\s-]*(?:week|wk)\b.*low|fifty.two.week.*low/i,
  trailingAnnualDividendRate: /\bdividend\b/i,
  dividendYield: /\byield\b/i
};
export const PROFILE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    symbol: { type: 'string' },
    type: {
      type: ['string', 'null'],
      enum: ['stock', 'etf', 'fund', 'bond', 'crypto', 'forex', 'futures', null]
    },
    ...Object.fromEntries(
      PROFILE_TEXT_FIELDS.map(key => [key, { type: ['string', 'null'] }])
    ),
    quotes: QUOTE_SCHEMA.properties.quotes,
    metrics: {
      type: 'object',
      additionalProperties: false,
      properties: Object.fromEntries(
        PROFILE_METRICS.map(key => [
          key,
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              value: { type: ['number', 'null'] },
              evidence: { type: ['string', 'null'] },
              sourceIds: { type: 'array', items: { type: 'string' } }
            },
            required: ['value', 'evidence', 'sourceIds']
          }
        ])
      ),
      required: [...PROFILE_METRICS]
    }
  },
  required: ['symbol', 'type', ...PROFILE_TEXT_FIELDS, 'quotes', 'metrics']
};

/** Each optional statistic must have its own verbatim supporting excerpt. */
export function supportedProfileMetrics(
  value: unknown,
  text: string,
  sources: MarketSource[]
): Partial<Profile> {
  if (!value || typeof value !== 'object') return {};
  const output: Partial<Profile> = {};
  for (const key of PROFILE_METRICS) {
    const item = (value as Record<string, unknown>)[key];
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const number = row['value'];
    const evidence = row['evidence'];
    const ids = row['sourceIds'];
    if (
      typeof number !== 'number' ||
      !Number.isFinite(number) ||
      typeof evidence !== 'string' ||
      !evidence.trim() ||
      !METRIC_LABELS[key].test(evidence) ||
      !normalizedEvidence(text).includes(normalizedEvidence(evidence)) ||
      !supportsNumber(evidence, number) ||
      !Array.isArray(ids) ||
      !ids.length ||
      ids.some(id => !sources.some(source => source.id === id))
    )
      continue;
    if (key !== 'changeValue' && key !== 'changePercent' && number < 0)
      continue;
    // No implicit fraction/percentage conversion for dividend yield.
    if (key === 'dividendYield' && !evidence.includes('%')) continue;
    output[key] = number;
  }
  return output;
}
