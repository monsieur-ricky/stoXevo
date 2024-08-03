import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApplicationStore } from '@shared/data';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and replace the original params with the API key.
  const authReq = req.clone({
    setParams: {
      apikey: inject(ApplicationStore).apiKey() ?? ''
    }
  });

  // send cloned request with header to the next handler.
  return next(authReq);
};
