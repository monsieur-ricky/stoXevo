import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  ExportDataComponent,
  ImportDataComponent,
  SymbolSearchComponent
} from '@shared/components';
import { ApplicationStore } from '@shared/data';
import { Symbol } from '@shared/models';
import {
  ApplicationPinComponent,
  DarkModeSwitchComponent,
  SideMenuComponent,
  TopBarComponent,
  ValueVisibilityComponent
} from '@shared/ui';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    SymbolSearchComponent,
    ExportDataComponent,
    ImportDataComponent,
    ApplicationPinComponent,
    ValueVisibilityComponent,
    DarkModeSwitchComponent,

    TopBarComponent,
    SideMenuComponent,
    ToastModule,
    ButtonModule
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
            <sxe-ui-dark-mode-switch class="hidden md:block" />
            <sxe-ui-value-visibility class="hidden md:block" />
            <sxe-import-data class="hidden md:block" />
            <sxe-export-data class="hidden md:block" />
            <sxe-app-settings class="hidden md:block" />
            <p-button
              type="button"
              icon="pi pi-bars"
              class="block md:hidden ml-2"
              (onClick)="onShowMenu()"
            />
          </div>
        </ng-container>
      </sxe-ui-top-bar>
    </header>
    <div class="content">
      <sxe-ui-side-menu>
        <ng-container ngProjectAs="bottom-menu">
          <sxe-ui-dark-mode-switch />
          <sxe-ui-value-visibility />
          <sxe-import-data />
          <sxe-export-data />
          <sxe-app-settings />
        </ng-container>
      </sxe-ui-side-menu>
      <main>
        <p-toast />
        <router-outlet></router-outlet>
      </main>
    </div>
    <footer>
      <span>
        <span>Made with</span>
        <span
          style="transform: translateY(2px)"
          class="pi pi-heart-fill"
        ></span>
        <span>by</span>
        <a href="https://blacklambs.net" target="_blank">Ricky</a>
      </span>
      <span>
        <a href="https://github.com/monsieur-ricky/stoXevo" target="_blank">
          <span class="pi pi-github"></span>Github
        </a>
      </span>
    </footer>`
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appStore = inject(ApplicationStore);

  isPinSet = computed(() => !!this.appStore.pin());

  title = 'stoXevo';

  ngOnInit(): void {
    this.appStore.getShowValues();
    this.appStore.getDarkMode();
  }

  onSymbolSelected(symbol: Symbol) {
    this.router.navigate(['profile', symbol.symbol]);
  }

  onShowMenu() {
    this.appStore.setShowMenu(true);
  }
}
