import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { ApplicationStore } from '../app.store';
import { Instrument, QuoteResult } from './market-data.types';

/** Existing Gold-API.com source, not GoldAPI.io or Yahoo futures. No AI/key. */
@Injectable({ providedIn: 'root' })
export class MetalsService {
  private readonly http = inject(HttpClient);
  private readonly app = inject(ApplicationStore);
  private queue: Promise<unknown> = Promise.resolve();
  private nextStart = 0;
  private cooldown = 0;
  private readonly cache = new Map<
    string,
    { until: number; result: QuoteResult }
  >();
  private readonly inFlight = new Map<string, Promise<QuoteResult>>();

  getQuote(metal: string, currency: string): Promise<QuoteResult> {
    if (!this.app.canUseMetals())
      return Promise.reject(
        new Error('Unlock and consent before retrieving metal prices.')
      );
    if (
      !['gold', 'silver'].includes(metal) ||
      !['EUR', 'USD', 'GBP'].includes(currency)
    )
      return Promise.reject(new Error('Unsupported metal or currency.'));
    const key = `${metal}/${currency}`;
    const cached = this.cache.get(key);
    if (cached && cached.until > Date.now())
      return Promise.resolve(cached.result);
    const existing = this.inFlight.get(key);
    if (existing) return existing;
    const revision = this.app.marketDataRevision();
    const work = this.queue.then(async () => {
      const wait = this.nextStart - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      if (
        !this.app.canUseMetals() ||
        revision !== this.app.marketDataRevision()
      )
        throw new Error('Metal settings changed.');
      if (this.cooldown > Date.now())
        throw new Error('Metal provider rate limited. Retry later.');
      this.nextStart = Date.now() + 1100;
      const symbol = metal === 'gold' ? 'XAU' : 'XAG';
      const url = `https://api.gold-api.com/price/${symbol}/${currency}`;
      const instrument: Instrument = {
        symbol: metal.toUpperCase(),
        currency,
        type: 'commodity'
      };
      let data: {
        symbol: string;
        currency: string;
        price: number;
        updatedAt: string;
      };
      try {
        data = await firstValueFrom(
          this.http.get<typeof data>(url).pipe(timeout(10_000))
        );
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status === 429) {
          const retry = error.headers.get('Retry-After');
          const retryTime =
            retry && /^\d+$/.test(retry)
              ? Date.now() + Number(retry) * 1000
              : Date.parse(retry ?? '');
          this.cooldown = Math.max(
            Date.now() + 30_000,
            Number.isFinite(retryTime) ? retryTime : 0
          );
        }
        // eslint-disable-next-line preserve-caught-error -- expose only a sanitized provider error
        throw new Error(
          'Gold-API unavailable or browser access blocked. Previous prices were kept.'
        );
      }
      const age = Date.now() - Date.parse(data?.updatedAt);
      if (
        data?.symbol !== symbol ||
        data.currency !== currency ||
        !Number.isFinite(data.price) ||
        data.price <= 0 ||
        data.price > Number.MAX_SAFE_INTEGER ||
        !Number.isFinite(age) ||
        age < -60_000 ||
        age > 300_000
      )
        throw new Error('Invalid or stale metal price.');
      if (revision !== this.app.marketDataRevision())
        throw new Error('Metal settings changed.');
      const result: QuoteResult = {
        instrument,
        status: 'ok',
        price: Math.round((data.price / 31.1035) * 100) / 100,
        evidence: {
          provider: 'Gold-API.com (spot per gram)',
          kind: 'latest',
          unit: 'gram',
          timestampKind: 'provider-fetch',
          marketAsOf: data.updatedAt,
          retrievedAt: new Date().toISOString(),
          sources: [
            {
              id: 'gold-api',
              url: 'https://gold-api.com/',
              title: 'Gold-API spot prices (provider fetch timestamp)'
            }
          ]
        }
      };
      this.cache.set(key, { until: Date.now() + 30_000, result });
      return result;
    });
    this.queue = work.catch(() => undefined);
    this.inFlight.set(key, work);
    void work.finally(() => this.inFlight.delete(key)).catch(() => undefined);
    return work;
  }
}
