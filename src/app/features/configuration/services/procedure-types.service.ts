import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { ProcedureType } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProcedureTypesService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/config/procedure-types';

  getAll() {
    return this.api.get<ProcedureType[]>(this.basePath);
  }

  getById(id: number) {
    return this.api.get<ProcedureType>(`${this.basePath}/${id}`);
  }

  update(id: number, data: Partial<ProcedureType>) {
    return this.api.patch<ProcedureType>(`${this.basePath}/${id}`, data);
  }
}
