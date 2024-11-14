import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { STOXSCRAPER_API_KEY } from '@app';
import { ApplicationStore } from '@shared/data';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and replace the original headers with the API key.
  const authReq = req.clone({
    headers: req.headers.set(
      'stoxscraper-api-key',
      inject(ApplicationStore).apiKey() ?? STOXSCRAPER_API_KEY
    )
  });

  // send cloned request with header to the next handler.
  return next(authReq);
};
