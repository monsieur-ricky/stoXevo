import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sxe-ui-dark-mode-switch',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './dark-mode-switch.component.html',
  styleUrl: './dark-mode-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DarkModeSwitchComponent {
  private readonly appStore = inject(ApplicationStore);
  private readonly document = inject(DOCUMENT);

  isDarkMode = this.appStore.isDarkMode;

  icon = computed(() => (this.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'));
  tooltip = computed(() =>
    this.isDarkMode() ? 'Enable Light Theme' : 'Enable Dark Theme'
  );

  constructor() {
    effect(() => this.applyCssTheme());
  }

  onDarkModeChange(): void {
    this.appStore.setDarkMode(!this.isDarkMode());
  }

  private applyCssTheme(): void {
    const bodyElement = this.document.querySelector('html');
    bodyElement?.classList.toggle('dark-mode', this.isDarkMode());
  }
}
