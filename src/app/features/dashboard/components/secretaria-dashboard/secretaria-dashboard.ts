import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { StatCardComponent } from '../stat-card/stat-card';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SecretariaDashboard, PendingItem } from '../../../../shared/models';
import { formatPureDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, EmptyStateComponent],
  templateUrl: './secretaria-dashboard.html',
  styleUrl: './secretaria-dashboard.css',
})
export class SecretariaDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: SecretariaDashboard | null = null;
  isLoading = true;

  get pendingPickup(): PendingItem[] {
    return this.dashboard?.pendingPickup || [];
  }

  get pendingReentry(): PendingItem[] {
    return this.dashboard?.pendingReentry || [];
  }

  get recentlyReceived(): PendingItem[] {
    return this.dashboard?.recentlyReceived || [];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        if (data.role === 'SECRETARIA') {
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

  formatDate(date: string | null): string {
    return formatPureDate(date);
  }
}
