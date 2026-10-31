import { TestBed } from '@angular/core/testing';
import { IV_KEY, SALT_KEY } from '@app';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService integration', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => localStorage.clear());

  it('returns null for missing data', async () => {
    expect(await service.get('missing')).toBeNull();
  });

  it('decrypts a fixed legacy export fixture, not just newly generated data', async () => {
    service.setPlainValue(SALT_KEY, 'WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTVd');
    service.setPlainValue(IV_KEY, 'WzE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3XQ==');
    service.setPlainValue('legacy', '9UqY/FAyPbp1DBqupcTwhhYuyCkvBs22tYZrmCeYMp6RsTqH+mUogiPuXY6HX1nVxWJSflc=');
    expect(await service.get('legacy', '1234')).toEqual({ assets: [], apiKey: 'fixture-only' });
  });

  it('retains the existing unencrypted base64 JSON format', async () => {
    const data = { assets: [], apiKey: 'local-only' };
    await service.set('test-data', data);
    expect(JSON.parse(atob(localStorage.getItem('test-data')!))).toEqual(data);
    expect(await service.get('test-data')).toEqual(data);
  });

  it('round trips encrypted financial data without storing plaintext', async () => {
    const data = { assets: [{ symbol: 'PRIVATE', value: 123 }], name: 'Épargne €' };
    await service.set('test-data', data, '123456');
    expect(localStorage.getItem('test-data')).not.toContain('PRIVATE');
    expect(localStorage.getItem(SALT_KEY)).toBeTruthy();
    expect(localStorage.getItem(IV_KEY)).toBeTruthy();
    expect(await service.get('test-data', '123456')).toEqual(data);
    await expect(service.get('test-data', '654321')).rejects.toThrow();
  });

  it('preserves unrelated browser keys when removing app data', () => {
    service.setPlainValue('unrelated', 'keep');
    service.setPlainValue('test-data', 'remove');
    service.removeKeys(['test-data']);
    expect(service.getPlainValue('test-data')).toBeNull();
    expect(service.getPlainValue('unrelated')).toBe('keep');
  });
});
