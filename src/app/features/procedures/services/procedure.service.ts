import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClient } from '../../../api/api-client';
import {
  Procedure,
  ProcedureAudit,
  ChangeStatusPayload,
  CreateProcedurePayload,
  PaginatedResponse,
  ProcedureCycle,
} from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/procedures';

  getProcedures(params?: Record<string, string | number | boolean>) {
    return this.api.get<PaginatedResponse<Procedure>>(this.basePath, params);
  }

  getProcedureById(id: string) {
    return this.api.get<Procedure>(`${this.basePath}/${id}`);
  }

  getProceduresByCaseFile(caseFileId: string, params?: Record<string, string | number | boolean>) {
    return this.api.get<PaginatedResponse<Procedure>>(`/case-files/${caseFileId}/procedures`, params);
  }

  createProcedure(data: CreateProcedurePayload) {
    return this.api.post<Procedure>(this.basePath, data);
  }

  updateProcedure(id: string, data: Partial<Procedure>) {
    return this.api.patch<Procedure>(`${this.basePath}/${id}`, data);
  }

  changeStatus(id: string, data: ChangeStatusPayload) {
    return this.api.patch<Procedure>(`${this.basePath}/${id}/status`, data);
  }

  assignInspector(id: string, inspectorUserId: string) {
    return this.api.patch<Procedure>(`${this.basePath}/${id}/assign`, { inspectorUserId });
  }

  deleteProcedure(id: string) {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  getAuditHistory(id: string) {
    return this.api.get<ProcedureAudit[] | { data: ProcedureAudit[] }>(`${this.basePath}/${id}/audit`).pipe(
      map(resp => Array.isArray(resp) ? resp : (resp?.data || []))
    );
  }

  getCycles(procedureId: string) {
    return this.api.get<ProcedureCycle[] | { data: ProcedureCycle[] }>(`${this.basePath}/${procedureId}/cycles`).pipe(
      map(resp => Array.isArray(resp) ? resp : (resp?.data || []))
    );
  }

  getCycle(procedureId: string, cycleId: string) {
    return this.api.get<ProcedureCycle>(`${this.basePath}/${procedureId}/cycles/${cycleId}`);
  }
}
