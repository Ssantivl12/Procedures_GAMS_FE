import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiClient } from '../../../api/api-client';
import { ProcedureDocument, DocumentGroup } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiClient);

  getDocuments(procedureId: string, params?: Record<string, string | number | boolean>) {
    return this.api.get<ProcedureDocument[] | { data: ProcedureDocument[] }>(`/procedures/${procedureId}/documents`, params).pipe(
      map(resp => Array.isArray(resp) ? resp : (resp?.data || []))
    );
  }

  getDocument(procedureId: string, id: string) {
    return this.api.get<ProcedureDocument>(`/procedures/${procedureId}/documents/${id}`);
  }

  uploadDocument(
    procedureId: string,
    file: File,
    docGroup: DocumentGroup,
    cycleId?: string,
    description?: string
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docGroup', docGroup);
    if (cycleId) formData.append('cycleId', cycleId);
    if (description) formData.append('description', description);
    return this.api.postFormData<ProcedureDocument>(`/procedures/${procedureId}/documents`, formData);
  }

  downloadDocument(procedureId: string, id: string) {
    return this.api.getBlob(`/procedures/${procedureId}/documents/${id}/download`);
  }

  getVersionHistory(procedureId: string, id: string) {
    return this.api.get<ProcedureDocument[]>(`/procedures/${procedureId}/documents/${id}/versions`);
  }

  deleteDocument(procedureId: string, id: string) {
    return this.api.delete<void>(`/procedures/${procedureId}/documents/${id}`);
  }
}
