import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PercentPipe,
  UpperCasePipe
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore, PortfolioStore } from '@shared/data';
import { Asset } from '@shared/models';
import { HideValuePipe, PortfolioTotalsCalcPipe } from '@shared/pipes';
import { NetworkStatusService } from '@shared/services';
import {
  ConfirmationService,
  MenuItem,
  MenuItemCommandEvent
} from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { Menu, MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DetailsComponent } from './details/details.component';
import { PurchasesComponent } from './purchases/purchases.component';

@Component({
  selector: 'sxe-portfolio',
  standalone: true,
  imports: [
    DatePipe,
    UpperCasePipe,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,

    DetailsComponent,
    PortfolioTotalsCalcPipe,
    HideValuePipe,
    PurchasesComponent,

    TableModule,
    ButtonModule,
    SidebarModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    InputNumberModule,
    CalendarModule,
    FormsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent {
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly appStore = inject(ApplicationStore);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly networkService = inject(NetworkStatusService);

  isMobile = this.appStore.isMobile;
  isApiKeySet = this.appStore.isApiKeySet;
  isOnline = this.networkService.isOnline;
  selectedAsset = this.portfolioStore.asset;
  loading = this.portfolioStore.loading;
  totalInvestmentSum = this.portfolioStore.totalInvestmentSum;
  totalValueSum = this.portfolioStore.totalValueSum;
  totalValueDifferenceSum = this.portfolioStore.totalValueDifferenceSum;
  totalPercentageDifferenceSum =
    this.portfolioStore.totalPercentageDifferenceSum;

  sidebarVisible = signal(false);
  purchaseSidebarVisible = signal(false);

  portfolio = computed(() => this.portfolioStore.assets());
  isPinSet = computed(() => !!this.appStore.pin());

  items = this.getMenuItems();

  constructor() {
    effect(() => this.getAssets());
  }

  onGetQuotes(): void {
    this.portfolioStore.getQuotes();
  }

  onAddAsset(): void {
    this.portfolioStore.setAsset(undefined);
    this.sidebarVisible.set(true);
  }

  onShowMenu(event: Event, menu: Menu, asset: Asset): void {
    menu.toggle(event);
    this.portfolioStore.setAsset(asset);
  }

  private getAssets(): void {
    if (this.isPinSet()) {
      this.appStore.dataImportDate();
      this.portfolioStore.getAssets();
    }
  }

  private deleteAsset(event: MenuItemCommandEvent): void {
    this.confirmationService.confirm({
      target: event?.originalEvent?.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        const asset = this.selectedAsset();
        if (asset) {
          this.portfolioStore.removeAsset(asset.symbol);
          this.portfolioStore.setAsset(undefined);
        }
      },
      reject: () => {
        this.portfolioStore.setAsset(undefined);
      }
    });
  }

  private getMenuItems(): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pen-to-square',
        command: () => this.sidebarVisible.set(true)
      },
      {
        label: 'Manage Purchases',
        icon: 'pi pi-file-plus',
        command: () => this.purchaseSidebarVisible.set(true)
      },
      {
        label: 'Delete',
        icon: 'pi pi-times-circle',
        command: $event => this.deleteAsset($event)
      }
    ];
  }
}
