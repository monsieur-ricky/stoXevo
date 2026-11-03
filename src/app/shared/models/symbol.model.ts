import type { MarketSource } from '../data/market-data/market-data.types';
import type { AssetType } from './asset.model';

export type Symbol = {
  symbol: string;
  name: string;
  currency: string;
  stockExchange?: string;
  exchangeShortName?: string;
  sources?: MarketSource[];
  type?: AssetType;
};
