import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  AppSettingsComponent,
  ExportDataComponent,
  ImportDataComponent,
  SymbolSearchComponent
} from '@shared/components';
import { ApplicationStore } from '@shared/data';
import { Symbol } from '@shared/models';
import {
  ApplicationPinComponent,
  SideMenuComponent,
  TopBarComponent
} from '@shared/ui';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    SymbolSearchComponent,
    ExportDataComponent,
    ImportDataComponent,
    AppSettingsComponent,
    ApplicationPinComponent,

    TopBarComponent,
    SideMenuComponent,
    ToastModule
  ],
  selector: 'sxe-root',
  template: ` @if (!isPinSet()) {
      <sxe-ui-application-pin />
    }
    <header>
      <sxe-ui-top-bar>
        <sxe-symbol-search
          ngProjectAs="symbol-search"
          (selected)="onSymbolSelected($event)"
        />
        <ng-container ngProjectAs="menu">
          <div class="flex">
            <sxe-import-data />
            <sxe-export-data />
            <sxe-app-settings />
          </div>
        </ng-container>
      </sxe-ui-top-bar>
    </header>
    <div class="container">
      <aside>
        <sxe-ui-side-menu />
      </aside>
      <main>
        <p-toast />
        <router-outlet></router-outlet>
      </main>
    </div>
    <footer>
      Made with
      <span style="transform: translateY(2px)" class="pi pi-heart-fill"></span>
      by
      <a href="https://blacklambs.net" target="_blank">Ricky</a>
    </footer>`
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly appStore = inject(ApplicationStore);

  isPinSet = computed(() => !!this.appStore.pin());

  title = 'stoXevo';

  onSymbolSelected(symbol: Symbol) {
    this.router.navigate(['profile', symbol.symbol]);
  }
}
