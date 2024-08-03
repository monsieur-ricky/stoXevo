import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sxe-app-settings',
  standalone: true,
  imports: [
    FormsModule,

    ButtonModule,
    TooltipModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule
  ],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSettingsComponent {
  private readonly appStore = inject(ApplicationStore);

  openDialog = signal(false);

  apiKey!: string | null;

  constructor() {
    effect(async () => {
      if (this.openDialog()) {
        await this.appStore.getApiKey();
        this.apiKey = this.appStore.apiKey();
      }
    });
  }

  onSaveSettings(): void {
    if (!this.apiKey) {
      return;
    }

    this.appStore.setApiKey(this.apiKey);
    this.openDialog.set(false);
  }
}
