import { inject, Injectable, resource, Signal } from '@angular/core';
import { ApplicationStore } from '../app.store';
import { MarketDataService } from '../market-data/market-data.service';
import { Instrument } from '../market-data/market-data.types';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly marketData = inject(MarketDataService);
  private readonly app = inject(ApplicationStore);

  resource(
    symbol: Signal<string | undefined>,
    identity: () => Partial<Instrument> = () => ({})
  ) {
    return resource({
      params: () => {
        const value = symbol();
        const revision = this.app.marketDataRevision();
        return value && this.app.canUseMarketData()
          ? { symbol: value, revision, identity: identity() }
          : undefined;
      },
      loader: ({ params, abortSignal }) =>
        this.marketData.getProfile(params.symbol, abortSignal, params.identity)
    });
  }
}
