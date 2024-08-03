import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FMP_API_ENDPOINT_V3 } from '@app';

import { ShortQuote } from '@shared/models';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${FMP_API_ENDPOINT_V3}/quote-short`;

  getQuote(symbol: string): Promise<ShortQuote | undefined> {
    const url = `${this.apiUrl}/${symbol}`;

    return firstValueFrom(
      this.http
        .get<ShortQuote[]>(url)
        .pipe(map(response => (response ? response[0] : undefined)))
    );
  }
}
