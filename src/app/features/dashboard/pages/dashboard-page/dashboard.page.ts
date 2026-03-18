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
  isLoading = false;
  pendingItems: any[] = []; // Se poblará más adelante con la integración del backend
  
  // Mock para visualización (se puede comentar o remover luego)
  // pendingItems = [
  //   { id: '1', title: 'Revisión de Informe Ambiental', type: 'TRÁMITE', status: 'PENDING', date: new Date() }
  // ];

  constructor() {}
}