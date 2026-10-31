import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { ApplicationData } from '@shared/models';
import { isApplicationData } from '@shared/utils';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { FileUpload, FileUploadModule } from '@openng/optimus-ui/fileupload';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

interface FileSelectEvent {
  originalEvent: Event;
  files: File[];
  currentFiles: File[];
}

@Component({
  selector: 'sxe-import-data',
  standalone: true,
  imports: [ButtonModule, TooltipModule, DialogModule, FileUploadModule],
  templateUrl: './import-data.component.html',
  styleUrl: './import-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDataComponent {
  private readonly appStore = inject(ApplicationStore);

  openDialog = signal(false);
  importedData = signal<ApplicationData | undefined>(undefined);
  error = signal('');
  importing = signal(false);

  fileUpload = viewChild<FileUpload>('fileUpload');

  async onImportData(): Promise<void> {
    this.importing.set(true);
    this.error.set('');
    try {
      await this.appStore.importData(this.importedData());
      this.openDialog.set(false);
    } catch {
      this.error.set(
        'Import failed. Choose a valid backup encrypted with your current PIN.'
      );
    } finally {
      this.importing.set(false);
    }
  }

  onFileSelect(event: FileSelectEvent): void {
    this.importedData.set(undefined);
    this.error.set('');
    const file = event.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data: unknown = JSON.parse(reader.result as string);
          if (!isApplicationData(data)) throw new Error('Invalid backup');
          this.importedData.set(data);
        } catch {
          this.error.set('Choose a valid stoXevo JSON backup.');
        }
      };
      reader.onerror = () =>
        this.error.set('Unable to read the selected file.');
      reader.readAsText(file);
    }
  }

  onHideDialog(): void {
    this.importedData.set(undefined);
    this.error.set('');
    this.fileUpload()?.clear();
  }
}
