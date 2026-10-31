import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { STORAGE_APP_DATA_KEY } from '@app';
import { PortfolioService } from '@shared/data/api';
import { Asset } from '@shared/models';
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
  const api = { getQuote: vi.fn(), getMetalQuote: vi.fn() };

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
    expect(api.getQuote).not.toHaveBeenCalled();
  });

  it('rejects duplicate symbols and releases the loading state', async () => {
    await store.addAsset(manualAsset());
    expect(await store.addAsset(manualAsset())).toBe(false);
    expect(store.assets()).toHaveLength(1);
    expect(store.loading()).toBe(false);
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
    store.removeAsset('ACME');
    expect(store.assets()).toEqual([]);
    expect(store.totalPercentageDifferenceSum()).toBe(0);
  });

  it('refreshes automatic quotes but leaves manual valuations unchanged', async () => {
    api.getQuote.mockResolvedValue({ price: 25 });
    await store.addAsset({
      ...manualAsset(),
      symbol: 'AUTO',
      manualUpdate: false
    });
    await store.addAsset(manualAsset());
    api.getQuote.mockResolvedValue({ price: 30 });
    await store.getQuotes();
    expect(store.assets().map(asset => asset.value)).toEqual([30, 15]);
    expect(api.getQuote).toHaveBeenCalledTimes(2);
  });
});
