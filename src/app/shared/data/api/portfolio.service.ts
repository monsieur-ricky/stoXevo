import { inject, Injectable } from '@angular/core';
import { Instrument } from '../market-data/market-data.types';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly marketData = inject(MarketDataService);
  getQuotes(instruments: Instrument[], force = false) {
    return this.marketData.getQuotes(instruments, force);
  }
}
