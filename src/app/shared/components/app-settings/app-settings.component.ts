import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

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
