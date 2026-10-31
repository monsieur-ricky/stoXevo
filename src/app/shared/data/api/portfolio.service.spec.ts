import {
  provideHttpClient,
  withInterceptors,
  withXhr
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

describe('stoXscraper HTTP integration', () => {
  let http: HttpTestingController;
  let service: PortfolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: ApplicationStore,
          useValue: { apiKey: () => 'test-api-key' }
        }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PortfolioService);
  });

  afterEach(() => http.verify());

  it('fetches a quote with the configured API key', async () => {
    const quote = service.getQuote('ACME');
    const request = http.expectOne(`${STOXSCRAPER_API}/quote/ACME`);
    expect(request.request.headers.get('stoxscraper-api-key')).toBe(
      'test-api-key'
    );
    expect(request.request.method).toBe('GET');
    request.flush({ symbol: 'ACME', price: 42 });
    expect(await quote).toEqual({ symbol: 'ACME', price: 42 });
  });

  it('uses the metal endpoint', async () => {
    const quote = service.getMetalQuote('gold');
    http
      .expectOne(`${STOXSCRAPER_API}/quote/metal/gold`)
      .flush({ pricePerGramEuro: 80 });
    expect(await quote).toEqual({ pricePerGramEuro: 80 });
  });

  it('propagates API errors to the caller', async () => {
    const quote = service.getQuote('ACME');
    const assertion = expect(quote).rejects.toMatchObject({ status: 503 });
    http
      .expectOne(`${STOXSCRAPER_API}/quote/ACME`)
      .flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
});
