import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sxe-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {

}
