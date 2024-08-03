import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { ApplicationData } from '@shared/models';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IV_KEY, SALT_KEY, STORAGE_APP_DATA_KEY } from 'src/app/app.settings';
import { LocalStorageService } from './../../services/local-storage.service';

@Component({
  selector: 'sxe-export-data',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './export-data.component.html',
  styleUrl: './export-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportDataComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly appStore = inject(ApplicationStore);

  isApiKeySet = this.appStore.isApiKeySet;

  async onExportData(): Promise<void> {
    const appData =
      await this.localStorageService.getPlainValue(STORAGE_APP_DATA_KEY);
    const salt = await this.localStorageService.getPlainValue(SALT_KEY);
    const iv = await this.localStorageService.getPlainValue(IV_KEY);
    const data: ApplicationData = { appData, salt, iv };
    const now = new Date().toISOString().split('T')[0];
    const fileName = `stoXevo-data-${now}.json`;

    this.downloadFile(JSON.stringify(data), fileName);
  }

  private downloadFile(data: string, filename: string): void {
    const file = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
