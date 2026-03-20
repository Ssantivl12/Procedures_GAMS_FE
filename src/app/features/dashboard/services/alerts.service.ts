import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { AlertsSummary, OverdueItem, RaiExpirationAlert, PendingItem } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/alerts';

  getSummary() {
    return this.api.get<AlertsSummary>(`${this.basePath}/summary`);
  }

  getOverdue(params?: Record<string, string | number | boolean>) {
    return this.api.get<OverdueItem[]>(`${this.basePath}/overdue`, params);
  }

  getDueSoon(params?: Record<string, string | number | boolean>) {
    return this.api.get<OverdueItem[]>(`${this.basePath}/due-soon`, params);
  }

  getPendingPickup(params?: Record<string, string | number | boolean>) {
    return this.api.get<PendingItem[]>(`${this.basePath}/pending-pickup`, params);
  }

  getRaiExpiration(params?: Record<string, string | number | boolean>) {
    return this.api.get<RaiExpirationAlert[]>(`${this.basePath}/rai-expiration`, params);
  }

  getIaaMissing(params?: Record<string, string | number | boolean>) {
    return this.api.get<PendingItem[]>(`${this.basePath}/iaa-missing`, params);
  }
}
