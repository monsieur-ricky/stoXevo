import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'sxe-ui-purchase-form',
  imports: [FormsModule, ReactiveFormsModule, DatePicker, InputNumber],
  templateUrl: './purchase-form.component.html',
  styleUrl: './purchase-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseFormComponent implements OnInit, OnDestroy {
  form = input.required<FormGroup>();

  ngOnInit(): void {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.form()?.controls['purchase'].reset();
  }

  private createForm(): void {
    if (!this.form()) {
      return;
    }

    this.form()?.setControl(
      'purchase',
      new FormGroup({
        date: new FormControl(undefined, {
          validators: [Validators.required]
        }),
        price: new FormControl(undefined, {
          validators: [Validators.required]
        }),
        quantity: new FormControl(undefined, {
          validators: [Validators.required]
        })
      })
    );
  }
}
