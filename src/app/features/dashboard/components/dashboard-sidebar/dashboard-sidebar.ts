import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

type SidebarLink = {
  label: string;
  route: string;
  icon: 'home' | 'users' | 'building' | 'inbox' | 'status';
  badgeCount?: number;
};

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.css',
})
export class DashboardSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly links: SidebarLink[] = [
    { label: 'Inicio', route: '/dashboard', icon: 'home' },
    { label: 'Gestión de Personal', route: '/users', icon: 'users' },
    { label: 'Gestión de Empresas', route: '/companies', icon: 'building' },
    { label: 'Pendientes', route: '/inbox', icon: 'inbox', badgeCount: 12 },
    { label: 'Estado de empresas', route: '/status-companies', icon: 'status' },
  ];

  onNavigate(): void {
    this.close.emit();
  }

  onLogout(): void {
    this.auth.logout();
    this.close.emit();
    this.router.navigate(['/login']);
  }
}

