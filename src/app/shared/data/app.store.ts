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

export type ApplicationState = {
  apiKey: string | null;
  pin: string | null;
  dataImportDate: string | null;
  showMenu: boolean;
  showValues: boolean;
  isDarkMode: boolean;
};

const initialState: ApplicationState = {
  apiKey: null,
  pin: null,
  dataImportDate: null,
  showMenu: false,
  showValues: true,
  isDarkMode: false
};

export const ApplicationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, storageService = inject(LocalStorageService)) => {
    const getDecryptedAppData = async (): Promise<EncryptedAppData | null> =>
      await storageService.get<EncryptedAppData>(
        STORAGE_APP_DATA_KEY,
        store.pin()
      );

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
        patchState(store, { pin, apiKey: data?.apiKey ?? null });
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
      patchState(store, {
        apiKey: key
      });

      const decryptedAppData = await getDecryptedAppData();
      const appData = { ...decryptedAppData, apiKey: key };

      await storageService.set(STORAGE_APP_DATA_KEY, appData, store.pin());
    };

    const importData = async (
      data: ApplicationData | undefined
    ): Promise<void> => {
      const pin = store.pin();
      if (!data || !pin)
        throw new Error('Unlock the application before importing a backup.');
      const decryptedAppData = await readBackup(data, pin);
      const { appData, salt, iv } = data;

      storageService.setPlainValue(STORAGE_APP_DATA_KEY, appData as string);
      storageService.setPlainValue(SALT_KEY, salt as string);
      storageService.setPlainValue(IV_KEY, iv as string);

      patchState(store, {
        apiKey: decryptedAppData.apiKey ?? null,
        dataImportDate: new Date().toISOString()
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
      isMobile
    };
  })
);
