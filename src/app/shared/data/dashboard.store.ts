import { computed, inject } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { AssetType } from '@shared/models';
import { PortfolioStore } from './portfolio.store';

export const DashboardStore = signalStore(
  { providedIn: 'root' },

  withComputed(() => {
    const portfolioStore = inject(PortfolioStore);

    const getTotalAssetOfType = (type: AssetType) =>
      portfolioStore.assets().filter(asset => asset.type === type).length;

    const getTotalInvestmentOfType = (type: AssetType) =>
      portfolioStore
        .assets()
        .filter(asset => asset.type === type)
        .reduce((sum, asset) => sum + asset.purchasePrice * asset.quantity, 0);

    const getTotalValueOfType = (type: AssetType) =>
      portfolioStore
        .assets()
        .filter(asset => asset.type === type)
        .reduce((sum, asset) => sum + asset.value * asset.quantity, 0);

    const totalNumberOfAssets = computed(() => portfolioStore.assets().length);
    const totalNumberOfStocks = computed(() => getTotalAssetOfType('stock'));
    const totalNumberOfETFs = computed(() => getTotalAssetOfType('etf'));
    const totalNumberOfFunds = computed(() => getTotalAssetOfType('fund'));
    const totalNumberOfBonds = computed(() => getTotalAssetOfType('bond'));
    const totalNumberOfCommodities = computed(() =>
      getTotalAssetOfType('commodity')
    );
    const totalNumberOfCryptos = computed(() => getTotalAssetOfType('crypto'));
    const totalNumberOfForex = computed(() => getTotalAssetOfType('forex'));
    const totalNumberOfPhysical = computed(() =>
      getTotalAssetOfType('physical')
    );
    const totalNumberOfFutures = computed(() => getTotalAssetOfType('futures'));

    const totalInvestmentOfStocks = computed(() =>
      getTotalInvestmentOfType('stock')
    );
    const totalInvestmentOfETFs = computed(() =>
      getTotalInvestmentOfType('etf')
    );
    const totalInvestmentOfFunds = computed(() =>
      getTotalInvestmentOfType('fund')
    );
    const totalInvestmentOfBonds = computed(() =>
      getTotalInvestmentOfType('bond')
    );
    const totalInvestmentOfCommodities = computed(() =>
      getTotalInvestmentOfType('commodity')
    );
    const totalInvestmentOfCrypto = computed(() =>
      getTotalInvestmentOfType('crypto')
    );
    const totalInvestmentOfForex = computed(() =>
      getTotalInvestmentOfType('forex')
    );
    const totalInvestmentOfPhysical = computed(() =>
      getTotalInvestmentOfType('physical')
    );
    const totalInvestmentOfFutures = computed(() =>
      getTotalInvestmentOfType('futures')
    );

    const totalValueOfStocks = computed(() => getTotalValueOfType('stock'));
    const totalValueOfETFs = computed(() => getTotalValueOfType('etf'));
    const totalValueOfFunds = computed(() => getTotalValueOfType('fund'));
    const totalValueOfBonds = computed(() => getTotalValueOfType('bond'));
    const totalValueOfCommodities = computed(() =>
      getTotalValueOfType('commodity')
    );
    const totalValueOfCrypto = computed(() => getTotalValueOfType('crypto'));
    const totalValueOfForex = computed(() => getTotalValueOfType('forex'));
    const totalValueOfPhysical = computed(() =>
      getTotalValueOfType('physical')
    );
    const totalValueOfFutures = computed(() => getTotalValueOfType('futures'));

    const totalInvestment = computed(() => portfolioStore.totalInvestmentSum());
    const totalValue = computed(() => portfolioStore.totalValueSum());
    const valueDifference = computed(() =>
      portfolioStore.totalValueDifferenceSum()
    );
    const percentageDifference = computed(() =>
      portfolioStore.totalPercentageDifferenceSum()
    );

    return {
      totalNumberOfAssets,
      totalNumberOfStocks,
      totalNumberOfETFs,
      totalNumberOfFunds,
      totalNumberOfBonds,
      totalNumberOfCommodities,
      totalNumberOfCryptos,
      totalNumberOfForex,
      totalNumberOfPhysical,
      totalNumberOfFutures,
      totalInvestment,
      totalValue,
      valueDifference,
      percentageDifference,
      totalInvestmentOfStocks,
      totalInvestmentOfETFs,
      totalInvestmentOfFunds,
      totalInvestmentOfBonds,
      totalInvestmentOfCommodities,
      totalInvestmentOfCrypto,
      totalInvestmentOfForex,
      totalInvestmentOfPhysical,
      totalInvestmentOfFutures,
      totalValueOfStocks,
      totalValueOfETFs,
      totalValueOfFunds,
      totalValueOfBonds,
      totalValueOfCommodities,
      totalValueOfCrypto,
      totalValueOfForex,
      totalValueOfPhysical,
      totalValueOfFutures
    };
  })
);
