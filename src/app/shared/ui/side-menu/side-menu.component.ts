import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { ApplicationStore } from '@shared/data';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';

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
  showMenu = this.appStore.showMenu;

  visible = signal(false);

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

  constructor() {
    effect(() => {
      const visible = this.showMenu();

      untracked(() => {
        this.visible.set(visible);
      });
    });
  }

  onVisibleChange(visible: boolean): void {
    this.appStore.setShowMenu(visible);
  }
}
