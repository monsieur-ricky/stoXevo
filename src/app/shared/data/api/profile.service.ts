import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FMP_API_ENDPOINT_V3 } from '@app';

import { Profile } from '@shared/models';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${FMP_API_ENDPOINT_V3}/profile`;

  get(symbol: string): Promise<Profile> {
    const url = `${this.apiUrl}/${symbol}`;

    return firstValueFrom(
      this.http.get<Profile[]>(url).pipe(map(response => response[0]))
    );
  }
}
