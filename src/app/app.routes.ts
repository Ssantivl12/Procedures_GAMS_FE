import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // Placeholder routes (devs implement later)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage),
  },

  {
      path: 'dashboard',
      //canActivate: [authGuard],
      loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard.page')
        .then(m => m.DashboardPageComponent),
    },

  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: 'dashboard' },
];
