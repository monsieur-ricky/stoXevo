/**
 * Code from: https://gist.github.com/monsieur-ricky/acc8aa8ab5c3705e17c5a88ef68ac6f5
 */

import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

/**
 * Injection token for the global window object.
 */
export const WINDOW = new InjectionToken<Window>('Global window object', {
  factory: (): Window => inject(DOCUMENT).defaultView!
});

/**
 * Injection token for the window.navigator object.
 */
export const NAVIGATOR = new InjectionToken<Navigator>(
  'window.navigator object',
  {
    factory: (): Navigator => inject(WINDOW).navigator
  }
);
