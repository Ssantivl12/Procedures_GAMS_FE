import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';

export interface NonWorkingDay {
  id: number;
  date: string;
  name: string;
  type: 'NACIONAL' | 'DEPARTAMENTAL' | 'MUNICIPAL' | 'OTRO';
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class NonWorkingDaysService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/config/non-working-days';

  getAll(params?: Record<string, string | number | boolean>) {
    return this.api.get<NonWorkingDay[]>(this.basePath, params);
  }

  create(data: Partial<NonWorkingDay>) {
    return this.api.post<NonWorkingDay>(this.basePath, data);
  }

  bulkCreate(data: Partial<NonWorkingDay>[]) {
    return this.api.post<NonWorkingDay[]>(`${this.basePath}/bulk`, data);
  }

  update(id: number, data: Partial<NonWorkingDay>) {
    return this.api.patch<NonWorkingDay>(`${this.basePath}/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
