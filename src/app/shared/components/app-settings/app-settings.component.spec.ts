import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '@shared/data';
import { AppSettingsComponent } from './app-settings.component';

describe('market data settings UI', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    await TestBed.inject(ApplicationStore).setPin('1234');
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('defaults to AI, masks a session key, saves consent without network or persisted secrets', async () => {
    const fixture = TestBed.createComponent(AppSettingsComponent);
    fixture.componentInstance.openDialog.set(true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const key = host.querySelector<HTMLInputElement>('#ai-key')!;
    expect(key.type).toBe('password');
    expect(host.querySelector<HTMLSelectElement>('#market-source')?.value).toBe(
      'ai'
    );
    key.value = 'memory-secret';
    key.dispatchEvent(new Event('input'));
    host.querySelector<HTMLInputElement>('#ai-consent')!.click();
    await fixture.whenStable();
    const save = [...host.querySelectorAll('button')].find(
      button => button.textContent?.trim() === 'Save'
    )!;
    save.click();
    await fixture.whenStable();
    const app = TestBed.inject(ApplicationStore);
    await vi.waitFor(() => expect(app.canUseMarketData()).toBe(true));
    expect(app.aiKey()).toBe('memory-secret');
    expect(JSON.stringify(await app.getDecryptedAppData())).not.toContain(
      'memory-secret'
    );
    TestBed.inject(HttpTestingController).expectNone(request =>
      request.url.startsWith('https://')
    );
  });
  it('offers manual mode without requiring an API key', async () => {
    const fixture = TestBed.createComponent(AppSettingsComponent);
    fixture.componentInstance.openDialog.set(true);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector(
      '#market-source'
    ) as HTMLSelectElement;
    select.value = 'manual';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#ai-key')).toBeNull();
    const save = [
      ...(fixture.nativeElement.querySelectorAll(
        'button'
      ) as NodeListOf<HTMLButtonElement>)
    ].find(button => button.textContent?.trim() === 'Save')!;
    save.click();
    await fixture.whenStable();
    await vi.waitFor(() =>
      expect(TestBed.inject(ApplicationStore).marketData().source).toBe(
        'manual'
      )
    );
  });

  it('does not reset a scraper draft while its key is being saved', async () => {
    const app = TestBed.inject(ApplicationStore);
    await app.setMarketDataSettings({
      version: 1,
      source: 'ai',
      provider: 'openai',
      consent: false
    });
    const fixture = TestBed.createComponent(AppSettingsComponent);
    fixture.componentInstance.openDialog.set(true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const source = host.querySelector<HTMLSelectElement>('#market-source')!;
    source.value = 'stoxscraper';
    source.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const key = host.querySelector<HTMLInputElement>('#scraper-key')!;
    key.value = 'scraper-fixture';
    key.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    [...host.querySelectorAll('button')]
      .find(button => button.textContent?.trim() === 'Save')!
      .click();
    await vi.waitFor(() => expect(app.marketData().source).toBe('stoxscraper'));
    expect(app.apiKey()).toBe('scraper-fixture');
  });
});
