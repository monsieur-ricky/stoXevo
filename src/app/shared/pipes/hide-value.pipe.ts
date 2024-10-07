import { computed, inject, Pipe, PipeTransform } from '@angular/core';
import { ApplicationStore } from '@shared/data';

@Pipe({
  name: 'hideValue',
  standalone: true,
  // Warning: Impure pipes should be avoided!
  // In this case the pipe is impure because it depends on an external state
  //and will only be triggered then the Signal changes.
  pure: false
})
export class HideValuePipe implements PipeTransform {
  private readonly appStore = inject(ApplicationStore);

  transform(value: string | number | null): string | number | null {
    const sanitizedValue = value?.toString().replace(/[.,]/g, '');
    const charCount = sanitizedValue?.length ?? 0;
    const hiddenChars = '●'.repeat(charCount);
    const showValues = this.appStore.showValues();
    const result = computed(() => (showValues ? value : hiddenChars));

    return result();
  }
}
