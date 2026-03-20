import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ProcedureService } from '../../../procedures/services/procedure.service';
import { AlertsService } from '../../../dashboard/services/alerts.service';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { RaiSemaphoreComponent } from '../../../../shared/ui/rai-semaphore/rai-semaphore';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { Procedure, RaiExpirationAlert, ProcedureStatus, ProcedureTypeCode, PaginatedResponse } from '../../../../shared/models';

interface CompanyGroup {
  companyId: string;
  companyName: string;
  category: string;
  procedures: Procedure[];
  raiAlert?: RaiExpirationAlert;
}

@Component({
  selector: 'app-status-companies-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    StatusBadgeComponent, TypeBadgeComponent, RaiSemaphoreComponent, EmptyStateComponent,
  ],
  templateUrl: './status-companies-list.html',
  styleUrl: './status-companies-list.css',
})
export class StatusCompaniesListComponent implements OnInit {
  private readonly procedureService = inject(ProcedureService);
  private readonly alertsService = inject(AlertsService);
  private readonly cdr = inject(ChangeDetectorRef);

  activeTab = 'proceso';
  isLoading = true;
  searchQuery = '';

  procesoProcedures: Procedure[] = [];
  raiGroups: CompanyGroup[] = [];
  maiGroups: CompanyGroup[] = [];
  raiAlerts: RaiExpirationAlert[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Load active procedures (in-process)
    const activeStatuses = [
      ProcedureStatus.RECIBIDO,
      ProcedureStatus.EN_REVISION,
      ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO,
      ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO,
    ].join(',');

    this.procedureService.getProcedures({ status: activeStatuses, limit: 200 }).subscribe({
      next: (res: PaginatedResponse<Procedure>) => {
        this.procesoProcedures = res.data || [];
        this.buildGroups();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    // Load RAI expiration alerts
    this.alertsService.getRaiExpiration().subscribe({
      next: (alerts) => {
        this.raiAlerts = alerts || [];
        this.cdr.detectChanges();
      },
    });
  }

  private buildGroups(): void {
    // Group procedures by company for RAI and MAI tabs
    const raiMap = new Map<string, CompanyGroup>();
    const maiMap = new Map<string, CompanyGroup>();

    for (const proc of this.procesoProcedures) {
      const companyId = proc.caseFile?.company?.id || '';
      const companyName = proc.caseFile?.company?.legalName || 'Sin empresa';
      const category = proc.caseFile?.company?.category || '';
      const typeCode = proc.procedureType?.code;

      if (typeCode === ProcedureTypeCode.RAI) {
        if (!raiMap.has(companyId)) {
          raiMap.set(companyId, { companyId, companyName, category, procedures: [] });
        }
        raiMap.get(companyId)!.procedures.push(proc);
      } else if (typeCode === ProcedureTypeCode.MAI_PMA) {
        if (!maiMap.has(companyId)) {
          maiMap.set(companyId, { companyId, companyName, category, procedures: [] });
        }
        maiMap.get(companyId)!.procedures.push(proc);
      }
    }

    // Attach RAI alerts
    for (const alert of this.raiAlerts) {
      const group = raiMap.get(alert.companyId);
      if (group) group.raiAlert = alert;
    }

    this.raiGroups = Array.from(raiMap.values());
    this.maiGroups = Array.from(maiMap.values());
  }

  get filteredProceso(): Procedure[] {
    if (!this.searchQuery.trim()) return this.procesoProcedures;
    const q = this.searchQuery.toLowerCase();
    return this.procesoProcedures.filter(p =>
      (p.caseFile?.company?.legalName?.toLowerCase().includes(q)) ||
      (p.routeSheetNumber?.toLowerCase().includes(q)) ||
      (p.procedureType?.name?.toLowerCase().includes(q))
    );
  }

  get filteredRai(): CompanyGroup[] {
    if (!this.searchQuery.trim()) return this.raiGroups;
    const q = this.searchQuery.toLowerCase();
    return this.raiGroups.filter(g => g.companyName.toLowerCase().includes(q));
  }

  get filteredMai(): CompanyGroup[] {
    if (!this.searchQuery.trim()) return this.maiGroups;
    const q = this.searchQuery.toLowerCase();
    return this.maiGroups.filter(g => g.companyName.toLowerCase().includes(q));
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getLatestStatus(procedures: Procedure[]): ProcedureStatus {
    return procedures[0]?.currentStatus || ProcedureStatus.RECIBIDO;
  }
}
