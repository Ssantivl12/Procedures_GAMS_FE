import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client'; 

export interface Company {
  id: string;
  legalName: string;
  nit?: string;
  category: 'C3' | 'C4';
  isActive: boolean;
  createdAt: string;
  municipality?: string;
  legalRepName?: string; 
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
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
}