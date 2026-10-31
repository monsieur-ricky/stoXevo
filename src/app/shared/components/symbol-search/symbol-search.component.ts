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
import { MessageService } from '@openng/optimus-ui/api';
import { AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputIconModule } from '@openng/optimus-ui/inputicon';

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
  private readonly messageService = inject(MessageService);

  disabled = input<boolean>(false);

  isApiKeySet = this.appStore.isApiKeySet;

  symbols = signal<Symbol[]>([]);

  selectedItem?: Symbol;

  selected = output<Symbol>();

  async searchSymbols(query: string): Promise<void> {
    try {
      const symbols = await this.symbolService.searchSymbols(query);
      this.symbols.set(symbols);
    } catch (error) {
      this.symbols.set([]);
      this.selectedItem = undefined;
      this.messageService.add({
        severity: 'error',
        summary: 'Oops!',
        detail: 'Failed to load the search results.'
      });

      console.error(error);
    }
  }

  onSelect(symbol: Symbol): void {
    this.selected.emit(symbol);
    this.selectedItem = undefined;
  }
}
