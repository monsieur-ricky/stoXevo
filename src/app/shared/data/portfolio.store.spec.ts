import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { STORAGE_APP_DATA_KEY } from '@app';
import { PortfolioService } from '@shared/data/api';
import { Asset } from '@shared/models';
import { LocalStorageService } from '@shared/services';
import { MessageService } from '@openng/optimus-ui/api';
import { ApplicationStore } from './app.store';
import { PortfolioStore } from './portfolio.store';

const manualAsset = (): Asset => ({
  symbol: 'ACME',
  name: 'Acme',
  currency: 'EUR',
  type: 'stock',
  purchaseDate: '2026-01-01T00:00:00.000Z',
  purchasePrice: 10,
  quantity: 2,
  value: 15,
  manualUpdate: true,
  purchases: [{ date: '2026-01-01T00:00:00.000Z', price: 10, quantity: 2 }]
});

describe('portfolio store integration', () => {
  let store: InstanceType<typeof PortfolioStore>;
  let app: InstanceType<typeof ApplicationStore>;
  const api = { getQuotes: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: PortfolioService, useValue: api }
      ]
    });
    store = TestBed.inject(PortfolioStore);
    app = TestBed.inject(ApplicationStore);
  });

  afterEach(() => localStorage.clear());

  it('adds manual assets, computes totals and saves them locally without HTTP', async () => {
    expect(await store.addAsset(manualAsset())).toBe(true);
    await vi.waitFor(() =>
      expect(localStorage.getItem(STORAGE_APP_DATA_KEY)).toBeTruthy()
    );
    expect(store.totalInvestmentSum()).toBe(20);
    expect(store.totalValueSum()).toBe(30);
    expect(store.totalValueDifferenceSum()).toBe(10);
    expect(store.totalPercentageDifferenceSum()).toBe(0.5);
    expect((await app.getDecryptedAppData())?.assets).toEqual([manualAsset()]);
    expect(api.getQuotes).not.toHaveBeenCalled();
  });

  it('rejects duplicate symbols and releases the loading state', async () => {
    await store.addAsset(manualAsset());
    expect(await store.addAsset(manualAsset())).toBe(false);
    expect(store.assets()).toHaveLength(1);
    expect(store.loading()).toBe(false);
  });

  it('keeps a failed save out of state and permits retry without a phantom duplicate', async () => {
    const persist = vi
      .spyOn(app, 'updateAppData')
      .mockRejectedValueOnce(new Error('Storage quota exceeded'));
    expect(await store.addAsset(manualAsset())).toBe(false);
    expect(store.assets()).toEqual([]);
    expect(store.asset()).toBeUndefined();
    expect(store.loading()).toBe(false);
    expect(store.saveError()).toContain('browser storage');
    expect(await store.addAsset(manualAsset())).toBe(true);
    expect(store.assets()).toEqual([manualAsset()]);
    expect(store.saveError()).toBeNull();
    expect(persist).toHaveBeenCalledTimes(2);
    expect((await app.getDecryptedAppData())?.assets).toEqual([manualAsset()]);
    persist.mockRestore();
  });

  it('recalculates weighted purchase totals when an asset is updated', async () => {
    const asset = manualAsset();
    await store.addAsset(asset);
    await store.updateAsset({
      ...asset,
      purchases: [
        ...asset.purchases,
        { date: '2026-02-01T00:00:00.000Z', price: 20, quantity: 6 }
      ]
    });
    expect(store.asset()?.quantity).toBe(8);
    expect(store.asset()?.purchasePrice).toBe(17.5);
    expect(store.totalInvestmentSum()).toBe(140);
  });

  it('removes assets and handles empty-portfolio percentages', async () => {
    await store.addAsset(manualAsset());
    await store.removeAsset('ACME');
    expect(store.assets()).toEqual([]);
    expect(store.totalPercentageDifferenceSum()).toBe(0);
  });

  it('loads legacy single-purchase assets without making HTTP requests when no API key is set', async () => {
    const asset = { ...manualAsset(), purchases: [] };
    await TestBed.inject(LocalStorageService).set(STORAGE_APP_DATA_KEY, {
      assets: [asset],
      apiKey: null
    });
    await store.getAssets();
    expect(store.assets()[0].purchases).toEqual(manualAsset().purchases);
    expect(store.loading()).toBe(false);
    expect(api.getQuotes).not.toHaveBeenCalled();
  });

  it('refreshes automatic quotes but leaves manual valuations unchanged', async () => {
    api.getQuotes.mockImplementation(instruments =>
      Promise.resolve(
        instruments.map((instrument: unknown) => ({
          instrument,
          status: 'ok',
          price: 25
        }))
      )
    );
    await store.addAsset({
      ...manualAsset(),
      symbol: 'AUTO',
      manualUpdate: false
    });
    await store.addAsset(manualAsset());
    api.getQuotes.mockImplementation(instruments =>
      Promise.resolve(
        instruments.map((instrument: unknown) => ({
          instrument,
          status: 'ok',
          price: 30
        }))
      )
    );
    await store.getQuotes();
    expect(store.assets().map(asset => asset.value)).toEqual([30, 15]);
    expect(api.getQuotes).toHaveBeenCalledTimes(2);
  });

  it('keeps the portfolio unchanged and releases loading after a failed quote request', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    api.getQuotes.mockRejectedValue(new Error('Scraper unavailable'));
    expect(
      await store.addAsset({ ...manualAsset(), manualUpdate: false })
    ).toBe(false);
    expect(store.assets()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('applies partial batch successes and keeps unavailable valuations', async () => {
    await store.addAsset(manualAsset());
    await store.addAsset({ ...manualAsset(), symbol: 'OTHER' });
    await store.updateAsset({ ...store.assets()[0], manualUpdate: false });
    await store.updateAsset({ ...store.assets()[1], manualUpdate: false });
    api.getQuotes.mockImplementation(instruments =>
      Promise.resolve(
        instruments.map((instrument: unknown, index: number) => ({
          instrument,
          status: index ? 'unavailable' : 'ok',
          price: index ? undefined : 50
        }))
      )
    );
    await store.getQuotes();
    expect(store.assets().map(asset => asset.value)).toEqual([50, 15]);
    expect(store.assets()[1].quoteStatus).toBe('unavailable');
    expect(api.getQuotes).toHaveBeenCalledOnce();
    expect(JSON.stringify(api.getQuotes.mock.calls)).not.toContain('purchases');
  });

  it('does not resurrect a deleted asset after a refresh finishes', async () => {
    await store.addAsset(manualAsset());
    await store.updateAsset({ ...manualAsset(), manualUpdate: false });
    let finish!: (value: unknown) => void;
    api.getQuotes.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        })
    );
    const refresh = store.getQuotes();
    await store.removeAsset('ACME');
    finish([]);
    await refresh;
    expect(store.assets()).toEqual([]);
  });
});
