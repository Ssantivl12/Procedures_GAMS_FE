import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ProcedureService } from '../../../procedures/services/procedure.service';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { Procedure, ProcedureStatus, PaginatedResponse } from '../../../../shared/models';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    StatusBadgeComponent, TypeBadgeComponent, EmptyStateComponent,
  ],
  templateUrl: './inbox-list.html',
  styleUrl: './inbox-list.css',
})
export class InboxListComponent implements OnInit {
  private readonly procedureService = inject(ProcedureService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  procedures: Procedure[] = [];
  filteredProcedures: Procedure[] = [];
  isLoading = true;
  searchQuery = '';
  activeFilter: string = 'all';

  get pageTitle(): string {
    if (this.auth.hasRole(UserRole.INSPECTOR)) return 'Mi Cola de Trabajo';
    if (this.auth.hasRole(UserRole.SECRETARIA)) return 'Trámites Pendientes';
    return 'Bandeja de Pendientes';
  }

  get pageSubtitle(): string {
    if (this.auth.hasRole(UserRole.INSPECTOR)) return 'Trámites asignados que requieren tu revisión';
    if (this.auth.hasRole(UserRole.SECRETARIA)) return 'Trámites pendientes de recojo u observaciones';
    return 'Trámites activos que requieren atención';
  }

  readonly filterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: ProcedureStatus.RECIBIDO, label: 'Recibido' },
    { value: ProcedureStatus.EN_REVISION, label: 'En Revisión' },
    { value: ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO, label: 'Pendiente Recojo' },
    { value: ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO, label: 'Pendiente Reingreso' },
  ];

  ngOnInit(): void {
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.isLoading = true;

    const params: Record<string, string | number | boolean> = {
      limit: 100,
      isActive: true,
    };

    // Filter by active statuses (exclude CERRADO and ABANDONADO)
    const activeStatuses = [
      ProcedureStatus.RECIBIDO,
      ProcedureStatus.EN_REVISION,
      ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO,
      ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO,
    ].join(',');
    params['status'] = activeStatuses;

    this.procedureService.getProcedures(params).subscribe({
      next: (res: PaginatedResponse<Procedure>) => {
        this.procedures = res.data || [];
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

  applyFilters(): void {
    let result = [...this.procedures];

    if (this.activeFilter !== 'all') {
      result = result.filter(p => p.currentStatus === this.activeFilter);
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

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getDaysElapsed(receptionDate: string): number {
    const start = new Date(receptionDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
