import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileService } from '@shared/data/api';
import { Profile } from '@shared/models';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'sxe-profile',
  standalone: true,
  imports: [RouterModule, PercentPipe, CurrencyPipe, ProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);

  symbol = input<string>();

  profile = signal<Profile | undefined>(undefined);
  loading = signal(false);

  constructor() {
    effect(() => {
      const symbol = this.symbol();
      untracked(() => this.getProfile(symbol));
    });
  }

  private async getProfile(symbol: string | undefined): Promise<void> {
    if (!symbol) {
      this.profile.set(undefined);
      return;
    }

    try {
      this.loading.set(true);
      const profile = await this.profileService.get(symbol);
      this.profile.set(profile);
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Oops!',
        detail: 'Failed to load the asset profile.'
      });
    } finally {
      this.loading.set(false);
    }
  }
}
