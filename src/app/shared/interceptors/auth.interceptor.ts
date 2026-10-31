import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { STOXSCRAPER_API } from '@app';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${STOXSCRAPER_API}/`)) return next(req);
  // Clone the request and replace the original headers with the API key.
  const authReq = req.clone({
    headers: req.headers.set(
      'stoxscraper-api-key',
      inject(ApplicationStore).apiKey() ?? ''
    )
  });

  // send cloned request with header to the next handler.
  return next(authReq);
};
