import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { STOXSCRAPER_API } from '@app';
import { MessageService } from '@openng/optimus-ui/api';
import { ProfileComponent } from './profile.component';
import { ApplicationStore } from '@shared/data';
import { AI_PRESETS } from '../shared/data/market-data/market-data.types';
import {
  openAiResponse,
  sourcedProfileFixture
} from '../../testing/ai-response.fixture';
import { MarketDataService } from '../shared/data/market-data/market-data.service';

describe('profile route and HTTP resource integration', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        provideRouter(
          [{ path: 'profile/:symbol', component: ProfileComponent }],
          withComponentInputBinding()
        )
      ]
    });
    http = TestBed.inject(HttpTestingController);
    const app = TestBed.inject(ApplicationStore);
    await app.setPin('1234');
    await app.setApiKey('synthetic-key');
  });
  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    localStorage.clear();
  });

  it('binds the route symbol and renders the resource result', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/profile/ACME',
      ProfileComponent
    );
    await vi.waitFor(() =>
      http.expectOne(`${STOXSCRAPER_API}/profile/ACME`).flush({
        name: 'Acme Corp',
        symbol: 'ACME',
        currency: 'EUR',
        price: 42
      })
    );
    await harness.fixture.whenStable();
    expect(component.loading()).toBe(false);
    expect(harness.routeNativeElement?.textContent).toContain('Acme Corp');
  });

  it('cancels a stale request when the symbol changes', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.componentRef.setInput('symbol', 'FIRST');
    let first: ReturnType<HttpTestingController['expectOne']> | undefined;
    await vi.waitFor(() => {
      first = http.expectOne(`${STOXSCRAPER_API}/profile/FIRST`);
    });
    fixture.componentRef.setInput('symbol', 'SECOND');
    await vi.waitFor(() => expect(first?.cancelled).toBe(true));
    await vi.waitFor(() =>
      http
        .expectOne(`${STOXSCRAPER_API}/profile/SECOND`)
        .flush({ symbol: 'SECOND', name: 'Second Corp' })
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Second Corp');
  });

  it('handles HTTP errors without reading a failed resource value', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const notify = vi.spyOn(TestBed.inject(MessageService), 'add');
    fixture.componentRef.setInput('symbol', 'MISSING');
    await vi.waitFor(() =>
      http
        .expectOne(`${STOXSCRAPER_API}/profile/MISSING`)
        .flush('Unavailable', { status: 503, statusText: 'Unavailable' })
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.profile()).toBeUndefined();
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    );
  });

  it('loads AI details with selected identity, sourced price/metrics and reusable quote', async () => {
    await TestBed.inject(ApplicationStore).setMarketDataSettings(
      { version: 1, source: 'ai', provider: 'openai', consent: true },
      'fixture-only'
    );
    const source = sourcedProfileFixture();
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/profile/ACME?currency=USD&exchange=Nasdaq&assetType=stock',
      ProfileComponent
    );
    await vi.waitFor(() => {
      const request = http.expectOne(AI_PRESETS.openai.endpoint);
      expect(request.request.body.input).toContain('"exchange":"Nasdaq"');
      expect(request.request.body.input).toContain('CEO');
      expect(request.request.body.tools[0].search_context_size).toBe('medium');
      request.flush(openAiResponse(source.answer));
    });
    await vi.waitFor(() => {
      const request = http.expectOne(AI_PRESETS.openai.endpoint);
      expect(request.request.body.text.format.schema.properties).toHaveProperty(
        'quotes'
      );
      request.flush(openAiResponse(JSON.stringify(source.payload), false));
    });
    await harness.fixture.whenStable();
    expect(component.loading()).toBe(false);
    expect(component.profile()).toMatchObject({
      price: 42,
      currency: 'USD',
      exchangeShortName: 'NASDAQ',
      ceo: 'Synthetic CEO',
      regularMarketDayHigh: 44,
      regularMarketDayLow: 40
    });
    expect(
      harness.routeNativeElement?.querySelector('[data-testid="current-price"]')
        ?.textContent
    ).toContain('$42.00');
    expect(harness.routeNativeElement?.textContent).toContain('Synthetic CEO');
    expect(harness.routeNativeElement?.textContent).toContain('50-Day Average');
    expect(harness.routeNativeElement?.textContent).toContain('Unavailable');
    const [cached] = await TestBed.inject(MarketDataService).getQuotes([
      { symbol: 'ACME', currency: 'USD', exchange: 'Nasdaq', type: 'stock' }
    ]);
    expect(cached.price).toBe(42);
    http.expectNone(AI_PRESETS.openai.endpoint);
  });

  it('renders explicit unavailable states for null financial fields', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.componentRef.setInput('symbol', 'EMPTY');
    await vi.waitFor(() =>
      http.expectOne(`${STOXSCRAPER_API}/profile/EMPTY`).flush({
        symbol: 'EMPTY',
        name: 'Empty profile',
        price: null,
        regularMarketDayHigh: null,
        regularMarketDayLow: null
      })
    );
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-testid="current-price"]')
        .textContent
    ).toContain('Unavailable');
    expect(fixture.nativeElement.textContent).not.toContain('undefined');
  });

  it.each([{ currency: 'EUR' }, { exchangeShortName: 'NYSE' }])(
    'rejects a profile that changes selected listing identity: %j',
    async mismatch => {
      await TestBed.inject(ApplicationStore).setMarketDataSettings(
        { version: 1, source: 'ai', provider: 'openai', consent: true },
        'fixture-only'
      );
      const source = sourcedProfileFixture();
      const harness = await RouterTestingHarness.create();
      const notify = vi.spyOn(TestBed.inject(MessageService), 'add');
      const component = await harness.navigateByUrl(
        '/profile/ACME?currency=USD&exchange=Nasdaq&assetType=stock',
        ProfileComponent
      );
      await vi.waitFor(() =>
        http
          .expectOne(AI_PRESETS.openai.endpoint)
          .flush(openAiResponse(source.answer))
      );
      await vi.waitFor(() =>
        http
          .expectOne(AI_PRESETS.openai.endpoint)
          .flush(
            openAiResponse(
              JSON.stringify({ ...source.payload, ...mismatch }),
              false
            )
          )
      );
      await harness.fixture.whenStable();
      expect(component.profile()).toBeUndefined();
      expect(component.loading()).toBe(false);
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );
    }
  );
});
