import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { MenuItem } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { MenuModule } from '@openng/optimus-ui/menu';

@Component({
  selector: 'sxe-ui-side-menu',
  standalone: true,
  imports: [MenuModule, DrawerModule, ButtonModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  private readonly appStore = inject(ApplicationStore);

  isMobile = this.appStore.isMobile;
  visible = linkedSignal(this.appStore.showMenu);

  items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true },
      command: () => this.appStore.setShowMenu(false)
    },
    {
      label: 'Portfolio',
      icon: 'pi pi-list-check',
      routerLink: '/portfolio',
      routerLinkActiveOptions: { exact: true },
      command: () => this.appStore.setShowMenu(false)
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: '/about',
      routerLinkActiveOptions: { exact: true },
      command: () => this.appStore.setShowMenu(false)
    }
  ];

  onVisibleChange(visible: boolean): void {
    this.appStore.setShowMenu(visible);
  }
}
