import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sxe-ui-value-visibility',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './value-visibility.component.html',
  styleUrl: './value-visibility.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueVisibilityComponent {
  private readonly appStore = inject(ApplicationStore);

  showValues = this.appStore.showValues;

  icon = computed(() => (this.showValues() ? 'pi pi-eye-slash' : 'pi pi-eye'));
  tooltip = computed(() => (this.showValues() ? 'Hide Values' : 'Show Values'));

  onShowValuesChange(): void {
    this.appStore.setShowValues(!this.showValues());
  }
}
