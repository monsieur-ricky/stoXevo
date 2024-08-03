import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { InputOtpModule } from 'primeng/inputotp';

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

  onPinChange(pin: string): void {
    this.pin = pin;

    if (this.pin.length === 4) {
      this.appStore.setPin(this.pin);
    }
  }
}
