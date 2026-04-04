import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { CaseFile, CreateCaseFileDto, UpdateCaseFileDto } from '../../../shared/models/case-file.model';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

@Injectable({ providedIn: 'root' })
export class CaseFileService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/case-files';

  getCaseFiles(params?: Record<string, string | number | boolean>) {
    return this.api.get<PaginatedResponse<CaseFile>>(this.basePath, params);
  }

  getCaseFileById(id: string) {
    return this.api.get<CaseFile>(`${this.basePath}/${id}`);
  }

  getCaseFileByCompany(companyId: string) {
    return this.api.get<CaseFile>(`${this.basePath}/company/${companyId}`);
  }

  createCaseFile(data: CreateCaseFileDto) {
    return this.api.post<CaseFile>(this.basePath, data);
  }

  updateCaseFile(id: string, data: UpdateCaseFileDto) {
    return this.api.patch<CaseFile>(`${this.basePath}/${id}`, data);
  }

  closeCaseFile(id: string) {
    return this.api.patch<CaseFile>(`${this.basePath}/${id}/close`, null);
  }

  reopenCaseFile(id: string) {
    return this.api.patch<CaseFile>(`${this.basePath}/${id}/reopen`, null);
  }

  deleteCaseFile(id: string) {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
