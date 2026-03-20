import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { 
  ProcedureType, 
  DeadlineConfig, 
  NonWorkingDay, 
  UpdateDeadlineConfigDto, 
  CreateNonWorkingDayDto, 
  BulkCreateNonWorkingDaysDto 
} from '../models/config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly api = inject(ApiClient);

  // Procedure Types
  getProcedureTypes(): Observable<ProcedureType[]> {
    return this.api.get<ProcedureType[]>('/config/procedure-types');
  }

  // Deadline Config
  getDeadlineConfigs(): Observable<DeadlineConfig[]> {
    return this.api.get<DeadlineConfig[]>('/config/deadline-config');
  }

  updateDeadlineConfig(dto: UpdateDeadlineConfigDto): Observable<DeadlineConfig> {
    return this.api.patch<DeadlineConfig>('/config/deadline-config', dto);
  }

  // Non-Working Days
  getNonWorkingDays(): Observable<NonWorkingDay[]> {
    return this.api.get<NonWorkingDay[]>('/config/non-working-days');
  }

  createNonWorkingDay(dto: CreateNonWorkingDayDto): Observable<NonWorkingDay> {
    return this.api.post<NonWorkingDay>('/config/non-working-days', dto);
  }

  bulkCreateNonWorkingDays(dto: BulkCreateNonWorkingDaysDto): Observable<{ count: number }> {
    return this.api.post<{ count: number }>('/config/non-working-days/bulk', dto);
  }

  deleteNonWorkingDay(id: string): Observable<void> {
    return this.api.delete<void>(`/config/non-working-days/${id}`);
  }
}
