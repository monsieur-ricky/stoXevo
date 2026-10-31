import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '@shared/data';
import { legacyBackup } from '../../../../testing/backup.fixture';
import { ImportDataComponent } from './import-data.component';

describe('backup file import integration', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('reads a real JSON File and imports its encrypted contents', async () => {
    const store = TestBed.inject(ApplicationStore);
    await store.setPin('1234');
    const fixture = TestBed.createComponent(ImportDataComponent);
    fixture.componentInstance.openDialog.set(true);
    await fixture.whenStable();
    const file = new File([JSON.stringify(legacyBackup)], 'backup.json', {
      type: 'application/json'
    });
    fixture.componentInstance.onFileSelect({
      originalEvent: new Event('change'),
      files: [file],
      currentFiles: [file]
    });
    await vi.waitFor(() =>
      expect(fixture.componentInstance.importedData()).toEqual(legacyBackup)
    );
    await fixture.componentInstance.onImportData();
    await fixture.whenStable();
    expect(store.apiKey()).toBe('fixture-only');
    expect(fixture.componentInstance.openDialog()).toBe(false);
  });

  it('shows an accessible error for malformed JSON instead of throwing', async () => {
    const fixture = TestBed.createComponent(ImportDataComponent);
    fixture.componentInstance.openDialog.set(true);
    await fixture.whenStable();
    const file = new File(['not-json'], 'broken.json', {
      type: 'application/json'
    });
    fixture.componentInstance.onFileSelect({
      originalEvent: new Event('change'),
      files: [file],
      currentFiles: [file]
    });
    await vi.waitFor(() =>
      expect(fixture.componentInstance.error()).toContain('valid stoXevo')
    );
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent
    ).toContain('valid stoXevo');
    expect(fixture.componentInstance.importedData()).toBeUndefined();
  });

  it('keeps the dialog open when the backup PIN does not match', async () => {
    await TestBed.inject(ApplicationStore).setPin('9999');
    const fixture = TestBed.createComponent(ImportDataComponent);
    fixture.componentInstance.openDialog.set(true);
    fixture.componentInstance.importedData.set(legacyBackup);
    await fixture.whenStable();
    await fixture.componentInstance.onImportData();
    expect(fixture.componentInstance.openDialog()).toBe(true);
    expect(fixture.componentInstance.error()).toContain('current PIN');
    expect(localStorage.length).toBe(0);
  });
});
