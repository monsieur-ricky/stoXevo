import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  Signal,
  untracked
} from '@angular/core';
import { ApplicationStore, DashboardStore, PortfolioStore } from '@shared/data';
import { AssetTypeSelect } from '@shared/models';
import { HideValuePipe } from '@shared/pipes';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AssetDataComponent } from './asset-data/asset-data.component';

type DashboardAssetType = AssetTypeSelect & {
  totalInvestment: Signal<number>;
  totalValue: Signal<number>;
  totalNumberOfAssets: Signal<number>;
};

@Component({
  selector: 'sxe-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,

    AssetDataComponent,
    ProgressSpinnerModule,
    HideValuePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly appStore = inject(ApplicationStore);

  totalInvestment = this.dashboardStore.totalInvestment;
  totalValue = this.dashboardStore.totalValue;
  valueDifference = this.dashboardStore.valueDifference;
  percentageDifference = this.dashboardStore.percentageDifference;
  totalNumberOfAssets = this.dashboardStore.totalNumberOfAssets;
  loading = this.portfolioStore.loading;

  dashboardAssets = signal<DashboardAssetType[]>([]);

  constructor() {
    effect(() => this.getAssets());
  }

  private getAssets(): void {
    if (this.appStore.pin()) {
      this.appStore.dataImportDate();
      this.portfolioStore.getAssets();

      untracked(() => this.setDashboardAssetData());
    }
  }

  private setDashboardAssetData() {
    this.dashboardAssets.set([
      {
        id: 'stock',
        label: 'Stocks',
        totalInvestment: this.dashboardStore.totalInvestmentOfStocks,
        totalValue: this.dashboardStore.totalValueOfStocks,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfStocks
      },
      {
        id: 'etf',
        label: 'ETFs',
        totalInvestment: this.dashboardStore.totalInvestmentOfETFs,
        totalValue: this.dashboardStore.totalValueOfETFs,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfETFs
      },
      {
        id: 'fund',
        label: 'Funds',
        totalInvestment: this.dashboardStore.totalInvestmentOfFunds,
        totalValue: this.dashboardStore.totalValueOfFunds,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfFunds
      },
      {
        id: 'bond',
        label: 'Bonds',
        totalInvestment: this.dashboardStore.totalInvestmentOfBonds,
        totalValue: this.dashboardStore.totalValueOfBonds,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfBonds
      },
      {
        id: 'commodity',
        label: 'Commodities',
        totalInvestment: this.dashboardStore.totalInvestmentOfCommodities,
        totalValue: this.dashboardStore.totalValueOfCommodities,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfCommodities
      },
      {
        id: 'crypto',
        label: 'Crypto',
        totalInvestment: this.dashboardStore.totalInvestmentOfCrypto,
        totalValue: this.dashboardStore.totalValueOfCrypto,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfCryptos
      },
      {
        id: 'forex',
        label: 'Forex',
        totalInvestment: this.dashboardStore.totalInvestmentOfForex,
        totalValue: this.dashboardStore.totalValueOfForex,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfForex
      },
      {
        id: 'physical',
        label: 'Physical',
        totalInvestment: this.dashboardStore.totalInvestmentOfPhysical,
        totalValue: this.dashboardStore.totalValueOfPhysical,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfPhysical
      },
      {
        id: 'futures',
        label: 'Futures',
        totalInvestment: this.dashboardStore.totalInvestmentOfFutures,
        totalValue: this.dashboardStore.totalValueOfFutures,
        totalNumberOfAssets: this.dashboardStore.totalNumberOfFutures
      }
    ]);
  }
}
