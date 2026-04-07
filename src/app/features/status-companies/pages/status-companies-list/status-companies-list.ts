import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { AlertsService } from '../../../dashboard/services/alerts.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { RaiExpirationAlert } from '../../../../shared/models';

@Component({
  selector: 'app-status-companies-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './status-companies-list.html',
  styleUrl: './status-companies-list.css',
})
export class StatusCompaniesListComponent implements OnInit {
  private readonly alertsService = inject(AlertsService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  searchQuery = '';
  alerts: RaiExpirationAlert[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.alertsService.getRaiExpiration().subscribe({
      next: (res: any) => {
        let rawItems: any[] = [];
        if (Array.isArray(res)) {
          rawItems = res;
        } else if (res && Array.isArray(res.data)) {
          rawItems = res.data;
        }

        // Map backend format to frontend UI format
        let items: RaiExpirationAlert[] = rawItems.map(item => {
          const expDate = new Date(item.expirationDate);
          const today = new Date();
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            companyId: item.company?.id || '',
            companyName: item.company?.legalName || 'Desconocida',
            raiNumber: item.company?.raiNumber || '',
            expirationDate: item.expirationDate,
            daysUntilExpiration: diffDays,
            status: item.semaforo // mapped from backend
          } as RaiExpirationAlert;
        });
        
        items = items.filter(a => a.status === 'POR_VENCER' || a.status === 'VENCIDO');
        
        items.sort((a, b) => {
          if (a.status === 'VENCIDO' && b.status !== 'VENCIDO') return -1;
          if (a.status !== 'VENCIDO' && b.status === 'VENCIDO') return 1;
          return a.daysUntilExpiration - b.daysUntilExpiration;
        });

        this.alerts = items;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching alerts', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredAlerts(): RaiExpirationAlert[] {
    if (!this.searchQuery.trim()) return this.alerts;
    const q = this.searchQuery.toLowerCase();
    return this.alerts.filter(a => 
      a.companyName.toLowerCase().includes(q) || 
      a.raiNumber?.toLowerCase().includes(q)
    );
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return localDate.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getAbsDays(days: number): number {
    return Math.abs(days);
  }

  notifyCompany(companyId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('Notificar empresa', companyId);
  }
}

