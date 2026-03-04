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
      path: 'users',
      loadComponent: () => import('./features/users/pages/users-list/users-list')
        .then(m => m.UsersListComponent),
    },
  {
      path: 'companies',
      loadComponent: () => import('./features/companies/pages/companies-list/companies-list')
        .then(m => m.CompaniesListComponent),
    },

  {
      path: 'companies/:id', 
      loadComponent: () => import('./features/companies/pages/company-detail/company-detail')
        .then(m => m.CompanyDetailComponent),
    },
  
  {
      path: 'inbox', 
      loadComponent: () => import('./features/inbox/pages/inbox-list/inbox-list')
        .then(m => m.InboxListComponent),
    },
  {
      path: 'inbox/:id', 
      loadComponent: () => import('./features/inbox/pages/inbox-detail/inbox-detail')
        .then(m => m.InboxDetailComponent),
    },

  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: 'dashboard' },
];
