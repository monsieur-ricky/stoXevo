import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileService } from '@shared/data/api';
import { MessageService } from '@openng/optimus-ui/api';
import { ProgressSpinnerModule } from '@openng/optimus-ui/progressspinner';
import { AssetType } from '@shared/models';

@Component({
  selector: 'sxe-profile',
  standalone: true,
  imports: [RouterModule, DecimalPipe, CurrencyPipe, ProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);

  symbol = input<string>();
  currency = input<string>();
  exchange = input<string>();
  assetType = input<AssetType>();

  private readonly profileResource = this.profileService.resource(
    this.symbol,
    () => ({
      currency: this.currency(),
      exchange: this.exchange(),
      type: this.assetType()
    })
  );
  profile = computed(() =>
    this.profileResource.hasValue() ? this.profileResource.value() : undefined
  );
  loading = this.profileResource.isLoading;
  hasNumber(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
  readonly textFields = [
    { key: 'symbol', label: 'Symbol' },
    { key: 'name', label: 'Name' },
    { key: 'exchangeShortName', label: 'Exchange' },
    { key: 'currency', label: 'Currency' },
    { key: 'industry', label: 'Industry' },
    { key: 'sector', label: 'Sector' },
    { key: 'ceo', label: 'CEO' },
    { key: 'country', label: 'Country' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'fullTimeEmployees', label: 'Employees' }
  ] as const;
  readonly metricFields = [
    { key: 'trailingAnnualDividendRate', label: 'Annual Dividend' },
    { key: 'dividendYield', label: 'Dividend Yield (%)' },
    { key: 'fiftyDayAverage', label: '50-Day Average' },
    { key: 'fiftyTwoWeekHigh', label: '52-Week High' },
    { key: 'fiftyTwoWeekLow', label: '52-Week Low' }
  ] as const;

  constructor() {
    effect(() => {
      if (this.profileResource.error()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Oops!',
          detail: 'Failed to load the asset profile.'
        });
      }
    });
  }
}
