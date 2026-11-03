import { AssetType } from '@shared/models';
import { exchangeAliases, normalizedCurrency } from './market-evidence';

export type AiProvider = 'openai' | 'anthropic' | 'openrouter' | 'kilo';
export type MarketDataSettings = {
  version: 1;
  source: 'ai' | 'stoxscraper' | 'manual';
  provider: AiProvider;
  consent: boolean;
};

export const DEFAULT_MARKET_DATA_SETTINGS: MarketDataSettings = {
  version: 1,
  source: 'ai',
  provider: 'openai',
  consent: false
};

export const AI_PRESETS: Record<
  AiProvider,
  { model: string; endpoint: string; available: boolean }
> = {
  openai: {
    model: 'gpt-6-luna',
    endpoint: 'https://api.openai.com/v1/responses',
    available: true
  },
  anthropic: {
    model: 'claude-haiku-5-5',
    endpoint: 'https://api.anthropic.com/v1/messages',
    available: true
  },
  openrouter: {
    model: 'openai/gpt-6-luna',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    available: true
  },
  kilo: {
    model: 'openai/gpt-6-luna',
    endpoint: 'https://ai-gateway.kilo.ai/api/v1/chat/completions',
    available: false
  }
};

/** Public identifiers only: never pass an Asset/portfolio object to a provider. */
export type Instrument = {
  symbol: string;
  currency: string;
  exchange?: string;
  type?: AssetType;
  metal?: string;
};
export type MarketSource = { id: string; url: string; title: string };
export type QuoteEvidence = {
  provider: string;
  model?: string;
  marketAsOf: string;
  retrievedAt: string;
  kind: 'latest' | 'close' | 'nav';
  unit?: string;
  timestampKind?: 'market' | 'provider-fetch';
  sources: MarketSource[];
};
export type QuoteResult = {
  instrument: Instrument;
  status: 'ok' | 'unavailable';
  price?: number;
  evidence?: QuoteEvidence;
  reason?: string;
};

export const AI_BATCH_SIZE = 5;
export const QUOTE_TTL_MS = 15 * 60_000;

export function instrumentKey(value: Instrument): string {
  return JSON.stringify([
    value.symbol.toUpperCase(),
    value.exchange ? exchangeAliases(value.exchange)[0] : '',
    normalizedCurrency(value.currency),
    value.type ?? '',
    value.metal ?? ''
  ]);
}

export function readMarketDataSettings(
  value: unknown,
  legacyKey?: string | null
): MarketDataSettings {
  if (value === undefined)
    return {
      ...DEFAULT_MARKET_DATA_SETTINGS,
      source: legacyKey ? 'stoxscraper' : 'ai'
    };
  if (!value || typeof value !== 'object')
    throw new Error('Invalid market data settings.');
  const settings = value as Record<string, unknown>;
  if (
    settings['version'] !== 1 ||
    !['ai', 'stoxscraper', 'manual'].includes(String(settings['source'])) ||
    !Object.hasOwn(AI_PRESETS, String(settings['provider'])) ||
    typeof settings['consent'] !== 'boolean'
  ) {
    throw new Error('Unsupported or invalid market data settings.');
  }
  return {
    version: 1,
    source: settings['source'] as MarketDataSettings['source'],
    provider: settings['provider'] as AiProvider,
    consent: settings['consent']
  };
}
