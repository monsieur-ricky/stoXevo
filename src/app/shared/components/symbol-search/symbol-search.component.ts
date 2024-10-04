import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { SymbolSearchService } from '@shared/data/api';
import { Symbol } from '@shared/models';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'sxe-symbol-search',
  standalone: true,
  imports: [
    FormsModule,
    AutoCompleteModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './symbol-search.component.html',
  styleUrl: './symbol-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbolSearchComponent {
  private readonly symbolService = inject(SymbolSearchService);
  private readonly appStore = inject(ApplicationStore);

  disabled = input<boolean>(false);

  isApiKeySet = this.appStore.isApiKeySet;

  symbols = signal<Symbol[]>([]);

  selectedItem?: symbol;

  selected = output<Symbol>();

  async searchSymbols(query: string): Promise<void> {
    const symbols = await this.symbolService.searchSymbols(query);
    this.symbols.set(symbols);
  }

  onSelect(symbol: Symbol): void {
    this.selected.emit(symbol);
    this.selectedItem = undefined;
  }
}
