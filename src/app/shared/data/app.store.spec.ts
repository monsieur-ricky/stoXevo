import { TestBed } from '@angular/core/testing';
import { IV_KEY, SALT_KEY, STORAGE_APP_DATA_KEY } from '@app';
import { LocalStorageService } from '@shared/services';
import { legacyBackup } from '../../../testing/backup.fixture';
import { ApplicationStore } from './app.store';

describe('application persistence integration', () => {
  let store: InstanceType<typeof ApplicationStore>;
  let storage: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(ApplicationStore);
    storage = TestBed.inject(LocalStorageService);
  });
  afterEach(() => localStorage.clear());

  it('unlocks persisted encrypted data and restores the API key', async () => {
    await storage.set(
      STORAGE_APP_DATA_KEY,
      { assets: [], apiKey: 'local-key' },
      '1234'
    );
    expect(await store.setPin('1234')).toBe(true);
    expect(store.pin()).toBe('1234');
    expect(store.apiKey()).toBe('local-key');
  });

  it('keeps the application locked and preserves data after a wrong PIN', async () => {
    await storage.set(
      STORAGE_APP_DATA_KEY,
      { assets: [], apiKey: 'secret' },
      '1234'
    );
    const before = { ...localStorage };
    expect(await store.setPin('9999')).toBe(false);
    expect(store.pin()).toBeNull();
    expect(store.apiKey()).toBeNull();
    expect({ ...localStorage }).toEqual(before);
  });

  it('imports a legacy encrypted backup before publishing the import signal', async () => {
    await store.setPin('1234');
    await store.importData(legacyBackup);
    expect(await store.getDecryptedAppData()).toEqual({
      assets: [],
      apiKey: 'fixture-only'
    });
    expect(store.apiKey()).toBe('fixture-only');
    expect(store.dataImportDate()).toBeTruthy();
    expect(localStorage.getItem(SALT_KEY)).toBe(legacyBackup.salt);
    expect(localStorage.getItem(IV_KEY)).toBe(legacyBackup.iv);
  });

  it('rejects incomplete and corrupt backups without changing existing data', async () => {
    await store.setPin('1234');
    await store.setApiKey('keep-me');
    const before = { ...localStorage };
    await expect(
      store.importData({ ...legacyBackup, salt: null })
    ).rejects.toThrow();
    await expect(
      store.importData({ ...legacyBackup, appData: 'corrupt' })
    ).rejects.toThrow();
    expect({ ...localStorage }).toEqual(before);
    expect(store.dataImportDate()).toBeNull();
    expect(store.apiKey()).toBe('keep-me');
  });

  it('rejects a backup encrypted with another PIN without replacing the current portfolio', async () => {
    await store.setPin('9999');
    await store.setApiKey('keep-me');
    const before = { ...localStorage };
    await expect(store.importData(legacyBackup)).rejects.toThrow();
    expect({ ...localStorage }).toEqual(before);
  });

  it('restores privacy and theme preferences', () => {
    storage.setPlainValue('showValues', 'false');
    storage.setPlainValue('isDarkMode', 'true');
    store.getShowValues();
    store.getDarkMode();
    expect(store.showValues()).toBe(false);
    expect(store.isDarkMode()).toBe(true);
  });

  it('keeps AI keys in memory only and requires unlock and consent', async () => {
    const settings = {
      version: 1,
      source: 'ai',
      provider: 'openai',
      consent: true
    } as const;
    await expect(
      store.setMarketDataSettings(settings, 'session-secret')
    ).rejects.toThrow('Unlock');
    await store.setPin('1234');
    await store.setMarketDataSettings(settings, 'session-secret');
    expect(store.canUseMarketData()).toBe(true);
    expect((await store.getDecryptedAppData())?.marketData).toEqual(settings);
    expect(JSON.stringify(await store.getDecryptedAppData())).not.toContain(
      'session-secret'
    );
    store.clearAiKey();
    expect(store.canUseMarketData()).toBe(false);
    await store.setPin('1234');
    expect(store.aiKey()).toBeNull();
  });

  it('serializes simultaneous settings, key and asset saves without losing fields', async () => {
    await store.setPin('1234');
    await Promise.all([
      store.updateAppData({ assets: [] }),
      store.setApiKey('legacy'),
      store.setMarketDataSettings(
        { version: 1, source: 'ai', provider: 'openrouter', consent: true },
        'memory-only'
      )
    ]);
    expect(await store.getDecryptedAppData()).toEqual({
      assets: [],
      apiKey: 'legacy',
      marketData: {
        version: 1,
        source: 'ai',
        provider: 'openrouter',
        consent: true
      }
    });
  });

  it('clears session credentials on provider changes and imports', async () => {
    await store.setPin('1234');
    await store.setMarketDataSettings(
      { version: 1, source: 'ai', provider: 'openai', consent: true },
      'secret'
    );
    await store.setMarketDataSettings({
      version: 1,
      source: 'ai',
      provider: 'anthropic',
      consent: true
    });
    expect(store.aiKey()).toBeNull();
    await store.importData(legacyBackup);
    expect(store.marketData().source).toBe('stoxscraper');
    expect(store.aiKey()).toBeNull();
  });
});
