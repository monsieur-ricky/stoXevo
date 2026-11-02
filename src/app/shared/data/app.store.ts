import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { ApplicationData, EncryptedAppData } from '@shared/models';
import { LocalStorageService } from '@shared/services';
import { map } from 'rxjs';
import { readBackup } from '@shared/utils';
import { IV_KEY, SALT_KEY, STORAGE_APP_DATA_KEY } from '@app';
import {
  AI_PRESETS,
  DEFAULT_MARKET_DATA_SETTINGS,
  MarketDataSettings,
  readMarketDataSettings
} from './market-data/market-data.types';

export type ApplicationState = {
  apiKey: string | null;
  pin: string | null;
  dataImportDate: string | null;
  showMenu: boolean;
  showValues: boolean;
  isDarkMode: boolean;
  marketData: MarketDataSettings;
  aiKey: string | null;
  marketDataRevision: number;
};

const initialState: ApplicationState = {
  apiKey: null,
  pin: null,
  dataImportDate: null,
  showMenu: false,
  showValues: true,
  isDarkMode: false,
  marketData: { ...DEFAULT_MARKET_DATA_SETTINGS },
  aiKey: null,
  marketDataRevision: 0
};

export const ApplicationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, storageService = inject(LocalStorageService)) => {
    // One writer owns the shared ciphertext/salt/IV envelope. Recover the queue
    // after failures so a quota error does not poison subsequent writes.
    let pending: Promise<unknown> = Promise.resolve();
    const serialize = <T>(work: () => Promise<T>): Promise<T> => {
      const result = pending.then(work);
      pending = result.catch(() => undefined);
      return result;
    };
    const getDecryptedAppData = async (): Promise<EncryptedAppData | null> =>
      await storageService.get<EncryptedAppData>(
        STORAGE_APP_DATA_KEY,
        store.pin()
      );

    const updateAppData = (change: Partial<EncryptedAppData>): Promise<void> =>
      serialize(async () => {
        const current = await getDecryptedAppData();
        await storageService.set(
          STORAGE_APP_DATA_KEY,
          { ...current, ...change },
          store.pin()
        );
      });

    const setMarketDataSettings = async (
      settings: MarketDataSettings,
      sessionKey?: string
    ): Promise<void> => {
      if (!store.pin())
        throw new Error(
          'Unlock the application before configuring market data.'
        );
      const valid = readMarketDataSettings(settings);
      await updateAppData({ marketData: valid });
      const sameProvider = store.marketData().provider === valid.provider;
      patchState(store, {
        marketData: valid,
        aiKey:
          valid.source === 'ai' && valid.consent
            ? sessionKey?.trim() || (sameProvider ? store.aiKey() : null)
            : null,
        marketDataRevision: store.marketDataRevision() + 1
      });
    };

    const clearAiKey = (): void =>
      patchState(store, {
        aiKey: null,
        marketDataRevision: store.marketDataRevision() + 1
      });

    const setShowMenu = (show: boolean): void => {
      patchState(store, {
        showMenu: show
      });
    };

    const setPin = async (pin: string): Promise<boolean> => {
      try {
        const data = await storageService.get<EncryptedAppData>(
          STORAGE_APP_DATA_KEY,
          pin
        );
        const marketData = readMarketDataSettings(
          data?.marketData,
          data?.apiKey
        );
        patchState(store, {
          pin,
          apiKey: data?.apiKey ?? null,
          marketData:
            marketData.source === 'ai'
              ? { ...marketData, consent: false }
              : marketData,
          aiKey: null,
          marketDataRevision: store.marketDataRevision() + 1
        });
        return true;
      } catch {
        return false;
      }
    };

    const getApiKey = async (): Promise<void> => {
      const decryptedAppData = await getDecryptedAppData();

      patchState(store, {
        apiKey: decryptedAppData?.apiKey
      });
    };

    const setApiKey = async (key: string): Promise<void> => {
      await updateAppData({ apiKey: key });
      const persisted = await getDecryptedAppData();
      patchState(store, {
        apiKey: key,
        marketData: persisted?.marketData
          ? store.marketData()
          : readMarketDataSettings(undefined, key),
        marketDataRevision: store.marketDataRevision() + 1
      });
    };

    const importData = async (
      data: ApplicationData | undefined
    ): Promise<void> => {
      const pin = store.pin();
      if (!data || !pin)
        throw new Error('Unlock the application before importing a backup.');
      await serialize(async () => {
        const decryptedAppData = await readBackup(data, pin);
        const { appData, salt, iv } = data;
        storageService.setPlainValue(STORAGE_APP_DATA_KEY, appData as string);
        storageService.setPlainValue(SALT_KEY, salt as string);
        storageService.setPlainValue(IV_KEY, iv as string);
        const marketData = readMarketDataSettings(
          decryptedAppData.marketData,
          decryptedAppData.apiKey
        );
        patchState(store, {
          apiKey: decryptedAppData.apiKey ?? null,
          marketData:
            marketData.source === 'ai'
              ? { ...marketData, consent: false }
              : marketData,
          aiKey: null,
          marketDataRevision: store.marketDataRevision() + 1,
          dataImportDate: new Date().toISOString()
        });
      });
    };

    const setShowValues = (showValues: boolean): void => {
      patchState(store, { showValues });

      storageService.setPlainValue('showValues', showValues.toString());
    };

    const getShowValues = (): void => {
      const showValues = storageService.getPlainValue('showValues');

      patchState(store, { showValues: showValues === 'true' });
    };

    const setDarkMode = (isDarkMode: boolean): void => {
      patchState(store, { isDarkMode });

      storageService.setPlainValue('isDarkMode', isDarkMode.toString());
    };

    const getDarkMode = (): void => {
      const isDarkMode = storageService.getPlainValue('isDarkMode');

      patchState(store, { isDarkMode: isDarkMode === 'true' });
    };

    return {
      getDecryptedAppData,
      updateAppData,
      setMarketDataSettings,
      clearAiKey,
      setShowMenu,
      setPin,
      getApiKey,
      setApiKey,
      importData,
      setShowValues,
      getShowValues,
      setDarkMode,
      getDarkMode
    };
  }),

  withComputed(store => {
    const responsive = inject(BreakpointObserver);
    const smWidth = '(max-width: 576px)';
    const portrait = '(orientation: portrait)';

    const isApiKeySet = computed(() => !!store.apiKey());
    const canUseMarketData = computed(() => {
      const settings = store.marketData();
      if (!store.pin()) return false;
      return settings.source === 'stoxscraper'
        ? !!store.apiKey()
        : settings.source === 'ai' &&
            settings.consent &&
            !!store.aiKey() &&
            AI_PRESETS[settings.provider].available;
    });
    const canUseMetals = computed(
      () =>
        !!store.pin() &&
        (store.marketData().source === 'stoxscraper'
          ? !!store.apiKey()
          : store.marketData().source === 'ai' && store.marketData().consent)
    );

    const isMobile = toSignal(
      responsive
        .observe([smWidth, portrait])
        .pipe(
          map(
            state => state.breakpoints[smWidth] && state.breakpoints[portrait]
          )
        ),
      { initialValue: false }
    );

    return {
      isApiKeySet,
      canUseMarketData,
      canUseMetals,
      isMobile
    };
  })
);
