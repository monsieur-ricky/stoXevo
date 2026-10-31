import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '@shared/data';
import { ValueVisibilityComponent } from './value-visibility.component';

describe('value visibility integration', () => {
  afterEach(() => localStorage.clear());

  it('toggles sensitive values and persists the preference through the real UI', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(ValueVisibilityComponent);
    const store = TestBed.inject(ApplicationStore);
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(store.showValues()).toBe(true);
    button.click();
    await fixture.whenStable();

    expect(store.showValues()).toBe(false);
    expect(localStorage.getItem('showValues')).toBe('false');
    expect(button.querySelector('.pi-eye')).not.toBeNull();

    button.click();
    await fixture.whenStable();
    expect(store.showValues()).toBe(true);
    expect(localStorage.getItem('showValues')).toBe('true');
  });
});
