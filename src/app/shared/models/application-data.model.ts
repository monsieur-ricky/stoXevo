import type { MarketDataSettings } from '../data/market-data/market-data.types';

export type ApplicationData = {
  salt: string | null;
  iv: string | null;
  appData: EncryptedAppData | string | null;
};

export type EncryptedAppData = {
  apiKey: string | null;
  assets: unknown[] | string | null;
  marketData?: MarketDataSettings;
};
