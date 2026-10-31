import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PortfolioStore } from '@shared/data';
import { MessageService } from '@openng/optimus-ui/api';
import { DetailsComponent } from './details.component';

describe('asset details form integration', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        MessageService
      ]
    });
  });

  afterEach(() => localStorage.clear());

  it('opens a manual-entry drawer and saves a new asset through its rendered button', async () => {
    const fixture = TestBed.createComponent(DetailsComponent);
    fixture.componentRef.setInput('openSidebar', true);
    await fixture.whenStable();
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
});
