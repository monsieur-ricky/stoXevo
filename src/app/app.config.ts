import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideZoneChangeDetection
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions
} from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from '@shared/interceptors';
import { MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';
import { routes } from './app.routes';
import { MyThemePreset } from './my-theme.present';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideAnimationsAsync(),
    importProvidersFrom([BrowserModule, BrowserAnimationsModule]),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideOptimus({
      theme: {
        preset: MyThemePreset,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    })
  ]
};
