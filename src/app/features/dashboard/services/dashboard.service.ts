import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { DashboardData } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  getDashboard() {
    return this.api.get<DashboardData>('/dashboard');
  }
}
