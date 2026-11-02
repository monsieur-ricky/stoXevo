import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '../app.store';
import { MetalsService } from './metals.service';

describe('existing Gold-API source integration', () => {
  let app: InstanceType<typeof ApplicationStore>;
  let http: HttpTestingController;
  let service: MetalsService;
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    app = TestBed.inject(ApplicationStore);
    service = TestBed.inject(MetalsService);
    await app.setPin('1234');
    await app.setMarketDataSettings({
      version: 1,
      source: 'ai',
      provider: 'openai',
      consent: true
    });
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('uses keyless JSON, coalesces requests and converts troy ounces in code', async () => {
    const first = service.getQuote('gold', 'EUR');
    const second = service.getQuote('gold', 'EUR');
    expect(second).toBe(first);
    await Promise.resolve();
    const request = http.expectOne('https://api.gold-api.com/price/XAU/EUR');
    expect(request.request.headers.keys()).toEqual([]);
    request.flush({
      symbol: 'XAU',
      currency: 'EUR',
      price: 3110.35,
      updatedAt: new Date().toISOString()
    });
    expect(await first).toMatchObject({ status: 'ok', price: 100 });
    expect(await service.getQuote('gold', 'EUR')).toEqual(await first);
  });
  it('rejects stale and unsupported data without fabricating zero', async () => {
    await expect(service.getQuote('gold', 'JPY')).rejects.toThrow(
      'Unsupported'
    );
    const result = service.getQuote('silver', 'USD');
    const assertion = expect(result).rejects.toThrow('stale');
    await Promise.resolve();
    http
      .expectOne('https://api.gold-api.com/price/XAG/USD')
      .flush({
        symbol: 'XAG',
        currency: 'USD',
        price: 50,
        updatedAt: '2020-01-01T00:00:00Z'
      });
    await assertion;
  });
  it('requires consent even though no model key is needed', async () => {
    await app.setMarketDataSettings({
      version: 1,
      source: 'ai',
      provider: 'openai',
      consent: false
    });
    await expect(service.getQuote('gold', 'EUR')).rejects.toThrow('consent');
  });
});
