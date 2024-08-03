import { FormControl, FormGroup } from '@angular/forms';

/**
 * Check if a FormGroup status is valid
 *
 * @param formGroup FormGroup
 * @returns True is valid, or False if invalid
 */
export const isFormValid = (formGroup: FormGroup): boolean => {
  const isValid = formGroup.valid;

  if (!isValid) {
    Object.values(formGroup.controls).forEach(control => {
      const childControls = control as FormGroup;
      if (childControls.controls) {
        isFormValid(childControls);
      }

      isControlValid(control as FormControl);
    });
  }

  return isValid;
};

/**
 * Checks if a form control is valid.
 *
 * @param control - The form control to check.
 * @returns A boolean indicating whether the control is valid.
 */
export const isControlValid = (control: FormControl): boolean => {
  const isValid = control.valid;

  if (!isValid) {
    control.markAsDirty();
    control.updateValueAndValidity({ onlySelf: true });
  }

  return isValid;
};
