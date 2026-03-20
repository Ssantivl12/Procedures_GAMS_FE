import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ReportFiltersComponent } from '../../components/report-filters/report-filters';
import {
  ReportsService,
  ReportFilters,
  ProcedureReportRow,
  StatusSummaryRow,
  TypeSummaryRow,
  InspectorReportRow,
} from '../../services/reports.service';
import { ProcedureStatus } from '../../../../shared/models';

type ReportTab = 'procedures' | 'status' | 'types' | 'inspectors';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, ReportFiltersComponent],
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
  statusData: StatusSummaryRow[] = [];
  typeData: TypeSummaryRow[] = [];
  inspectorData: InspectorReportRow[] = [];

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
      case 'status':
        this.reportsService.getStatusSummary(filters).subscribe({
          next: (data) => { this.statusData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.statusData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'types':
        this.reportsService.getTypeSummary(filters).subscribe({
          next: (data) => { this.typeData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.typeData = []; this.isLoading = false; this.cdr.detectChanges(); },
        });
        break;
      case 'inspectors':
        this.reportsService.getInspectorReport(filters).subscribe({
          next: (data) => { this.inspectorData = data; this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.inspectorData = []; this.isLoading = false; this.cdr.detectChanges(); },
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
