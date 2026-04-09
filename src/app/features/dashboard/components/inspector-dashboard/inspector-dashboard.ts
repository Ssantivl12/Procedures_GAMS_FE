import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { StatCardComponent } from '../stat-card/stat-card';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { InspectorDashboard, QueueItem, ProcedureStatus } from '../../../../shared/models';
import { formatPureDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-inspector-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './inspector-dashboard.html',
  styleUrl: './inspector-dashboard.css',
})
export class InspectorDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: InspectorDashboard | null = null;
  isLoading = true;

  get myQueue(): QueueItem[] {
    return this.dashboard?.myQueue || [];
  }

  get myOverdue(): QueueItem[] {
    return this.dashboard?.myOverdue || [];
  }

  get unassigned(): QueueItem[] {
    return this.dashboard?.unassigned || [];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        if (data.role === 'INSPECTOR') {
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
  }

  getStatusEnum(status: string): ProcedureStatus {
    return status as ProcedureStatus;
  }

  formatDate(date: string | null): string {
    return formatPureDate(date);
  }
}
