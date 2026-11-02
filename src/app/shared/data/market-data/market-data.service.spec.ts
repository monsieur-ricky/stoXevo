import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '../app.store';
import { AiMarketDataService } from './ai-market-data.service';
import { MarketDataService } from './market-data.service';
import { Instrument } from './market-data.types';
import { MetalsService } from './metals.service';

describe('market data orchestration', () => {
  const ai = {
    getQuotes: vi.fn(),
    searchSymbols: vi.fn(),
    getProfile: vi.fn()
  };
  const metals = { getQuote: vi.fn() };
  let app: InstanceType<typeof ApplicationStore>;
  let service: MarketDataService;
  beforeEach(async () => {
    localStorage.clear();
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AiMarketDataService, useValue: ai },
        { provide: MetalsService, useValue: metals }
      ]
    });
    app = TestBed.inject(ApplicationStore);
    await app.setPin('1234');
    await app.setMarketDataSettings(
      { version: 1, source: 'ai', provider: 'openai', consent: true },
      'memory-key'
    );
    service = TestBed.inject(MarketDataService);
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('deduplicates, chunks into five, separates metals/manual assets and caches successes', async () => {
    const instruments: Instrument[] = Array.from({ length: 6 }, (_, i) => ({
      symbol: `TEST${i}`,
      currency: 'USD',
      type: 'stock'
    }));
    ai.getQuotes.mockImplementation((batch: Instrument[]) =>
      Promise.resolve(
        batch.map(instrument => ({ instrument, status: 'ok', price: 20 }))
      )
    );
    metals.getQuote.mockResolvedValue({ status: 'ok', price: 100 });
    const input: Instrument[] = [
      ...instruments,
      instruments[0],
      { symbol: 'GOLD', metal: 'gold', currency: 'EUR', type: 'commodity' },
      { symbol: 'HOME', currency: 'EUR', type: 'physical' }
    ];
    const result = await service.getQuotes(input);
    expect(ai.getQuotes.mock.calls.map(call => call[0].length)).toEqual([5, 1]);
    expect(metals.getQuote).toHaveBeenCalledWith('gold', 'EUR');
    expect(result.map(row => row.status)).toEqual([
      ...Array(8).fill('ok'),
      'unavailable'
    ]);
    await service.getQuotes(instruments);
    expect(ai.getQuotes).toHaveBeenCalledTimes(2);
  });
  it('preserves successful batches when another batch fails', async () => {
    ai.getQuotes
      .mockImplementationOnce((batch: Instrument[]) =>
        Promise.resolve(
          batch.map(instrument => ({ instrument, status: 'ok', price: 20 }))
        )
      )
      .mockRejectedValueOnce(new Error('Unavailable'));
    const result = await service.getQuotes(
      Array.from({ length: 6 }, (_, i) => ({
        symbol: `TEST${i}`,
        currency: 'USD'
      }))
    );
    expect(result.filter(row => row.status === 'ok')).toHaveLength(5);
    expect(result[5].status).toBe('unavailable');
  });
  it('does not retrieve quotes while locked/manual and invalidates cache after changing provider', async () => {
    ai.getQuotes.mockResolvedValue([]);
    await app.setMarketDataSettings({
      version: 1,
      source: 'manual',
      provider: 'openai',
      consent: false
    });
    expect(
      (await service.getQuotes([{ symbol: 'ACME', currency: 'USD' }]))[0].status
    ).toBe('unavailable');
    expect(ai.getQuotes).not.toHaveBeenCalled();
  });
});
