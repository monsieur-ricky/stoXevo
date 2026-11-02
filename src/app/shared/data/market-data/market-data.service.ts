import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import { firstValueFrom, fromEvent, takeUntil, timeout } from 'rxjs';
import { STOXSCRAPER_API } from '@app';
import { Profile, Symbol, MetalQuote, Asset } from '@shared/models';
import { getMetalPriceFromCurrency } from '@shared/utils';
import { ApplicationStore } from '../app.store';
import { AiMarketDataService } from './ai-market-data.service';
import {
  AI_BATCH_SIZE,
  Instrument,
  instrumentKey,
  MarketSource,
  QUOTE_TTL_MS,
  QuoteResult
} from './market-data.types';
import { MetalsService } from './metals.service';

export function assetInstrument(asset: Asset): Instrument {
  return {
    symbol: asset.symbol,
    currency: asset.currency,
    exchange: asset.exchangeShortName,
    type: asset.type,
    ...(asset.type === 'commodity' ? { metal: asset.subType } : {})
  };
}

@Injectable({ providedIn: 'root' })
export class MarketDataService {
  private readonly http = inject(HttpClient);
  private readonly app = inject(ApplicationStore);
  private readonly ai = inject(AiMarketDataService);
  private readonly metals = inject(MetalsService);
  private revision = this.app.marketDataRevision();
  private controller = new AbortController();
  private readonly quotes = new Map<
    string,
    { until: number; value: QuoteResult }
  >();
  private readonly searches = new Map<
    string,
    { until: number; value: Symbol[] }
  >();
  private readonly profiles = new Map<
    string,
    { until: number; value: Profile & { sources?: MarketSource[] } }
  >();

  constructor() {
    effect(() => {
      if (this.app.marketDataRevision() !== this.revision) this.reset();
    });
  }

  private reset(): void {
    this.revision = this.app.marketDataRevision();
    this.controller.abort();
    this.controller = new AbortController();
    this.quotes.clear();
    this.searches.clear();
    this.profiles.clear();
  }

  private signal(signal?: AbortSignal): AbortSignal {
    if (this.revision !== this.app.marketDataRevision()) this.reset();
    return signal
      ? AbortSignal.any([signal, this.controller.signal])
      : this.controller.signal;
  }

  private get<T>(url: string, signal: AbortSignal): Promise<T> {
    signal.throwIfAborted();
    return firstValueFrom(
      this.http
        .get<T>(url)
        .pipe(timeout(15_000), takeUntil(fromEvent(signal, 'abort')))
    );
  }

