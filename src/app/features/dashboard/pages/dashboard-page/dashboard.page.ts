import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent {
  isSidebarOpen = false;

  stats = [
    { title: 'Empresas en Revisión', count: 1, iconKey: 'doc', colorClass: 'blue' },
    { title: 'Observaciones Pendientes', count: 1, iconKey: 'alert', colorClass: 'amber' },
    { title: 'Subsanaciones Pendientes', count: 1, iconKey: 'sync', colorClass: 'orange' },
    { title: 'Certificados por Vencer', count: 0, iconKey: 'calendar', colorClass: 'purple' },
    { title: 'IAA Atrasados', count: 1, iconKey: 'clock', colorClass: 'red' },
  ];

  mainActions = [
    { title: 'Gestión de Empresas', desc: 'Registrar y categorizar', iconKey: 'building', route: '/companies' },
    { title: 'Gestión de Personal', desc: 'Usuarios y permisos', iconKey: 'users', route: '/users' },
    { title: 'Bandeja de Pendientes', desc: 'Trámites en curso', iconKey: 'inbox', route: '/inbox' },
    { title: 'Historial', desc: 'Consultar pasados', iconKey: 'history', route: '/history' }
  ];
}