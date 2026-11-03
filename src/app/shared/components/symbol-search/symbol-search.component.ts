import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  DestroyRef,
  output,
  signal
} from '@angular/core';
import { computed } from '@angular/core';
import { safeSourceUrl } from '../../data/market-data/quote-validation';
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

  canSearch = this.appStore.canUseMarketData;
  private request?: AbortController;
  private readonly destroy = inject(DestroyRef);

  symbols = signal<Symbol[]>([]);
  sources = computed(() => [
    ...new Map(
      this.symbols()
        .flatMap(symbol => symbol.sources ?? [])
        .filter(source => safeSourceUrl(source.url))
        .map(source => [source.url, source])
    ).values()
  ]);

  selectedItem: Symbol | string | undefined;

  selected = output<Symbol>();

  constructor() {
    this.destroy.onDestroy(() => this.request?.abort());
  }

  async searchSymbols(query: string): Promise<void> {
    this.request?.abort();
    const controller = new AbortController();
    this.request = controller;
    try {
      const symbols = await this.symbolService.searchSymbols(
        query,
        controller.signal
      );
      if (controller.signal.aborted) return;
      // Optimus acknowledges completion through its suggestions input setter.
      // A cached array may be the same object as last time: always publish a
      // fresh reference, otherwise the autocomplete keeps its loader running.
      this.symbols.set([...symbols]);
    } catch {
      if (controller.signal.aborted) return;
      this.symbols.set([]);
      this.selectedItem = undefined;
      this.messageService.add({
        severity: 'error',
        summary: 'Oops!',
        detail: 'Failed to load the search results.'
      });
    } finally {
      if (this.request === controller) this.request = undefined;
    }
  }

  onSearchValueChange(value: Symbol | string | undefined): void {
    this.selectedItem = value;
    // Cancel immediately when text changes, rather than waiting for the next
    // debounced completeMethod. Empty/short queries never emit that event.
    this.request?.abort();
    this.request = undefined;
    if (typeof value !== 'string' || value.length < 3) this.symbols.set([]);
  }

  onSelect(symbol: Symbol): void {
    this.request?.abort();
    this.request = undefined;
    this.symbols.set([]);
    this.selected.emit(symbol);
    this.selectedItem = undefined;
  }
}
