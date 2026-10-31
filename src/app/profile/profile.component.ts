import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileService } from '@shared/data/api';
import { MessageService } from '@openng/optimus-ui/api';
import { ProgressSpinnerModule } from '@openng/optimus-ui/progressspinner';

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

  private readonly profileResource = this.profileService.resource(this.symbol);
  profile = computed(() =>
    this.profileResource.hasValue() ? this.profileResource.value() : undefined
  );
  loading = this.profileResource.isLoading;

  constructor() {
    effect(() => {
      if (this.profileResource.error()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Oops!',
          detail: 'Failed to load the asset profile.'
        });
      }
    });
  }
}
