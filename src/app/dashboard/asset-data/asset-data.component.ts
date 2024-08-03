import { DecimalPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { AssetType, assetTypes } from '@shared/models';

@Component({
  selector: 'sxe-dashboard-asset-data',
  standalone: true,
  imports: [DecimalPipe, PercentPipe],
  templateUrl: './asset-data.component.html',
  styleUrl: './asset-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetDataComponent {
  assetType = input.required<AssetType>();
  totalInvestment = input.required<number>();
  totalValue = input.required<number>();

  title = computed(
    () => `${assetTypes.find(type => type.id === this.assetType())?.label} Data`
  );
}
