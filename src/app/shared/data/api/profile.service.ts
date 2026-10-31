import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { STOXSCRAPER_API } from '@app';

import { Profile } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = `${STOXSCRAPER_API}/profile`;

  resource(symbol: Signal<string | undefined>) {
    return httpResource<Profile>(() => {
      const value = symbol();
      return value ? `${this.apiUrl}/${encodeURIComponent(value)}` : undefined;
    });
  }
}
