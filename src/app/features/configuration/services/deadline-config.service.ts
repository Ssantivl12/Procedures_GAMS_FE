import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';

export interface DeadlineConfig {
  id: number;
  procedureTypeId: number;
  cycleNumber: number;
  reviewDays: number;
  subsanationDays: number;
  procedureType?: { id: number; code: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class DeadlineConfigService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/config/deadlines';

  getAll(params?: Record<string, string | number | boolean>) {
    return this.api.get<DeadlineConfig[]>(this.basePath, params);
  }

  getById(id: number) {
    return this.api.get<DeadlineConfig>(`${this.basePath}/${id}`);
  }

  create(data: Partial<DeadlineConfig>) {
    return this.api.post<DeadlineConfig>(this.basePath, data);
  }

  update(id: number, data: Partial<DeadlineConfig>) {
    return this.api.patch<DeadlineConfig>(`${this.basePath}/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
