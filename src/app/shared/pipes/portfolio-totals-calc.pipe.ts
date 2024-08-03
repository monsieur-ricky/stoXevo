import { Pipe, PipeTransform } from '@angular/core';
import { Asset } from '@shared/models';

@Pipe({
  name: 'portfolioTotalsCalc',
  standalone: true
})
export class PortfolioTotalsCalcPipe implements PipeTransform {
  transform(asset: Asset, field: 'investment' | 'value'): any {
    if (field === 'investment') {
      return asset.purchasePrice * asset.quantity;
    } else {
      return asset.value * asset.quantity;
    }
  }
}
