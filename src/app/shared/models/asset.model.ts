import { SelectList, Symbol } from '@shared/models';

type AssetTypeSelect = SelectList<AssetType> & {
  id: AssetType;
};

export type AssetType =
  | 'stock'
  | 'etf'
  | 'fund'
  | 'bond'
  | 'commodity'
  | 'crypto'
  | 'forex';

export type Asset = Symbol & {
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  value: number;
  type: AssetType;
  manualUpdate: boolean;
};

export const assetTypes: AssetTypeSelect[] = [
  {
    id: 'stock',
    label: 'Stock'
  },
  {
    id: 'etf',
    label: 'ETF'
  },
  {
    id: 'fund',
    label: 'Fund'
  },
  {
    id: 'bond',
    label: 'Bond'
  },
  {
    id: 'commodity',
    label: 'Commodity'
  },
  {
    id: 'crypto',
    label: 'Crypto'
  },
  {
    id: 'forex',
    label: 'Forex'
  }
];