  async getQuotes(
    instruments: Instrument[],
    force = false,
    cancellation?: AbortSignal
  ): Promise<QuoteResult[]> {
    const signal = this.signal(cancellation);
    const revision = this.revision;
    const source = this.app.marketData().source;
    const unique = [
      ...new Map(instruments.map(item => [instrumentKey(item), item])).values()
    ];
    const results = new Map<string, QuoteResult>();
    const pending = unique.filter(item => {
      const cached = this.quotes.get(instrumentKey(item));
      if (!force && cached && cached.until > Date.now()) {
        results.set(instrumentKey(item), cached.value);
        return false;
      }
      return true;
    });
    const unavailable = (
      instrument: Instrument,
      reason: string
    ): QuoteResult => ({ instrument, status: 'unavailable', reason });
    const jobs: (() => Promise<QuoteResult[]>)[] = [];
    const other: Instrument[] = [];
    for (const item of pending) {
      if (item.type === 'physical' || source === 'manual') {
        results.set(
          instrumentKey(item),
          unavailable(item, 'Manual valuation required.')
        );
        continue;
      }
      if (
        item.type === 'commodity' ||
        item.type === 'gold' ||
        item.type === 'silver'
      ) {
        jobs.push(async () => {
          if (!this.app.canUseMetals())
            return [
              unavailable(item, 'Configure metal retrieval and consent first.')
            ];
          if (source === 'ai') {
            const result = await this.metals.getQuote(
              item.metal ?? item.type ?? '',
              item.currency
            );
            return [{ ...result, instrument: item }];
          }
          const quote = await this.get<MetalQuote>(
            `${STOXSCRAPER_API}/quote/metal/${encodeURIComponent(item.metal ?? item.type ?? '')}`,
            signal
          );
          const price = getMetalPriceFromCurrency(quote, item.currency);
          return [
            price === undefined
              ? unavailable(item, 'Metal price unavailable.')
              : { instrument: item, status: 'ok', price }
          ];
        });
      } else if (!this.app.canUseMarketData()) {
        results.set(
          instrumentKey(item),
          unavailable(
            item,
            'Configure an available market-data provider first.'
          )
        );
      } else if (source === 'stoxscraper') {
        jobs.push(async () => {
          const quote = await this.get<{ symbol?: string; price?: number }>(
            `${STOXSCRAPER_API}/quote/${encodeURIComponent(item.symbol)}`,
            signal
          );
          return [
            quote?.symbol === item.symbol &&
            typeof quote.price === 'number' &&
            Number.isFinite(quote.price) &&
            quote.price > 0
              ? { instrument: item, status: 'ok', price: quote.price }
              : unavailable(item, 'Invalid scraper quote.')
          ];
        });
      } else other.push(item);
    }
    for (let index = 0; index < other.length; index += AI_BATCH_SIZE) {
      const batch = other.slice(index, index + AI_BATCH_SIZE);
      jobs.push(() => this.ai.getQuotes(batch, signal));
    }
    // Two foreground jobs at a time; errors affect their own instruments only.
    for (let index = 0; index < jobs.length; index += 2) {
      signal.throwIfAborted();
      const settled = await Promise.allSettled(
        jobs.slice(index, index + 2).map(job => job())
      );
      for (const result of settled)
        if (result.status === 'fulfilled') {
          for (const quote of result.value) {
            results.set(instrumentKey(quote.instrument), quote);
            if (quote.status === 'ok') {
              const ttl =
                quote.instrument.type === 'commodity' ? 30_000 : QUOTE_TTL_MS;
              const until =
                quote.evidence?.kind === 'latest' &&
                quote.evidence.provider !== 'Gold-API.com (spot per gram)'
                  ? Math.min(
                      Date.now() + ttl,
                      Date.parse(quote.evidence.marketAsOf) + QUOTE_TTL_MS
                    )
                  : Date.now() + ttl;
              this.quotes.set(instrumentKey(quote.instrument), {
                until,
                value: quote
              });
            }
          }
        }
      // Unfulfilled jobs are filled below; never retry a paid batch implicitly.
    }
    signal.throwIfAborted();
    if (revision !== this.app.marketDataRevision())
      throw new Error('Market data configuration changed.');
    return instruments.map(
      item =>
        results.get(instrumentKey(item)) ??
        unavailable(
          item,
          'Provider failed or returned no acceptable quote. Check settings or try later.'
        )
    );
  }

  async searchSymbols(
    query: string,
    cancellation?: AbortSignal
  ): Promise<Symbol[]> {
    const signal = this.signal(cancellation);
    if (
      !this.app.canUseMarketData() ||
      query.trim().length < 3 ||
      query.length > 100
    )
      return [];
    const cached = this.searches.get(query);
    if (cached && cached.until > Date.now()) return cached.value;
    const value =
      this.app.marketData().source === 'ai'
        ? await this.ai.searchSymbols(query, signal)
        : await this.get<Symbol[]>(
            `${STOXSCRAPER_API}/search/${encodeURIComponent(query)}`,
            signal
          );
    signal.throwIfAborted();
    this.searches.set(query, { until: Date.now() + 86_400_000, value });
    return value;
  }

  async getProfile(
    symbol: string,
    cancellation?: AbortSignal
  ): Promise<Profile & { sources?: MarketSource[] }> {
    const signal = this.signal(cancellation);
    if (!this.app.canUseMarketData())
      throw new Error('Configure market data first.');
    const cached = this.profiles.get(symbol);
    if (cached && cached.until > Date.now()) return cached.value;
    const ai = this.app.marketData().source === 'ai';
    const value = ai
      ? await this.ai.getProfile(symbol, signal)
      : await this.get<Profile>(
          `${STOXSCRAPER_API}/profile/${encodeURIComponent(symbol)}`,
          signal
        );
    signal.throwIfAborted();
    // AI profiles contain metadata only; scraper profiles also contain prices.
    this.profiles.set(symbol, {
      until: Date.now() + (ai ? 7 * 86_400_000 : QUOTE_TTL_MS),
      value
    });
    return value;
  }
}
