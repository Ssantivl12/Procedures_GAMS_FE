import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { AlertsService } from '../../services/alerts.service';
import { StatCardComponent } from '../stat-card/stat-card';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import {
  AdminDashboard, OverdueItem, InspectorWorkload,
  AlertsSummary, ProcedureStatus, RaiExpirationAlert,
} from '../../../../shared/models';
import { formatPureDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, EmptyStateComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly alertsService = inject(AlertsService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: AdminDashboard | null = null;
  alerts: AlertsSummary | null = null;
  isLoading = true;

  get totalActive(): number {
    if (!this.dashboard?.statusSummary) return 0;
    const s = this.dashboard.statusSummary;
    return (s[ProcedureStatus.RECIBIDO] || 0)
      + (s[ProcedureStatus.EN_REVISION] || 0)
      + (s[ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO] || 0)
      + (s[ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO] || 0);
  }

  get totalClosed(): number {
    return this.dashboard?.statusSummary?.[ProcedureStatus.CERRADO] || 0;
  }

  get overdueCount(): number {
    return this.dashboard?.overdueList?.length || 0;
  }

  get overdueList(): OverdueItem[] {
    return this.dashboard?.overdueList?.slice(0, 8) || [];
  }

  get iaaDelinquent(): any[] {
    return this.dashboard?.iaaDelinquent || [];
  }

  get raiExpirationAlerts(): RaiExpirationAlert[] {
    return this.dashboard?.raiExpirationAlerts || [];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        if (data.role === 'ADMIN') {
          this.dashboard = data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.alertsService.getSummary().subscribe({
      next: (summary) => {
        this.alerts = summary;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  formatDate(date: string | null): string {
    return formatPureDate(date);
  }
}
