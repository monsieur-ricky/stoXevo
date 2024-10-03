import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { STOXSCRAPER_API } from '@app';

import { Profile } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${STOXSCRAPER_API}/profile`;

  get(symbol: string): Promise<Profile> {
    const url = `${this.apiUrl}/${symbol}`;

    return firstValueFrom(this.http.get<Profile>(url));
  }
}
