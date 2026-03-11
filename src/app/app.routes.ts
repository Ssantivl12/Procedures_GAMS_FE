import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AdminShellComponent } from './shared/layout/admin-shell/admin-shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'home',
    loadComponent: () => import('./features/home/HomePage').then(m => m.HomePage),
  },

  // Placeholder routes (devs implement later)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage),
  },

  {
    path: '',
    // canActivate: [authGuard],
    component: AdminShellComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard.page').then(
            (m) => m.DashboardPageComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/users-list/users-list').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/pages/companies-list/companies-list').then(
            (m) => m.CompaniesListComponent
          ),
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./features/companies/pages/company-detail/company-detail').then(
            (m) => m.CompanyDetailComponent
          ),
      },
      {
        path: 'inbox',
        loadComponent: () =>
          import('./features/inbox/pages/inbox-list/inbox-list').then(
            (m) => m.InboxListComponent
          ),
      },
      {
        path: 'inbox/:id',
        loadComponent: () =>
          import('./features/inbox/pages/inbox-detail/inbox-detail').then(
            (m) => m.InboxDetailComponent
          ),
      },
      {
        path: 'status-companies',
        loadComponent: () =>
          import(
            './features/status-companies/pages/status-companies-list/status-companies-list'
          ).then((m) => m.StatusCompaniesListComponent),
      },
      {
        path: 'status-companies/:id',
        loadComponent: () =>
          import(
            './features/status-companies/pages/status-companies-detail/status-companies-detail'
          ).then((m) => m.StatusCompaniesDetailComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: 'dashboard' },
];
