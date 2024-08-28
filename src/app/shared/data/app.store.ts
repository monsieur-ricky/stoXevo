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
import { IV_KEY, SALT_KEY, STORAGE_APP_DATA_KEY } from 'src/app/app.settings';

export type ApplicationState = {
  apiKey: string | null;
  pin: string | null;
  dataImportDate: string | null;
  showMenu: boolean;
};

const initialState: ApplicationState = {
  apiKey: null,
  pin: null,
  dataImportDate: null,
  showMenu: false
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

    const setPin = (pin: string): void => {
      patchState(store, {
        pin
      });

      getApiKey();
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

      storageService.set(STORAGE_APP_DATA_KEY, appData, store.pin());
    };

    const importData = async (
      data: ApplicationData | undefined
    ): Promise<void> => {
      if (!data) {
        return;
      }

      const { appData, salt, iv } = data;

      if (!appData && !salt && !iv) {
        return;
      }

      storageService.setPlainValue(STORAGE_APP_DATA_KEY, appData as string);
      storageService.setPlainValue(SALT_KEY, salt as string);
      storageService.setPlainValue(IV_KEY, iv as string);

      const decryptedAppData = await getDecryptedAppData();

      patchState(store, {
        apiKey: decryptedAppData?.apiKey,
        dataImportDate: new Date().toISOString()
      });
    };

    return {
      getDecryptedAppData,
      setShowMenu,
      setPin,
      getApiKey,
      setApiKey,
      importData
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
