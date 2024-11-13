import { computed, inject } from '@angular/core';
import { STORAGE_APP_DATA_KEY } from '@app';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { ApplicationStore } from '@shared/data';
import { PortfolioService } from '@shared/data/api';
import { Asset } from '@shared/models';
import { LocalStorageService } from '@shared/services';
import { getMetalPriceFromCurrency } from '@shared/utils';
import { MessageService } from 'primeng/api';

export type PortfolioState = {
  assets: Asset[];
  asset: Asset | undefined;
  loading: boolean;
  initialLoadDone: boolean;
};

const initialState: PortfolioState = {
  assets: [],
  asset: undefined,
  loading: false,
  initialLoadDone: false
};

export const PortfolioStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withState(initialState),

  withMethods(
    (
      store,
      portfolioService = inject(PortfolioService),
      storageService = inject(LocalStorageService),
      appStore = inject(ApplicationStore),
      messageService = inject(MessageService)
    ) => {
      const pin = appStore.pin;

      const storeAssets = async (): Promise<void> => {
        const decryptedAppData = await appStore.getDecryptedAppData();
        const appData = { ...decryptedAppData, assets: store.assets() };

        storageService.set(STORAGE_APP_DATA_KEY, appData, pin());
      };

      const setAsset = (asset: Asset | undefined): void => {
        patchState(store, {
          asset,
          loading: false
        });
      };

      const getAssets = async (): Promise<void> => {
        const decryptedAppData = await appStore.getDecryptedAppData();
        const assets = (decryptedAppData?.assets as Asset[]) ?? [];

        patchState(store, {
          assets,
          asset: undefined,
          loading: false
        });

        if (!store.initialLoadDone()) {
          getQuotes(false);
          patchState(store, { initialLoadDone: true });
        }
      };

      const addAsset = async (asset: Asset): Promise<void> => {
        patchState(store, { loading: true });

        try {
          if (!asset.manualUpdate) {
            if (asset.type === 'commodity') {
              const quote = await portfolioService.getMetalQuote(asset.subType);
              const price = getMetalPriceFromCurrency(quote, asset.currency);

              asset = { ...asset, value: price ?? asset.value };
            } else {
              const quote = await portfolioService.getQuote(asset.symbol);

              asset = { ...asset, value: quote?.price ?? asset.value };
            }
          }

          patchState(store, { asset, assets: [...store.assets(), asset] });

          storeAssets();

          messageService.add({
            severity: 'success',
            summary: 'Yay!',
            detail: 'Asset was added to portfolio!'
          });
        } catch (error) {
          console.error(error);
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: 'Failed to add the asset to the portfolio!'
          });
        } finally {
          patchState(store, { loading: false });
        }
      };

      const updateAsset = async (updatedAsset: Asset): Promise<void> => {
        patchState(store, { loading: true });

        try {
          if (!updatedAsset.manualUpdate) {
            if (updatedAsset.type === 'commodity') {
              const quote = await portfolioService.getMetalQuote(
                updatedAsset.subType
              );
              const price = getMetalPriceFromCurrency(
                quote,
                updatedAsset.currency
              );

              updatedAsset = {
                ...updatedAsset,
                value: price ?? updatedAsset.value
              };
            } else {
              const quote = await portfolioService.getQuote(
                updatedAsset.symbol
              );
              updatedAsset = {
                ...updatedAsset,
                value: quote?.price ?? updatedAsset.value
              };
            }
          }

          patchState(store, {
            asset: updatedAsset,
            assets: store
              .assets()
              .map(asset =>
                asset.symbol === updatedAsset.symbol ? updatedAsset : asset
              )
          });

          storeAssets();

          messageService.add({
            severity: 'success',
            summary: 'Yay!',
            detail: 'Asset was updated!'
          });
        } catch (error) {
          console.error(error);
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: 'Failed to update the asset!'
          });
        } finally {
          patchState(store, { loading: false });
        }
      };

      const removeAsset = (symbol: string): void => {
        patchState(store, {
          assets: store.assets().filter(asset => asset.symbol !== symbol)
        });

        storeAssets();

        messageService.add({
          severity: 'success',
          summary: 'Yay!',
          detail: 'The Asset was removed from the portfolio!'
        });
      };

      const getQuotes = async (showSuccessMessage = true): Promise<void> => {
        patchState(store, { loading: true });

        try {
          const updatedAssets: Asset[] = [];

          for (const asset of store.assets()) {
            if (asset.manualUpdate) {
              updatedAssets.push(asset);
              continue;
            }

            if (asset.type === 'commodity') {
              const quote = await portfolioService.getMetalQuote(asset.subType);
              const price = getMetalPriceFromCurrency(quote, asset.currency);

              updatedAssets.push({ ...asset, value: price ?? asset.value });
            } else {
              const quote = await portfolioService.getQuote(asset.symbol);

              updatedAssets.push({
                ...asset,
                value: quote?.price ?? asset.value
              });
            }
          }

          patchState(store, {
            assets: updatedAssets
          });

          storeAssets();

          if (showSuccessMessage) {
            messageService.add({
              severity: 'success',
              summary: 'Yay!',
              detail: 'Portfolio quotes were updated!'
            });
          }
        } catch (error: any) {
          console.error(error);
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: error.error['Error Message'] ?? 'Failed to update quotes.',
            life: 10000
          });
        } finally {
          patchState(store, { loading: false });
        }
      };

      return {
        setAsset,
        getAssets,
        addAsset,
        updateAsset,
        removeAsset,
        getQuotes
      };
    }
  ),

  withComputed(store => {
    const totalInvestmentSum = computed(() =>
      store
        .assets()
        .reduce((sum, asset) => sum + asset.purchasePrice * asset.quantity, 0)
    );

    const totalValueSum = computed(() =>
      store
        .assets()
        .reduce((sum, asset) => sum + asset.value * asset.quantity, 0)
    );

    const totalValueDifferenceSum = computed(
      () => totalValueSum() - totalInvestmentSum()
    );

    const totalPercentageDifferenceSum = computed(() => {
      const percentage = totalValueDifferenceSum() / totalInvestmentSum();

      return !isNaN(percentage) ? percentage : 0;
    });

    return {
      totalInvestmentSum,
      totalValueSum,
      totalValueDifferenceSum,
      totalPercentageDifferenceSum
    };
  })
);
