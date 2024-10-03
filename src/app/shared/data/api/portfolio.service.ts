import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { STOXSCRAPER_API } from '@app';

import { Quote } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${STOXSCRAPER_API}/quote`;

  getQuote(symbol: string): Promise<Quote | undefined> {
    const url = `${this.apiUrl}/${symbol}`;

    return firstValueFrom(this.http.get<Quote>(url));
  }
}
