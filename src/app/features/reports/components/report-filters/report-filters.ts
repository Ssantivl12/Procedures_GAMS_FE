import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';
import { ReportFilters } from '../../services/reports.service';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-bar">
      <div class="filter-group">
        <label>Desde</label>
        <input type="date" [(ngModel)]="filters.dateFrom" (ngModelChange)="onApply()" />
      </div>
      <div class="filter-group">
        <label>Hasta</label>
        <input type="date" [(ngModel)]="filters.dateTo" (ngModelChange)="onApply()" />
      </div>
      @if (showStatus) {
        <div class="filter-group">
          <label>Estado</label>
          <select [(ngModel)]="filters.status" (ngModelChange)="onApply()">
            <option [ngValue]="undefined">Todos</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ statusLabel(s) }}</option>
            }
          </select>
        </div>
      }
      @if (showType) {
        <div class="filter-group">
          <label>Tipo</label>
          <select [(ngModel)]="filters.procedureType" (ngModelChange)="onApply()">
            <option [ngValue]="undefined">Todos</option>
            @for (t of types; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
      }
      <div class="filter-actions">
        <button class="btn-clear" (click)="onClear()">Limpiar</button>
        <button class="btn-export" (click)="exportCsv.emit()" [disabled]="exporting">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {{ exporting ? 'Exportando...' : 'Exportar CSV' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filters-bar { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.75rem; font-weight: 500; color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: 0.05em; }
    .filter-group input, .filter-group select { padding: 0.4rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.875rem; }
    .filter-group input:focus, .filter-group select:focus { outline: none; border-color: hsl(var(--primary)); }
    .filter-actions { display: flex; gap: 0.5rem; margin-left: auto; }
    .btn-clear { padding: 0.4rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 8px; background: none; color: hsl(var(--muted-foreground)); font-size: 0.8125rem; cursor: pointer; }
    .btn-clear:hover { background: hsl(var(--accent)); color: hsl(var(--foreground)); }
    .btn-export { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
    .btn-export:hover { opacity: 0.9; }
    .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 640px) { .filter-actions { margin-left: 0; width: 100%; } .btn-export { flex: 1; justify-content: center; } }
  `],
})
export class ReportFiltersComponent {
  @Input() showStatus = true;
  @Input() showType = true;
  @Input() exporting = false;
  @Output() filtersChange = new EventEmitter<ReportFilters>();
  @Output() exportCsv = new EventEmitter<void>();

  filters: ReportFilters = {};
  readonly statuses = Object.values(ProcedureStatus);
  readonly types = Object.values(ProcedureTypeCode);

  statusLabel(s: ProcedureStatus): string {
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

  onApply(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  onClear(): void {
    this.filters = {};
    this.filtersChange.emit({});
  }
}
