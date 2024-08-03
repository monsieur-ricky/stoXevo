import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'sxe-ui-side-menu',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true }
    },
    {
      label: 'Portfolio',
      icon: 'pi pi-list-check',
      routerLink: '/portfolio',
      routerLinkActiveOptions: { exact: true }
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: '/about',
      routerLinkActiveOptions: { exact: true }
    }
  ];
}
