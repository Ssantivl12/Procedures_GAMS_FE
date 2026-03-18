import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

type SidebarLink = {
  label: string;
  route: string;
  icon: string; 
  badgeCount?: number;
  roles?: UserRole[];
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
  @Input() isCollapsed = false;
  @Output() close = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly links: SidebarLink[] = [
    { 
      label: 'Inicio', 
      route: '/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
    },
    { 
      label: 'Gestión de Personal', 
      route: '/users', 
      icon: 'M12 14c4.97 0 9 2.24 9 5v1H3v-1c0-2.76 4.03-5 9-5zm0-2a4 4 0 100-8 4 4 0 000 8z',
      roles: [UserRole.SUPERADMIN]
    },
    { 
      label: 'Gestión de Empresas', 
      route: '/companies', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
    { 
      label: 'Pendientes', 
      route: '/inbox', 
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      badgeCount: 12 
    },
    { 
      label: 'Estado de empresas', 
      route: '/status-companies', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
  ];

  get availableLinks(): SidebarLink[] {
    return this.links.filter(link => !link.roles || this.auth.hasRole(link.roles));
  }

  onNavigate(): void {
    if (window.innerWidth < 1024) {
      this.close.emit();
    }
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onLogout(): void {
    this.auth.logout();
    if (window.innerWidth < 1024) {
      this.close.emit();
    }
    this.router.navigate(['/login']);
  }
}

