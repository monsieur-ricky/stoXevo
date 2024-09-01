import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  OnInit,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { assetTypes, Symbol } from '@shared/models';
import { SymbolSearchComponent } from '@shared/ui';
import { isFormValid } from '@shared/utils';
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
export class DetailsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appStore = inject(ApplicationStore);

  openSidebar = model.required<boolean>();

  asset = this.portfolioStore.asset;
  isMobile = this.appStore.isMobile;

  isEditMode = computed(() => !!this.asset()?.symbol);
  sidebarTitle = computed(() =>
    this.isEditMode() ? 'Asset Details' : 'Add new Asset'
  );
  saveBtnText = computed(() => (this.isEditMode() ? 'Save' : 'Add'));
  cancelBtnText = computed(() => (this.isEditMode() ? 'Close' : 'Cancel'));

  assetForm = this.createForm();
  types = assetTypes;

  ngForm = viewChild<NgForm>('form');

  constructor() {
    effect(() =>
      this.openSidebar() ? untracked(() => this.setFormValues()) : null
    );
  }

  ngOnInit(): void {
    this.setValueStatusFromManualUpdate();
    this.setValueStatusFromCurrency();
  }

  onSymbolSelected(symbol: Symbol) {
    const form = this.assetForm;

    form.patchValue(symbol);

    if (symbol.currency !== 'USD') {
      form.get('value')?.enable();
      form.get('manualUpdate')?.setValue(true);
      form.get('manualUpdate')?.disable();
    }
  }

  onSave(): void {
    if (isFormValid(this.assetForm)) {
      if (this.isEditMode()) {
        this.portfolioStore.updateAsset(this.assetForm.getRawValue());
      } else {
        this.portfolioStore.addAsset(this.assetForm.getRawValue());
        this.onClose();
      }
    }
  }

  onClose(): void {
    this.assetForm.reset();
    this.openSidebar.set(false);
    this.portfolioStore.setAsset(undefined);
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
      value: new FormControl(
        { value: undefined, disabled: true },
        Validators.required
      ),
      type: [undefined, Validators.required],
      manualUpdate: false
    });
  }

  private setFormValues() {
    const asset = this.asset();

    if (asset?.symbol) {
      const purchaseDate = new Date(asset.purchaseDate);

      this.assetForm.patchValue({ ...asset, purchaseDate });
    }

    this.setSymbolStatus();
  }

  private setValueStatusFromManualUpdate() {
    const form = this.assetForm;
    const value = form.get('value');

    form
      .get('manualUpdate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(manualUpdate => {
        if (manualUpdate) {
          value?.enable();
        } else {
          value?.disable();
        }
      });
  }

  private setValueStatusFromCurrency() {
    const form = this.assetForm;
    const value = form.get('value');
    const manualUpdate = form.get('manualUpdate');

    form
      .get('currency')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(curValue => {
        if (curValue !== 'USD') {
          value?.enable();
          manualUpdate?.setValue(true);
          manualUpdate?.disable();
        } else {
          value?.disable();
          manualUpdate?.setValue(false);
          manualUpdate?.enable();
        }
      });
  }

  private setSymbolStatus() {
    const form = this.assetForm;
    const symbol = form.get('symbol');

    if (this.isEditMode()) {
      symbol?.disable();
    } else {
      symbol?.enable();
    }
  }
}
