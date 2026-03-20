import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { ProcedureStatus, ProcedureTypeCode } from '../../../shared/models';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: ProcedureStatus;
  procedureType?: ProcedureTypeCode;
  inspectorId?: number;
}

export interface ProcedureReportRow {
  id: number;
  companyName: string;
  procedureType: string;
  status: ProcedureStatus;
  receivedDate: string;
  closedDate: string | null;
  inspectorName: string | null;
  daysElapsed: number;
  isOverdue: boolean;
}

export interface StatusSummaryRow {
  status: ProcedureStatus;
  count: number;
  percentage: number;
}

export interface TypeSummaryRow {
  procedureType: string;
  total: number;
  active: number;
  closed: number;
  avgDays: number;
}

export interface InspectorReportRow {
  inspectorId: number;
  inspectorName: string;
  assigned: number;
  closed: number;
  overdue: number;
  avgDays: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/reports';

  getProcedures(filters?: ReportFilters) {
    return this.api.get<ProcedureReportRow[]>(`${this.basePath}/procedures`, this.toParams(filters));
  }

  getStatusSummary(filters?: ReportFilters) {
    return this.api.get<StatusSummaryRow[]>(`${this.basePath}/status-summary`, this.toParams(filters));
  }

  getTypeSummary(filters?: ReportFilters) {
    return this.api.get<TypeSummaryRow[]>(`${this.basePath}/type-summary`, this.toParams(filters));
  }

  getInspectorReport(filters?: ReportFilters) {
    return this.api.get<InspectorReportRow[]>(`${this.basePath}/inspectors`, this.toParams(filters));
  }

  exportCsv(reportType: string, filters?: ReportFilters) {
    return this.api.getBlob(`${this.basePath}/${reportType}/csv`, this.toParams(filters));
  }

  private toParams(filters?: ReportFilters): Record<string, string | number | boolean> | undefined {
    if (!filters) return undefined;
    const params: Record<string, string | number | boolean> = {};
    if (filters.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters.dateTo) params['dateTo'] = filters.dateTo;
    if (filters.status) params['status'] = filters.status;
    if (filters.procedureType) params['procedureType'] = filters.procedureType;
    if (filters.inspectorId) params['inspectorId'] = filters.inspectorId;
    return Object.keys(params).length ? params : undefined;
  }
}
