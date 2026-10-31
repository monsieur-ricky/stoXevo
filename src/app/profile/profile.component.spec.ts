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

describe('profile route and HTTP resource integration', () => {
  let http: HttpTestingController;

  beforeEach(() => {
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
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));

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
});
