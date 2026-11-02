import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { STOXSCRAPER_API } from '@app';
import { ApplicationStore } from '@shared/data';
import { authInterceptor } from '@shared/interceptors';
import { PortfolioService } from './portfolio.service';

describe('stoXscraper HTTP integration through selected provider', () => {
  let http: HttpTestingController;
  let service: PortfolioService;
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    const app = TestBed.inject(ApplicationStore);
    await app.setPin('1234');
    await app.setApiKey('test-api-key');
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PortfolioService);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('fetches a quote with only the scraper API key', async () => {
    const quote = service.getQuotes([{ symbol: 'ACME', currency: 'EUR' }]);
    const request = http.expectOne(`${STOXSCRAPER_API}/quote/ACME`);
    expect(request.request.headers.get('stoxscraper-api-key')).toBe(
      'test-api-key'
    );
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ symbol: 'ACME', price: 42 });
    expect(await quote).toMatchObject([{ status: 'ok', price: 42 }]);
  });
  it('keeps the existing scraper metal endpoint', async () => {
    const quote = service.getQuotes([
      { symbol: 'GOLD', currency: 'EUR', type: 'commodity', metal: 'gold' }
    ]);
    http
      .expectOne(`${STOXSCRAPER_API}/quote/metal/gold`)
      .flush({ pricePerGramEuro: 80 });
    expect(await quote).toMatchObject([{ status: 'ok', price: 80 }]);
  });
  it('never sends the scraper key to another origin', () => {
    TestBed.inject(HttpClient)
      .get('https://example.test/unrelated')
      .subscribe();
    const request = http.expectOne('https://example.test/unrelated');
    expect(request.request.headers.has('stoxscraper-api-key')).toBe(false);
    request.flush({});
  });
  it('isolates errors and invalid metal data instead of generating zero', async () => {
    const quote = service.getQuotes([
      { symbol: 'ACME', currency: 'EUR' },
      { symbol: 'GOLD', currency: 'EUR', type: 'commodity', metal: 'gold' }
    ]);
    http
      .expectOne(`${STOXSCRAPER_API}/quote/ACME`)
      .flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    http.expectOne(`${STOXSCRAPER_API}/quote/metal/gold`).flush({});
    expect((await quote).map(item => item.status)).toEqual([
      'unavailable',
      'unavailable'
    ]);
  });
});
