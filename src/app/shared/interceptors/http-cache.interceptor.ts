import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { LocalStorageService } from '@shared/services';
import { Subject, filter, finalize, of, tap } from 'rxjs';

const requests = new Map<
  string,
  {
    src: string;
    data: HttpResponse<any>;
    data$: Subject<HttpResponse<any>>;
    params?: any;
    ttl?: number;
  }
>();

export const httpCacheInterceptor = (options?: {
  urlsNotToCache?: string[];
  ttls?: { [url: string]: number };
  globalTTL?: number;
}) => {
  const { urlsNotToCache = [], ttls, globalTTL } = options ?? {};
  const fn: HttpInterceptorFn = (req, next) => {
    const appStore = inject(ApplicationStore);
    const storageService = inject(LocalStorageService);
    const key = `${req.url}`;

    const skipCache = urlsNotToCache.some(x => new RegExp(x).test(req.url));
    const prevRequest = () => {
      return requests.get(key);
    };

    const prevReq = prevRequest();
    const getTTL = () => {
      return new Date().getTime() + (ttls?.[req.url] ?? globalTTL ?? 0);
    };

    if (!skipCache) {
      if (prevReq) {
        const { data, data$, ttl } = prevReq;

        if (!data$.closed) {
          return prevReq.data$;
        }

        if (data && ttl && ttl > new Date().getTime()) {
          return of(prevReq.data);
        }

        prevReq.data$ = new Subject<any>();
      } else {
        const cachedData = storageService.getPlainValue(key);
        if (cachedData) {
          const { data, ttl } = JSON.parse(cachedData);
          if (data && ttl && ttl > new Date().getTime()) {
            return of(new HttpResponse<any>({ body: data }));
          }
        }

        requests.set(key, {
          src: req.url,
          data$: new Subject<HttpResponse<any>>(),
          data: new HttpResponse<any>(),
          params: req.body,
          ttl: getTTL()
        });
      }
    }

    return next(req).pipe(
      filter(x => x instanceof HttpResponse),
      tap(x => {
        const data = x as HttpResponse<any>;
        const r = prevRequest();
        if (!r) return;

        r.data = data;
        r.ttl = getTTL();
        !r.data$.closed && r.data$.next(data);

        // Cache the response in localStorage
        storageService.setPlainValue(
          key,
          JSON.stringify({ data: data.body, ttl: r.ttl })
        );
      }),
      finalize(() => {
        const r = prevRequest();
        r?.data$.complete();
        r?.data$.unsubscribe();
      })
    );
  };

  return fn;
};
