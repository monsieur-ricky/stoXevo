import { Injectable, inject } from '@angular/core';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable({ providedIn: 'root' })
export class SymbolSearchService {
  private readonly marketData = inject(MarketDataService);
  searchSymbols(query: string, signal?: AbortSignal) {
    return this.marketData.searchSymbols(query, signal);
  }
}
