import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject
} from '@angular/core';
import { ApplicationStore, DashboardStore, PortfolioStore } from '@shared/data';
import { AssetDataComponent } from './asset-data/asset-data.component';

@Component({
  selector: 'sxe-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, PercentPipe, AssetDataComponent],
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
  totalNumberOfStocks = this.dashboardStore.totalNumberOfStocks;
  totalNumberOfETFs = this.dashboardStore.totalNumberOfETFs;
  totalNumberOfFunds = this.dashboardStore.totalNumberOfFunds;
  totalNumberOfBonds = this.dashboardStore.totalNumberOfBonds;
  totalNumberOfCommodities = this.dashboardStore.totalNumberOfCommodities;
  totalNumberOfCryptos = this.dashboardStore.totalNumberOfCryptos;
  totalNumberOfForex = this.dashboardStore.totalNumberOfForex;
  totalInvestmentOfStocks = this.dashboardStore.totalInvestmentOfStocks;
  totalValueOfStocks = this.dashboardStore.totalValueOfStocks;
  totalInvestmentOfETFs = this.dashboardStore.totalInvestmentOfETFs;
  totalValueOfETFs = this.dashboardStore.totalValueOfETFs;
  totalInvestmentOfFunds = this.dashboardStore.totalInvestmentOfFunds;
  totalValueOfFunds = this.dashboardStore.totalValueOfFunds;
  totalInvestmentOfBonds = this.dashboardStore.totalInvestmentOfBonds;
  totalValueOfBonds = this.dashboardStore.totalValueOfBonds;
  totalInvestmentOfCommodities =
    this.dashboardStore.totalInvestmentOfCommodities;
  totalValueOfCommodities = this.dashboardStore.totalValueOfCommodities;
  totalInvestmentOfCrypto = this.dashboardStore.totalInvestmentOfCrypto;
  totalValueOfCrypto = this.dashboardStore.totalValueOfCrypto;
  totalInvestmentOfForex = this.dashboardStore.totalInvestmentOfForex;
  totalValueOfForex = this.dashboardStore.totalValueOfForex;

  constructor() {
    effect(() =>
      !!this.appStore.pin() ? this.portfolioStore.getAssets() : null
    );
  }
}
