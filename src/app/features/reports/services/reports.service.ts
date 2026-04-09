import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { ProcedureStatus, ProcedureTypeCode } from '../../../shared/models';
import { PaginatedResponse } from '../../../shared/models/paginated-response';
import { map } from 'rxjs/operators';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  currentStatus?: ProcedureStatus;
  procedureTypeCode?: ProcedureTypeCode;
  assignedInspectorId?: string;
  category?: string;
  municipality?: string;
  format?: 'json' | 'csv';
  page?: number;
  limit?: number;
}

export interface ProcedureReportRow {
  procedureId: string;
  caseFileCode: string;
  companyName: string;
  procedureType: string;
  procedureKind: string;
  currentStatus: ProcedureStatus;
  cycleCount: number;
  receptionDate: string;
  reviewStartDate: string | null;
  deadlineDate: string | null;
  daysElapsed: number | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  approvalDate: string | null;
  expirationDate: string | null;
  approvalCertificate: string | null;
  assignedInspectorName: string | null;
  routeSheetNumber: string | null;
  openObservationsCount: number;
}

export interface CompanyReportRow {
  companyId: string;
  legalName: string;
  raiNumber: string;
  category: string;
  currentStatus: string;
  lastProcedureDate: string | null;
  raiExpirationDate: string | null;
  raiStatus: string;
}

export interface ActivityReportRow {
  period: { from: string; to: string };
  received: number;
  closed: number;
  abandoned: number;
  avgDaysToClose: number;
  avgCyclesPerProcedure: number;
  byType: Record<string, { received: number; closed: number; abandoned: number }>;
  byInspector: Record<string, { closed: number; abandoned: number }>;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/reports';

  getProcedures(filters?: ReportFilters) {
    return this.api.get<PaginatedResponse<ProcedureReportRow>>(`${this.basePath}/procedures`, this.toParams(filters))
      .pipe(map(res => res.data));
  }

  getCompanies(filters?: ReportFilters) {
    return this.api.get<PaginatedResponse<CompanyReportRow>>(`${this.basePath}/companies`, this.toParams(filters))
      .pipe(map(res => res.data));
  }

  getExpiredRai(filters?: ReportFilters) {
    return this.api.get<PaginatedResponse<CompanyReportRow>>(`${this.basePath}/expired-rai`, this.toParams(filters))
      .pipe(map(res => res.data));
  }

  getIaaStatus(filters?: ReportFilters) {
    return this.api.get<PaginatedResponse<CompanyReportRow>>(`${this.basePath}/iaa-status`, this.toParams(filters))
      .pipe(map(res => res.data));
  }

  getActivity(filters?: ReportFilters) {
    return this.api.get<ActivityReportRow>(`${this.basePath}/activity`, this.toParams(filters));
  }

  exportCsv(reportType: string, filters?: ReportFilters) {
    return this.api.getBlob(`${this.basePath}/${reportType}`, {
      ...this.toParams(filters),
      format: 'csv'
    });
  }

  private toParams(filters?: ReportFilters): Record<string, string | number | boolean> | undefined {
    if (!filters) return undefined;
    const params: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params[k] = v;
      }
    });
    return Object.keys(params).length ? params : undefined;
  }
}
