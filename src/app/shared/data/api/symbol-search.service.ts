import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { STOXSCRAPER_API } from '@app';
import { Symbol } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SymbolSearchService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${STOXSCRAPER_API}/search`;

  searchSymbols(query: string): Promise<Symbol[]> {
    const url = `${this.apiUrl}/${query}`;

    return firstValueFrom(this.http.get<Symbol[]>(url));
  }
}
