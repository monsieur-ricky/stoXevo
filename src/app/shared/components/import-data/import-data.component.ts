import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { ApplicationData } from '@shared/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

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

  fileUpload = viewChild<FileUpload>('fileUpload');

  onImportData(): void {
    this.appStore.importData(this.importedData());
    this.openDialog.set(false);
  }

  onFileSelect(event: FileSelectEvent): void {
    const file = event.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = reader.result as string;
        this.importedData.set(JSON.parse(content));
      };
      reader.readAsText(file);
    }
  }

  onHideDialog(): void {
    this.importedData.set(undefined);
    this.fileUpload()?.clear();
  }
}
