import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { Procedure, ProcedureTypeCode } from '../../../../shared/models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { DeadlineIndicatorComponent } from '../../../../shared/ui/deadline-indicator/deadline-indicator';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-procedure-table',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, TypeBadgeComponent, DeadlineIndicatorComponent, EmptyStateComponent],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      @if (isLoading) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="ml-2 text-sm text-muted-foreground">Cargando trámites...</span>
        </div>
      } @else if (procedures.length === 0) {
        <app-empty-state title="Sin trámites" message="No se encontraron trámites con los filtros actuales."></app-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th class="px-6 py-4 text-left font-semibold">Expediente / Ruta</th>
                <th class="px-6 py-4 text-left font-semibold">Empresa</th>
                <th class="px-6 py-4 text-left font-semibold">Tipo</th>
                <th class="px-6 py-4 text-left font-semibold">Estado</th>
                <th class="px-6 py-4 text-left font-semibold">Plazos</th>
                <th class="px-6 py-4 text-left font-semibold">Inspector</th>
                <th class="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (proc of procedures; track proc.id) {
                <tr class="hover:bg-muted/30 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-foreground">{{ proc.routeSheetNumber || '—' }}</div>
                    <div class="text-xs text-muted-foreground">{{ proc.internalFileNumber || '—' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-foreground">{{ proc.caseFile?.company?.legalName || '—' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    @if (proc.procedureType) {
                      <app-type-badge [type]="$any(proc.procedureType.code)"></app-type-badge>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <app-status-badge [status]="proc.currentStatus"></app-status-badge>
                  </td>
                  <td class="px-6 py-4">
                    <app-deadline-indicator [deadlineDate]="proc.deadlineDate" [isOverdue]="proc.isOverdue"></app-deadline-indicator>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-muted-foreground">
                      {{ proc.assignedInspector ? proc.assignedInspector.firstName + ' ' + proc.assignedInspector.lastName : 'Sin asignar' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="['/procedures', proc.id]"
                       class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors opacity-0 group-hover:opacity-100">
                      Ver Trámite
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-between text-sm">
          <span class="text-muted-foreground">
            Mostrando {{ procedures.length }} de {{ totalItems }} trámites
          </span>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)">
              Anterior
            </button>
            <span class="text-muted-foreground">{{ currentPage }} / {{ totalPages }}</span>
            <button
              class="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)">
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProcedureTableComponent implements OnInit, OnChanges {
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() searchQuery = '';
  @Input() statusFilter = '';
  @Input() typeFilter = '';
  @Input() pageSize = 10;
  @Output() edit = new EventEmitter<Procedure>();

  procedures: Procedure[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.loadProcedures();
  }

  ngOnChanges(): void {
    this.currentPage = 1;
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.isLoading = true;
    const params: Record<string, string | number | boolean> = {
      page: this.currentPage,
      limit: this.pageSize,
    };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.statusFilter) params['currentStatus'] = this.statusFilter;
    if (this.typeFilter) params['procedureTypeCode'] = this.typeFilter;

    this.procedureService.getProcedures(params).subscribe({
      next: (res) => {
        this.procedures = res.data;
        this.totalPages = res.meta.totalPages;
        this.totalItems = res.meta.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProcedures();
  }

  refresh(): void {
    this.loadProcedures();
  }
}
