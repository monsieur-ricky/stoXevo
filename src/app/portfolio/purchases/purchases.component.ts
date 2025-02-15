import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  viewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule
} from '@angular/forms';
import { ApplicationStore, PortfolioStore } from '@shared/data';
import { Asset, Purchase } from '@shared/models';
import { PurchaseFormComponent } from '@shared/ui';
import { isFormValid } from '@shared/utils';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sxe-portfolio-purchases',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,

    PurchaseFormComponent,

    DrawerModule,
    TableModule,
    Button,
    TooltipModule,
    ConfirmPopupModule
  ],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchasesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly appStore = inject(ApplicationStore);
  private readonly confirmationService = inject(ConfirmationService);

  openSidebar = model.required<boolean>();

  asset = this.portfolioStore.asset;
  isMobile = this.appStore.isMobile;
  isApiKeySet = this.appStore.isApiKeySet;

  sidebarTitle = computed(() => `Manage ${this.asset()?.symbol} Purchases`);
  purchases = computed(() => this.asset()?.purchases ?? []);

  purchaseForm = this.fb.group({
    purchase: new FormGroup({})
  });

  ngForm = viewChild<NgForm>('form');

  constructor() {}

  onAddPurchase(): void {
    const asset = this.asset();

    if (!asset) {
      return;
    }

    if (isFormValid(this.purchaseForm)) {
      const purchase = this.purchaseForm.get('purchase')?.value as Purchase;
      const updatedAsset: Asset = {
        ...asset,
        purchases: [...asset.purchases, purchase]
      };

      this.portfolioStore.updateAsset(updatedAsset);
      this.purchaseForm.reset();
    }
  }

  onDeletePurchase(event: Event, index: number): void {
    const purchase = this.purchases()[index];
    const header = `Delete ${this.asset()?.symbol} Purchase?`;
    const message = `Do you want to delete the following purchase?
      <ul>
        <li>• Date: ${new DatePipe('en-UK').transform(purchase.date, 'dd-MM-yyyy')}</li>
        <li>• Price: ${purchase.price}</li>
        <li>• Quantity: ${purchase.quantity}</li>
      </ul>
    `;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      closable: true,
      header,
      message,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => {
        this.deletePurchase(index);
      }
    });
  }

  onClose(): void {
    this.purchaseForm.reset();
    this.openSidebar.set(false);
    this.portfolioStore.setAsset(undefined);
  }

  private deletePurchase(index: number): void {
    const asset = this.asset();

    if (!asset) {
      return;
    }

    const updatedAsset: Asset = {
      ...asset,
      purchases: asset.purchases.filter((_, i) => i !== index)
    };

    this.portfolioStore.updateAsset(updatedAsset);
  }
}
