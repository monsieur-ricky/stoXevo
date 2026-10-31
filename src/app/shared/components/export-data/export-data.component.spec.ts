import { TestBed } from '@angular/core/testing';
import { IV_KEY, SALT_KEY, STORAGE_APP_DATA_KEY } from '@app';
import { legacyBackup } from '../../../../testing/backup.fixture';
import { ExportDataComponent } from './export-data.component';

describe('backup export integration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_APP_DATA_KEY, legacyBackup.appData as string);
    localStorage.setItem(SALT_KEY, legacyBackup.salt!);
    localStorage.setItem(IV_KEY, legacyBackup.iv!);
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('exports the unchanged encrypted envelope without requiring a scraper API key', async () => {
    const fixture = TestBed.createComponent(ExportDataComponent);
    await fixture.whenStable();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(false);

    let downloaded: Blob | undefined;
    const revoke = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: (blob: Blob) => {
        downloaded = blob;
        return 'blob:test-backup';
      },
      revokeObjectURL: revoke
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    await fixture.componentInstance.onExportData();
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith('blob:test-backup');
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(downloaded!);
    });
    expect(JSON.parse(content)).toEqual(legacyBackup);
    expect(content).not.toContain('fixture-only');
  });
});
