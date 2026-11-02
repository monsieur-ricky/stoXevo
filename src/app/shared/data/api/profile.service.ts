import { inject, Injectable, resource, Signal } from '@angular/core';
import { ApplicationStore } from '../app.store';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly marketData = inject(MarketDataService);
  private readonly app = inject(ApplicationStore);

  resource(symbol: Signal<string | undefined>) {
    return resource({
      params: () => {
        const value = symbol();
        const revision = this.app.marketDataRevision();
        return value && this.app.canUseMarketData()
          ? { symbol: value, revision }
          : undefined;
      },
      loader: ({ params, abortSignal }) =>
        this.marketData.getProfile(params.symbol, abortSignal)
    });
  }
}
