import type { MarketSource } from '../data/market-data/market-data.types';

export type Symbol = {
  symbol: string;
  name: string;
  currency: string;
  stockExchange?: string;
  exchangeShortName?: string;
  sources?: MarketSource[];
};
