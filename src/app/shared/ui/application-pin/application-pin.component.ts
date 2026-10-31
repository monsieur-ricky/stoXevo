import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { InputOtpModule } from '@openng/optimus-ui/inputotp';

@Component({
  selector: 'sxe-ui-application-pin',
  standalone: true,
  imports: [FormsModule, InputOtpModule],
  templateUrl: './application-pin.component.html',
  styleUrl: './application-pin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationPinComponent {
  private readonly appStore = inject(ApplicationStore);

  pin!: string;
  error = signal('');

  async onPinChange(pin: string): Promise<void> {
    this.pin = pin;
    this.error.set('');

    if (/^\d{4}$/.test(pin) && !(await this.appStore.setPin(pin))) {
      this.error.set(
        'Unable to unlock data. Check your PIN or restore a valid backup.'
      );
    }
  }
}
