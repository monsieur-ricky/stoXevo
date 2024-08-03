import { PercentPipe, TitleCasePipe } from '@angular/common';
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
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'sxe-profile',
  standalone: true,
  imports: [RouterModule, PercentPipe, TitleCasePipe, AvatarModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);

  symbol = input<string>();

  profile = signal<Profile | undefined>(undefined);

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

    const profile = await this.profileService.get(symbol);
    this.profile.set(profile);
  }
}
