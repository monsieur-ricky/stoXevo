import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@dashboard').then(c => c.DashboardComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('@portfolio').then(c => c.PortfolioComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('@about').then(c => c.AboutComponent)
  },
  {
    path: 'profile/:symbol',
    loadComponent: () => import('@profile').then(c => c.ProfileComponent)
  }
];
