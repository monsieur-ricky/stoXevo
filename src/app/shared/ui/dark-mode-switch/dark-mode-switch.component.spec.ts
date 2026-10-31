import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DarkModeSwitchComponent } from './dark-mode-switch.component';

describe('theme integration', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
  });

  it('switches the Optimus and Tailwind dark-mode selector and saves the preference', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    const fixture = TestBed.createComponent(DarkModeSwitchComponent);
    await fixture.whenStable();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Enable Dark Theme');
    button.click();
    await fixture.whenStable();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('isDarkMode')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Enable Light Theme');
    button.click();
    await fixture.whenStable();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });
});
