import { computed, inject, Injectable, signal } from '@angular/core';
import { WINDOW } from '@shared/providers';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private readonly messageService = inject(MessageService);
  private readonly window = inject(WINDOW);

  private readonly onlineStatus = signal(true);

  isOnline = computed(() => this.onlineStatus());

  constructor() {
    this.window.addEventListener('online', () => {
      this.onlineStatus.set(true);

      this.messageService.add({
        severity: 'success',
        summary: "Yay! You're back online",
        detail: 'Updates are resumed.'
      });
    });

    this.window.addEventListener('offline', () => {
      this.onlineStatus.set(false);

      this.messageService.add({
        severity: 'error',
        summary: 'Oops! You are offline',
        detail: 'Updates are paused until you are back online.',
        life: 10000
      });
    });
  }
}
