import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ReportFiltersComponent } from '../../components/report-filters/report-filters';
import {
  ReportsService,
  ReportFilters,
  ProcedureReportRow,
  CompanyReportRow,
  ActivityReportRow,
} from '../../services/reports.service';
import { ProcedureStatus } from '../../../../shared/models';

type ReportTab = 'procedures' | 'companies' | 'expired-rai' | 'iaa-status' | 'activity';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, ReportFiltersComponent],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPageComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly cdr = inject(ChangeDetectorRef);

  activeTab: ReportTab = 'procedures';
  isLoading = false;
  isExporting = false;
  currentFilters: ReportFilters = {};

  proceduresData: ProcedureReportRow[] = [];
  companiesData: CompanyReportRow[] = [];
  expiredRaiData: CompanyReportRow[] = [];
  iaaStatusData: CompanyReportRow[] = [];
  activityData: ActivityReportRow | null = null;

  ngOnInit(): void {
    this.loadReport();
  }

  switchTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.loadReport();
  }

  onFiltersChange(filters: ReportFilters): void {
    this.currentFilters = filters;
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    const filters = this.currentFilters;

    switch (this.activeTab) {
      case 'procedures':
        this.reportsService.getProcedures(filters).subscribe({
          next: (data) => { this.proceduresData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.proceduresData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'companies':
        this.reportsService.getCompanies(filters).subscribe({
          next: (data) => { this.companiesData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.companiesData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'expired-rai':
        this.reportsService.getExpiredRai(filters).subscribe({
          next: (data) => { this.expiredRaiData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.expiredRaiData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'iaa-status':
        this.reportsService.getIaaStatus(filters).subscribe({
          next: (data) => { this.iaaStatusData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.iaaStatusData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'activity':
        this.reportsService.getActivity(filters).subscribe({
          next: (data) => { this.activityData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.activityData = null; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
    }
  }

  onExportCsv(): void {
    this.isExporting = true;
    this.reportsService.exportCsv(this.activeTab, this.currentFilters).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${this.activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExporting = false;
        this.cdr.detectChanges();
      },
    });
  }

  statusLabel(s: ProcedureStatus | string): string {
    const labels: Record<string, string> = {
      RECIBIDO: 'Recibido',
      EN_REVISION: 'En Revisión',
      OBSERVADO_PENDIENTE_RECOJO: 'Observado',
      SUBSANACION_PENDIENTE_REINGRESO: 'Subsanación',
      CERRADO: 'Cerrado',
      ABANDONADO: 'Abandonado',
    };
    return labels[s] || s;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }
}
