import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { PaginatedResponse } from '../../../shared/models';

export interface Company {
  id: string;
  legalName: string;
  nit?: string;
  raiNumber?: string;
  category: 'C3' | 'C4';
  isActive: boolean;
  createdAt: string;
  municipality?: string;
  address?: string;
  legalRepName?: string;
  legalRepCi?: string;
  phone?: string;
  email?: string;
  economicActivity?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/companies'; 

  getCompanies(params?: any) {
    return this.api.get<PaginatedResponse<Company>>(this.basePath, params);
  }

  getCompanyById(id: string) {
    return this.api.get<Company>(`${this.basePath}/${id}`);
  }

  createCompany(data: Partial<Company>) {
    return this.api.post<Company>(this.basePath, data);
  }

  updateCompany(id: string, data: Partial<Company>) {
    return this.api.patch<Company>(`${this.basePath}/${id}`, data);
  }

  deleteCompany(id: string) {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}