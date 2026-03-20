import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header';
import { AdminDashboardComponent } from '../../components/admin-dashboard/admin-dashboard';
import { SecretariaDashboardComponent } from '../../components/secretaria-dashboard/secretaria-dashboard';
import { InspectorDashboardComponent } from '../../components/inspector-dashboard/inspector-dashboard';
import { AuthService, UserRole, UserPayload } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    AdminDashboardComponent, SecretariaDashboardComponent, InspectorDashboardComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private user: UserPayload | null = null;

  get isAdmin(): boolean {
    return this.auth.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]);
  }

  get isSecretaria(): boolean {
    return this.auth.hasRole(UserRole.SECRETARIA);
  }

  get isInspector(): boolean {
    return this.auth.hasRole(UserRole.INSPECTOR);
  }

  get userName(): string {
    return this.user?.firstName || '';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => this.user = u);
  }
}
