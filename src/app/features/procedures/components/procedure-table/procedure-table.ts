import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
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
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      @if (isLoading) {
        <div class="flex items-center justify-center py-16">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span class="ml-4 text-sm font-medium text-muted-foreground">Cargando trámites...</span>
        </div>
      } @else if (procedures.length === 0) {
        <app-empty-state title="Sin trámites" message="No se encontraron trámites con los filtros actuales."></app-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 text-[11px] uppercase tracking-[0.1em] text-muted-foreground border-b border-border">
                <th class="px-6 py-4 text-left font-bold">Expediente / Ruta</th>
                <th class="px-6 py-4 text-left font-bold">Empresa</th>
                <th class="px-6 py-4 text-left font-bold">Tipo</th>
                <th class="px-6 py-4 text-left font-bold">Estado</th>
                <th class="px-6 py-4 text-left font-bold">Plazos</th>
                <th class="px-6 py-4 text-left font-bold text-center">Inspector</th>
                <th class="px-6 py-4 text-right font-bold pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (proc of procedures; track proc.id) {
                <tr class="hover:bg-muted/30 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-foreground leading-tight">{{ proc.routeSheetNumber || '—' }}</div>
                    <div class="text-[11px] text-primary font-bold mt-0.5">{{ proc.caseFile?.code || '—' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-foreground leading-tight">{{ proc.caseFile?.company?.legalName || '—' }}</div>
                    <div class="text-[11px] text-muted-foreground mt-0.5">
                      {{ proc.companyStatus === 'OPERACION' ? 'Operación' : 
                         proc.companyStatus === 'PROYECTO' ? 'Proyecto' : 
                         proc.companyStatus === 'AMPLIACION' ? 'Ampliación' : 
                         proc.companyStatus === 'DIVERSIFICACION' ? 'Diversificación' : proc.companyStatus || '—' }}
                    </div>
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
                  <td class="px-6 py-4 text-center">
                    <span class="text-sm font-medium text-muted-foreground">
                      {{ proc.assignedInspector ? proc.assignedInspector.firstName + ' ' + proc.assignedInspector.lastName : 'Sin asignar' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right pr-6">
                    <a [routerLink]="['/procedures', proc.id]"
                       class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-bold transition-colors">
                      Ver Detalles
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
        
        <!-- Standardized Pagination Footer -->
        <div *ngIf="!isLoading && totalItems > 0"
            class="bg-white px-6 py-4 border-t border-border flex items-center justify-between">

          <div class="text-sm text-muted-foreground font-medium">
            Mostrando 
            <span class="font-semibold text-foreground">{{ procedures.length }}</span> 
            de 
            <span class="font-semibold text-foreground">{{ totalItems }}</span> 
            registros
          </div>

          <div *ngIf="totalPages > 1" class="flex items-center gap-2">
            <button
              class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Anterior
            </button>

            <div class="flex items-center px-1 gap-1">
              <button
                *ngFor="let page of pageNumbers"
                (click)="changePage(page)"
                [class]="currentPage === page
                  ? 'w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-md shadow-primary/20 cursor-pointer'
                  : 'w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted font-semibold transition-colors cursor-pointer'">
                {{ page }}
              </button>
            </div>

            <button
              class="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:border-border disabled:text-muted-foreground disabled:pointer-events-none transition-all"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)">
              Siguiente
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `]
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

  get pageNumbers(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end   = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  ngOnChanges(): void {
    this.currentPage = 1;
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    const params: Record<string, string | number | boolean> = {
      page: this.currentPage,
      limit: this.pageSize,
    };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.statusFilter) params['status'] = this.statusFilter;
    if (this.typeFilter) params['procedureTypeCode'] = this.typeFilter;

    this.procedureService.getProcedures(params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.procedures = res.data;
          this.totalPages = res.meta.totalPages;
          this.totalItems = res.meta.total;
        },
        error: () => {
          this.procedures = [];
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
