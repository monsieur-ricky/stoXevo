import { TestBed } from '@angular/core/testing';
import { STORAGE_APP_DATA_KEY } from '@app';
import { ApplicationStore } from '@shared/data';
import { LocalStorageService } from '@shared/services';
import { ApplicationPinComponent } from './application-pin.component';

describe('PIN entry integration', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('does not unlock for a partial PIN', async () => {
    const fixture = TestBed.createComponent(ApplicationPinComponent);
    await fixture.whenStable();
    await fixture.componentInstance.onPinChange('123');
    expect(TestBed.inject(ApplicationStore).pin()).toBeNull();
  });

  it('shows an accessible error for a wrong PIN and permits retry', async () => {
    await TestBed.inject(LocalStorageService).set(
      STORAGE_APP_DATA_KEY,
      { assets: [], apiKey: null },
      '1234'
    );
    const fixture = TestBed.createComponent(ApplicationPinComponent);
    await fixture.whenStable();
    await fixture.componentInstance.onPinChange('9999');
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent
    ).toContain('Check your PIN');
    expect(TestBed.inject(ApplicationStore).pin()).toBeNull();
    await fixture.componentInstance.onPinChange('1234');
    await fixture.whenStable();
    expect(TestBed.inject(ApplicationStore).pin()).toBe('1234');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
