import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ProcedureService } from '../../../procedures/services/procedure.service';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { Procedure, ProcedureStatus, PaginatedResponse } from '../../../../shared/models';
import { showToast } from '../../../../shared/utils/toast.utils';
import { parsePureDate, formatPureDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    TypeBadgeComponent, EmptyStateComponent,
  ],
  templateUrl: './inbox-list.html',
  styleUrl: './inbox-list.css',
})
export class InboxListComponent implements OnInit {
  private readonly procedureService = inject(ProcedureService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  procedures: Procedure[] = [];
  filteredProcedures: Procedure[] = [];
  isLoading = true;
  searchQuery = '';
  activeFilter: string = 'all';

  get pageTitle(): string {
    return 'Tablero de Trámites Pendientes';
  }

  get pageSubtitle(): string {
    return 'Tablero de trámites pendientes de atención. Haga click en un trámite para ver detalles.';
  }

  readonly filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'rojo', label: 'Urgentes (Rojo)' },
    { value: 'amarillo', label: 'Por vencer (Amarillo)' },
  ];

  get columnRecibidos() {
    return this.filteredProcedures.filter(p => p.currentStatus === ProcedureStatus.RECIBIDO);
  }

  get columnRevision() {
    return this.filteredProcedures.filter(p => p.currentStatus === ProcedureStatus.EN_REVISION);
  }

  get columnPendientes() {
    return this.filteredProcedures.filter(p => 
      p.currentStatus === ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO || 
      p.currentStatus === ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO
    );
  }

  ngOnInit(): void {
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.isLoading = true;

    const params: Record<string, string | number | boolean> = {
      limit: 50,
      isActive: true,
    };

    const activeStatuses = [
      ProcedureStatus.RECIBIDO,
      ProcedureStatus.EN_REVISION,
      ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO,
      ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO,
    ];

    this.procedureService.getProcedures(params).subscribe({
      next: (res: PaginatedResponse<Procedure>) => {
        const allProcedures = res.data || [];
        this.procedures = allProcedures.filter(p => 
          activeStatuses.includes(p.currentStatus as ProcedureStatus)
        );
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  getEffectiveDeadline(proc: Procedure): string | null | undefined {
    return proc.currentStatus === ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO
      ? proc.subsanacionDeadlineDate
      : proc.deadlineDate;
  }

  applyFilters(): void {
    let result = [...this.procedures];

    if (this.activeFilter !== 'all') {
      result = result.filter(p => this.getSlaStatus(this.getEffectiveDeadline(p)) === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.routeSheetNumber?.toLowerCase().includes(q)) ||
        (p.caseFile?.company?.legalName?.toLowerCase().includes(q)) ||
        (p.procedureType?.name?.toLowerCase().includes(q))
      );
    }

    this.filteredProcedures = result;
  }

  getSlaStatus(deadlineDate: string | null | undefined): 'rojo' | 'amarillo' | 'verde' {
    if (!deadlineDate) return 'verde';
    const deadline = parsePureDate(deadlineDate);
    const now = new Date();
    deadline.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'rojo';
    if (diffDays <= 5) return 'amarillo';
    return 'verde';
  }

  getSlaClasses(deadlineDate: string | null | undefined): string {
    const sla = this.getSlaStatus(deadlineDate);
    switch (sla) {
      case 'rojo': return 'bg-red-50 border-red-300 ring-1 ring-red-500';
      case 'amarillo': return 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-400';
      case 'verde': return 'bg-white border-gray-200';
    }
  }

  getSlaLabel(deadlineDate: string | null | undefined): string {
    const sla = this.getSlaStatus(deadlineDate);
    if (sla === 'rojo') return 'Vence pronto';
    if (sla === 'amarillo') return 'Atención requerida';
    return 'A tiempo';
  }

  formatDate(date: string | null | undefined): string {
    return formatPureDate(date);
  }

  onAssign(procId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    showToast('info', 'Por ahora asigne desde la pantalla de detalle del trámite.');
    this.router.navigate(['/procedures', procId]);
  }

  onObserve(procId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/procedures', procId]);
  }
}

