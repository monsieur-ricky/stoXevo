import { SelectList, Symbol } from '@shared/models';

export type AssetTypeSelect = SelectList<AssetType> & {
  id: AssetType;
  subTypes?: AssetTypeSelect[];
};

export type AssetType =
  | 'stock'
  | 'etf'
  | 'fund'
  | 'bond'
  | 'commodity'
  | 'crypto'
  | 'forex'
  | 'futures'
  | 'gold'
  | 'silver'
  | 'physical';

export type Asset = Symbol & {
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  value: number;
  type: AssetType;
  manualUpdate: boolean;
  subType?: string;
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
    label: 'Commodity',
    subTypes: [
      {
        id: 'gold',
        label: 'Gold'
      },
      {
        id: 'silver',
        label: 'Silver'
      }
    ]
  },
  {
    id: 'crypto',
    label: 'Crypto'
  },
  {
    id: 'forex',
    label: 'Forex'
  },
  {
    id: 'futures',
    label: 'Futures'
  },
  {
    id: 'physical',
    label: 'Physical Assets'
  }
];
