import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  untracked,
  viewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ApplicationStore, PortfolioStore } from '@shared/data';
import { AssetType, assetTypes, AssetTypeSelect, Symbol } from '@shared/models';
import { SymbolSearchComponent } from '@shared/ui';
import { getIdFromSentence, isFormValid } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'sxe-portfolio-details',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,

    SymbolSearchComponent,

    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SidebarModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly appStore = inject(ApplicationStore);

  openSidebar = model.required<boolean>();

  asset = this.portfolioStore.asset;
  isMobile = this.appStore.isMobile;
  isApiKeySet = this.appStore.isApiKeySet;

  isEditMode = computed(() => !!this.asset()?.symbol);
  sidebarTitle = computed(() =>
    this.isEditMode() ? 'Asset Details' : 'Add new Asset'
  );
  saveBtnText = computed(() => (this.isEditMode() ? 'Save' : 'Add'));
  cancelBtnText = computed(() => (this.isEditMode() ? 'Close' : 'Cancel'));

  assetForm = this.createForm();
  types = assetTypes;
  subTypes: AssetTypeSelect[] = [];
  isSearchDisabled = false;

  ngForm = viewChild<NgForm>('form');

  constructor() {
    effect(() =>
      this.openSidebar() ? untracked(() => this.setFormValues()) : null
    );
  }

  onSymbolSelected(selectedAsset: Symbol) {
    const { symbol, name, currency, exchangeShortName } = selectedAsset;
    this.assetForm.patchValue({ symbol, name, currency, exchangeShortName });
  }

  onSave(): void {
    if (isFormValid(this.assetForm)) {
      if (this.isEditMode()) {
        this.portfolioStore.updateAsset(this.assetForm.getRawValue());
      } else {
        this.portfolioStore
          .addAsset(this.assetForm.getRawValue())
          .then(res => (res ? this.onClose() : null));
      }
    }
  }

  onClose(): void {
    this.assetForm.reset();
    this.openSidebar.set(false);
    this.portfolioStore.setAsset(undefined);
  }

  onTypeChange(type: AssetType): void {
    const subTypes = this.types.find(t => t.id === type)?.subTypes;

    this.subTypes = subTypes ?? [];
    this.assetForm.patchValue({ subType: 'gold' });
    this.disableControlsBasedOnType(type);
  }

  onSubTypeChange(type: AssetType): void {
    const form = this.assetForm;
    form.patchValue({ symbol: type.toUpperCase() });
    this.onGenerateSymbolFromName(form.get('name')?.value ?? undefined);
  }

  onGenerateSymbolFromName(name: string): void {
    const form = this.assetForm;
    const type = form.get('type');
    const subType = form.get('subType');
    const symbol = form.get('symbol');

    if (type?.value !== 'physical' && type?.value !== 'commodity') {
      return;
    }

    if (!name) {
      symbol?.setValue(subType?.value?.toUpperCase());
      return;
    }

    if (symbol?.disabled) {
      const newSymbol = getIdFromSentence(`${subType?.value} ${name}`);

      symbol?.setValue(newSymbol);
    }
  }

  onManualUpdateChange(manualUpdate: boolean): void {
    const form = this.assetForm;
    const value = form.get('value');

    if (manualUpdate) {
      value?.enable();
    } else {
      value?.disable();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      symbol: [undefined, Validators.required],
      name: [undefined, Validators.required],
      currency: [undefined, Validators.required],
      exchangeShortName: [undefined, Validators.required],
      purchaseDate: [undefined, Validators.required],
      quantity: [undefined, Validators.required],
      purchasePrice: [undefined, Validators.required],
      value: new FormControl(undefined, Validators.required),
      type: ['stock', Validators.required],
      subType: ['gold', Validators.required],
      manualUpdate: false
    });
  }

  private setFormValues(): void {
    const asset = this.asset();
    const form = this.assetForm;

    form.reset({ type: 'stock', subType: 'gold' });

    if (asset?.symbol) {
      const purchaseDate = new Date(asset.purchaseDate);

      form.patchValue({ ...asset, purchaseDate });
    }

    this.setSymbolStatus();
    this.setManualUpdateStatus();
  }

  private setSymbolStatus(): void {
    const form = this.assetForm;
    const symbol = form.get('symbol');

    if (this.isEditMode()) {
      symbol?.disable();
    } else {
      symbol?.enable();
    }
  }

  private setManualUpdateStatus(value = false, enable = true): void {
    const form = this.assetForm;
    const manualUpdate = form.get('manualUpdate');

    if (this.isApiKeySet() && enable) {
      manualUpdate?.enable();
      manualUpdate?.setValue(this.asset()?.manualUpdate ?? value);
    } else {
      manualUpdate?.disable();
      manualUpdate?.setValue(true);
    }

    if (manualUpdate?.value) {
      form.get('value')?.enable();
    } else {
      form.get('value')?.disable();
    }
  }

  private disableControlsBasedOnType(type: AssetType): void {
    const form = this.assetForm;
    const exchangeShortName = form.get('exchangeShortName');
    const symbol = form.get('symbol');
    const subType = form.get('subType');
    const value = form.get('value');

    switch (type) {
      case 'physical':
        exchangeShortName?.disable();
        exchangeShortName?.setValue(undefined);
        symbol?.disable();
        symbol?.setValue(type?.toUpperCase());

        this.isSearchDisabled = true;
        this.setManualUpdateStatus(true, false);
        break;

      case 'commodity':
        exchangeShortName?.disable();
        exchangeShortName?.setValue(undefined);
        symbol?.disable();
        symbol?.setValue(subType?.value?.toUpperCase());

        this.isSearchDisabled = true;
        this.setManualUpdateStatus();
        break;

      default:
        exchangeShortName?.enable();
        exchangeShortName?.setValue(this.asset()?.exchangeShortName);
        value?.enable();
        symbol?.setValue(this.asset()?.symbol);

        this.isSearchDisabled = false;
        this.setManualUpdateStatus();
        this.setSymbolStatus();
        break;
    }
  }
}
