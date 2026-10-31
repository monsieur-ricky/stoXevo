import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, tap } from 'rxjs';
import { WINDOW } from '@shared/providers';
import { MessageService } from '@openng/optimus-ui/api';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private readonly messageService = inject(MessageService);
  private readonly window = inject(WINDOW);

  readonly isOnline = toSignal(
    merge(
      fromEvent(this.window, 'online').pipe(map(() => true)),
      fromEvent(this.window, 'offline').pipe(map(() => false))
    ).pipe(
      tap(online =>
        this.messageService.add({
          severity: online ? 'success' : 'error',
          summary: online ? "Yay! You're back online" : 'Oops! You are offline',
          detail: online
            ? 'Updates are resumed.'
            : 'Updates are paused until you are back online.',
          life: online ? undefined : 10000
        })
      )
    ),
    { initialValue: this.window.navigator.onLine }
  );
}
