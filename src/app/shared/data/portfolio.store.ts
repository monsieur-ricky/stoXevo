import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { ApplicationStore } from '@shared/data';
import { PortfolioService } from '@shared/data/api';
import { Asset, Purchase } from '@shared/models';
import { getAveragePrice } from '@shared/utils';
import { assetInstrument } from './market-data/market-data.service';
import { instrumentKey, QuoteResult } from './market-data/market-data.types';
import { MessageService } from '@openng/optimus-ui/api';

export type PortfolioState = {
  assets: Asset[];
  asset: Asset | undefined;
  loading: boolean;
  initialLoadDone: boolean;
  saveError: string | null;
};

const initialState: PortfolioState = {
  assets: [],
  asset: undefined,
  loading: false,
  initialLoadDone: false,
  saveError: null
};

export const PortfolioStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods(
    (
      store,
      portfolioService = inject(PortfolioService),
      appStore = inject(ApplicationStore),
      messageService = inject(MessageService)
    ) => {
      let generation = 0;
      const storeAssets = async (): Promise<void> => {
        await appStore.updateAppData({ assets: store.assets() });
      };

      const applyQuote = (asset: Asset, quote?: QuoteResult): Asset =>
        quote?.status === 'ok' && quote.price !== undefined
          ? {
              ...asset,
              value: quote.price,
              quoteEvidence: quote.evidence,
              quoteStatus: 'ok',
              quoteMessage: undefined
            }
          : {
              ...asset,
              quoteStatus: 'unavailable',
              quoteMessage:
                quote?.reason ?? 'Price unavailable; last value kept.'
            };

      const setAsset = (asset: Asset | undefined): void => {
        patchState(store, {
          asset,
          loading: false,
          saveError: null
        });
      };

      const getAssets = async (): Promise<void> => {
        generation++;
        const decryptedAppData = await appStore.getDecryptedAppData();
        const decryptedAssets = (decryptedAppData?.assets as Asset[]) ?? [];

        // This is a workaround to update previous version assets to the new version
        const assets = decryptedAssets.map(asset => {
          if (asset.purchases?.length) {
            return asset;
          }

          const purchase: Purchase = {
            date: new Date(asset.purchaseDate).toISOString(),
            price: asset.purchasePrice,
            quantity: asset.quantity
          };

          return {
            ...asset,
            purchases: [purchase]
          };
        });

        patchState(store, {
          assets,
          asset: undefined,
          loading: false
        });

        if (!store.initialLoadDone()) {
          patchState(store, { initialLoadDone: true });
          // Opening/importing a portfolio must never trigger billable AI work.
          if (
            appStore.marketData().source === 'stoxscraper' &&
            appStore.canUseMarketData()
          )
            await getQuotes(false);
        }
      };

      const addAsset = async (asset: Asset): Promise<boolean> => {
        if (store.loading()) return false;
        patchState(store, { loading: true, saveError: null });

        try {
          const symbolExists = !!store
            .assets()
            .find(a => a.symbol === asset.symbol);

          if (symbolExists) {
            messageService.add({
              severity: 'error',
              summary: 'Oops!',
              detail: 'Asset with this symbol already exists in the portfolio!'
            });

            return false;
          }

          if (!asset.manualUpdate) {
            const [quote] = await portfolioService.getQuotes([
              assetInstrument(asset)
            ]);
            if (quote?.status !== 'ok') {
              const message = `${quote?.reason ?? 'No sourced current price was available.'} Retry the lookup or enable manual value updates and enter a current price.`;
              patchState(store, { saveError: message });
              messageService.add({
                severity: 'warn',
                summary: 'Price unavailable',
                detail: message,
                life: 10000
              });
              return false;
            }
            asset = applyQuote(asset, quote);
          }

          const assets = [...store.assets(), asset];
          // Publish success only after persistence: a storage failure must not
          // leave a phantom duplicate that cannot be retried from the form.
          await appStore.updateAppData({ assets });
          patchState(store, { asset, assets });

          messageService.add({
            severity: 'success',
            summary: 'Yay!',
            detail: 'Asset was added to portfolio!'
          });

          return true;
        } catch {
          const message =
            'Failed to add the asset. Check provider settings and browser storage, then retry or enter a manual current price.';
          patchState(store, { saveError: message });
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: message
          });

          return false;
        } finally {
          patchState(store, { loading: false });
        }
      };

      const updateAsset = async (updatedAsset: Asset): Promise<void> => {
        patchState(store, { loading: true });

        try {
          if (!updatedAsset.manualUpdate) {
            // Editing purchases does not initiate paid lookups. Use Update in
            // the portfolio to refresh prices explicitly.
            const current = store
              .assets()
              .find(asset => asset.symbol === updatedAsset.symbol);
            if (current)
              updatedAsset = {
                ...updatedAsset,
                value: current.value,
                quoteEvidence: current.quoteEvidence,
                quoteStatus: current.quoteStatus,
                quoteMessage: current.quoteMessage
              };
          }

          const purchases = updatedAsset.purchases ?? [];
          const purchaseDate =
            purchases?.at(-1)?.date ?? new Date().toISOString();

          updatedAsset = {
            ...updatedAsset,
            purchaseDate: new Date(purchaseDate).toISOString(),
            purchasePrice: getAveragePrice(purchases),
            quantity: purchases.reduce((sum, { quantity }) => sum + quantity, 0)
          };

          patchState(store, {
            asset: updatedAsset,
            assets: store
              .assets()
              .map(asset =>
                asset.symbol === updatedAsset.symbol ? updatedAsset : asset
              )
          });

          await storeAssets();

          messageService.add({
            severity: 'success',
            summary: 'Yay!',
            detail: 'Asset was updated!'
          });
        } catch {
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail: 'Failed to update the asset!'
          });
        } finally {
          patchState(store, { loading: false });
        }
      };

      const removeAsset = async (symbol: string): Promise<void> => {
        patchState(store, {
          assets: store.assets().filter(asset => asset.symbol !== symbol)
        });

        await storeAssets();

        messageService.add({
          severity: 'success',
          summary: 'Yay!',
          detail: 'The Asset was removed from the portfolio!'
        });
      };

      const getQuotes = async (showSuccessMessage = true): Promise<void> => {
        if (store.loading()) return;
        const snapshot = store.assets();
        const currentGeneration = generation;
        const revision = appStore.marketDataRevision();
        patchState(store, { loading: true });

        try {
          const automatic = snapshot.filter(asset => !asset.manualUpdate);
          const quotes = await portfolioService.getQuotes(
            automatic.map(assetInstrument)
          );
          if (
            currentGeneration !== generation ||
            revision !== appStore.marketDataRevision()
          )
            return;
          const byKey = new Map(
            quotes.map(quote => [instrumentKey(quote.instrument), quote])
          );
          // Map the latest store, not the old snapshot: don't resurrect deleted
          // assets or overwrite edits made while the requests were running.
          patchState(store, {
            assets: store
              .assets()
              .map(asset =>
                asset.manualUpdate || !snapshot.includes(asset)
                  ? asset
                  : applyQuote(
                      asset,
                      byKey.get(instrumentKey(assetInstrument(asset)))
                    )
              )
          });

          await storeAssets();

          if (showSuccessMessage) {
            messageService.add({
              severity: quotes.some(quote => quote.status !== 'ok')
                ? 'warn'
                : 'success',
              summary: 'Market data',
              detail: `${quotes.filter(quote => quote.status === 'ok').length} prices available; ${quotes.filter(quote => quote.status !== 'ok').length} unavailable (previous values kept). Fresh cached prices may be reused.`
            });
          }
        } catch (error: unknown) {
          messageService.add({
            severity: 'error',
            summary: 'Oops!',
            detail:
              error instanceof Error
                ? error.message
                : 'Failed to update quotes.',
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
