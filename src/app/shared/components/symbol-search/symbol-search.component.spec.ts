import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '@shared/data';
import { SymbolSearchService } from '@shared/data/api';
import { MessageService } from '@openng/optimus-ui/api';
import { SymbolSearchComponent } from './symbol-search.component';

describe('symbol search rendered autocomplete', () => {
  const search = vi.fn();
  const results = [
    {
      symbol: 'ACME',
      name: 'Acme',
      currency: 'USD',
      exchangeShortName: 'Nasdaq'
    }
  ];

  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    );
    search.mockReset().mockResolvedValue(results);
    TestBed.configureTestingModule({
      providers: [
        MessageService,
        {
          provide: ApplicationStore,
          useValue: { canUseMarketData: signal(true) }
        },
        { provide: SymbolSearchService, useValue: { searchSymbols: search } }
      ]
    });
  });
  afterEach(async () => {
    TestBed.resetTestingModule();
    // Optimus schedules one deferred overlay alignment outside Angular. Drain
    // that browser task before removing jsdom's matchMedia implementation.
    await new Promise(resolve => setTimeout(resolve, 0));
    vi.unstubAllGlobals();
  });

  it('finishes cached/repeated searches and accepts another query', async () => {
    const fixture = TestBed.createComponent(SymbolSearchComponent);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;
    for (const [index, query] of ['Apple', 'Apple', 'Microsoft'].entries()) {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.waitFor(() => expect(search).toHaveBeenCalledTimes(index + 1), {
        timeout: 2000
      });
      await fixture.whenStable();
      expect(search).toHaveBeenLastCalledWith(query, expect.any(AbortSignal));
      expect(
        fixture.nativeElement.querySelector('[data-p-icon="spinner"]')
      ).toBeNull();
    }
    expect(search).toHaveBeenCalledTimes(3);
  });

  it('stops loading on error and allows retrying the same query', async () => {
    search.mockRejectedValueOnce(new Error('Provider unavailable'));
    const fixture = TestBed.createComponent(SymbolSearchComponent);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;
    for (let attempt = 0; attempt < 2; attempt++) {
      input.value = 'Apple';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.waitFor(
        () => expect(search).toHaveBeenCalledTimes(attempt + 1),
        { timeout: 2000 }
      );
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector('[data-p-icon="spinner"]')
      ).toBeNull();
    }
    expect(search).toHaveBeenCalledTimes(2);
  });

  it.each(['clear', 'shorten', 'select'])(
    'cancels a pending search on %s and ignores its late result',
    async action => {
      let finish!: (value: typeof results) => void;
      search.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finish = resolve;
          })
      );
      const fixture = TestBed.createComponent(SymbolSearchComponent);
      await fixture.whenStable();
      const input = fixture.nativeElement.querySelector(
        'input'
      ) as HTMLInputElement;
      input.value = 'Apple';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.waitFor(() => expect(search).toHaveBeenCalledOnce(), {
        timeout: 2000
      });
      const signal = search.mock.calls[0][1] as AbortSignal;
      if (action === 'select') fixture.componentInstance.onSelect(results[0]);
      else {
        input.value = action === 'clear' ? '' : 'Ap';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      expect(signal.aborted).toBe(true);
      finish(results);
      await fixture.whenStable();
      expect(fixture.componentInstance.symbols()).toEqual([]);
      expect(
        fixture.nativeElement.querySelector('[data-p-icon="spinner"]')
      ).toBeNull();
      expect(search).toHaveBeenCalledOnce();
    }
  );
});
