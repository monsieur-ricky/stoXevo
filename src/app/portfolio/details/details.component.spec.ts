import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { ApplicationStore, PortfolioStore } from '@shared/data';
import { MessageService } from '@openng/optimus-ui/api';
import { DetailsComponent } from './details.component';
import { SymbolSearchComponent } from '../../shared/components/symbol-search/symbol-search.component';
import { AI_PRESETS } from '../../shared/data/market-data/market-data.types';
import {
  openAiResponse,
  sourcedProfileFixture
} from '../../../testing/ai-response.fixture';

describe('asset details form integration', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        MessageService
      ]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('opens a manual-entry drawer and saves a new asset through its rendered button', async () => {
    const warn = vi.spyOn(console, 'warn');
    const fixture = TestBed.createComponent(DetailsComponent);
    fixture.componentRef.setInput('openSidebar', true);
    await fixture.whenStable();
    expect(warn.mock.calls.flat().join(' ')).not.toContain('NG01354');
    warn.mockRestore();
    const form = fixture.componentInstance.assetForm;
    form.patchValue({
      symbol: 'MANUAL',
      name: 'Manual asset',
      currency: 'EUR',
      exchangeShortName: 'LOCAL',
      value: 15,
      purchase: { date: new Date('2026-01-01'), price: 10, quantity: 2 }
    });
    expect(form.valid).toBe(true);
    expect(form.get('manualUpdate')?.value).toBe(true);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const add = buttons.find(button => button.textContent?.trim() === 'Add');
    expect(add).toBeDefined();
    add!.click();
    await fixture.whenStable();

    const store = TestBed.inject(PortfolioStore);
    await vi.waitFor(() => expect(store.assets()).toHaveLength(1));
    expect(store.assets()[0]).toMatchObject({
      symbol: 'MANUAL',
      manualUpdate: true,
      quantity: 2,
      purchasePrice: 10
    });
    expect(fixture.componentInstance.openSidebar()).toBe(false);
  });

  it('does not save an incomplete form', async () => {
    const fixture = TestBed.createComponent(DetailsComponent);
    fixture.componentRef.setInput('openSidebar', true);
    await fixture.whenStable();
    fixture.componentInstance.onSave();
    expect(TestBed.inject(PortfolioStore).assets()).toEqual([]);
    expect(fixture.componentInstance.assetForm.get('symbol')?.dirty).toBe(true);
  });

  const openAutomaticForm = async () => {
    const app = TestBed.inject(ApplicationStore);
    await app.setPin('1234');
    await app.setMarketDataSettings(
      { version: 1, source: 'ai', provider: 'openai', consent: true },
      'fixture-only'
    );
    const fixture = TestBed.createComponent(DetailsComponent);
    fixture.componentRef.setInput('openSidebar', true);
    await fixture.whenStable();
    const search = fixture.debugElement.query(
      By.directive(SymbolSearchComponent)
    ).componentInstance as SymbolSearchComponent;
    search.selected.emit({
      symbol: 'ACME',
      name: 'Acme Corp',
      currency: 'USD',
      exchangeShortName: 'Nasdaq',
      type: 'stock'
    });
    fixture.componentInstance.assetForm.patchValue({
      purchase: { date: new Date('2026-11-02'), price: 35, quantity: 5 }
    });
    await fixture.whenStable();
    return fixture;
  };

  it('adds a searched asset using a valid multiline AI quote, without a manual price', async () => {
    const fixture = await openAutomaticForm();
    const source = sourcedProfileFixture();
    const http = TestBed.inject(HttpTestingController);
    const form = fixture.componentInstance.assetForm;
    expect(form.get('value')?.disabled).toBe(true);
    expect(form.valid).toBe(true);
    const add = [
      ...(fixture.nativeElement.querySelectorAll(
        'button'
      ) as NodeListOf<HTMLButtonElement>)
    ].find(button => button.textContent?.trim() === 'Add')!;
    add.click();
    const request = http.expectOne(AI_PRESETS.openai.endpoint);
    expect(JSON.stringify(request.request.body)).not.toContain('quantity');
    expect(JSON.stringify(request.request.body)).not.toContain('purchasePrice');
    request.flush(openAiResponse(source.quoteText));
    await vi.waitFor(() =>
      http
        .expectOne(AI_PRESETS.openai.endpoint)
        .flush(
          openAiResponse(JSON.stringify({ quotes: [source.quote] }), false)
        )
    );
    const store = TestBed.inject(PortfolioStore);
    await vi.waitFor(() => expect(store.assets()).toHaveLength(1));
    expect(store.assets()[0]).toMatchObject({
      symbol: 'ACME',
      value: 42,
      purchasePrice: 35,
      quantity: 5,
      manualUpdate: false
    });
    expect(store.saveError()).toBeNull();
    await fixture.whenStable();
    expect(fixture.componentInstance.openSidebar()).toBe(false);
  });

  it('preserves the selected instrument type instead of pricing every search result as a stock', async () => {
    const fixture = await openAutomaticForm();
    fixture.componentInstance.onSymbolSelected({
      symbol: 'COIN-USD',
      name: 'Synthetic coin',
      currency: 'USD',
      exchangeShortName: 'Synthetic exchange',
      type: 'crypto'
    });
    expect(fixture.componentInstance.assetForm.getRawValue()).toMatchObject({
      type: 'crypto',
      symbol: 'COIN-USD',
      currency: 'USD'
    });
    expect(fixture.componentInstance.assetForm.get('value')?.disabled).toBe(
      true
    );
  });

  it('explains a rejected quote, keeps the form and permits manual-price recovery without another AI call', async () => {
    const fixture = await openAutomaticForm();
    const source = sourcedProfileFixture();
    const http = TestBed.inject(HttpTestingController);
    const buttons = () => [
      ...(fixture.nativeElement.querySelectorAll(
        'button'
      ) as NodeListOf<HTMLButtonElement>)
    ];
    buttons()
      .find(button => button.textContent?.trim() === 'Add')!
      .click();
    http
      .expectOne(AI_PRESETS.openai.endpoint)
      .flush(openAiResponse(source.quoteText));
    await vi.waitFor(() =>
      http.expectOne(AI_PRESETS.openai.endpoint).flush(
        openAiResponse(
          JSON.stringify({
            quotes: [{ ...source.quote, marketAsOf: '2020-01-01T00:00:00Z' }]
          }),
          false
        )
      )
    );
    const store = TestBed.inject(PortfolioStore);
    await vi.waitFor(() => expect(store.saveError()).toContain('Stale'));
    await fixture.whenStable();
    expect(fixture.componentInstance.openSidebar()).toBe(true);
    expect(store.assets()).toHaveLength(0);
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent
    ).toContain('Stale');
    buttons()
      .find(button =>
        button.textContent?.includes('Enter a manual current price')
      )!
      .click();
    await fixture.whenStable();
    const form = fixture.componentInstance.assetForm;
    expect(form.get('value')?.enabled).toBe(true);
    expect(form.get('symbol')?.value).toBe('ACME');
    form.patchValue({ value: 41 });
    buttons()
      .find(button => button.textContent?.trim() === 'Add')!
      .click();
    await vi.waitFor(() => expect(store.assets()).toHaveLength(1));
    expect(store.assets()[0]).toMatchObject({ value: 41, manualUpdate: true });
    http.expectNone(AI_PRESETS.openai.endpoint);
  });
});
