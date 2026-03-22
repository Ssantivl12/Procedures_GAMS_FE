import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import {
  Observation,
  CreateObservationPayload,
  ObservationsGroupedByCycle,
  ObservationsSummary,
} from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class ObservationService {
  private readonly api = inject(ApiClient);

  getObservations(procedureId: string, params?: Record<string, string | number | boolean>) {
    return this.api.get<{
      data: Observation[];
      groupedByCycle: ObservationsGroupedByCycle[];
      observationsSummary: ObservationsSummary;
    }>(`/procedures/${procedureId}/observations`, params);
  }

  getObservationsByCycle(cycleId: string) {
    return this.api.get<Observation[]>(`/cycles/${cycleId}/observations`);
  }

  getObservation(procedureId: string, id: string) {
    return this.api.get<Observation>(`/procedures/${procedureId}/observations/${id}`);
  }

  createObservation(procedureId: string, data: CreateObservationPayload) {
    return this.api.post<Observation>(`/procedures/${procedureId}/observations`, data);
  }

  updateObservation(procedureId: string, id: string, data: Partial<CreateObservationPayload>) {
    return this.api.patch<Observation>(`/procedures/${procedureId}/observations/${id}`, data);
  }

  resolveObservation(procedureId: string, id: string, resolutionNote?: string) {
    return this.api.patch<Observation>(`/procedures/${procedureId}/observations/${id}/resolve`, {
      isResolved: true,
      ...(resolutionNote ? { resolutionNote } : {}),
    });
  }

  reopenObservation(procedureId: string, id: string) {
    return this.api.patch<Observation>(`/procedures/${procedureId}/observations/${id}/reopen`, {});
  }

  deleteObservation(procedureId: string, id: string) {
    return this.api.delete<void>(`/procedures/${procedureId}/observations/${id}`);
  }
}
