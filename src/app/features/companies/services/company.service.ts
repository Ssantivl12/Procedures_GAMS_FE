import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { PaginatedResponse } from '../../../shared/models';

// Sub-interfaces

export interface RawMaterial {
  name:     string;
  quantity: string;
}

export interface FinalProduct {
  name:     string;
  quantity: string;
  unit:     string;
}

// Option constants 

export const DISTRICTS = [
  'DISTRITO 1', 'DISTRITO 2', 'DISTRITO 3', 'DISTRITO 4',
  'DISTRITO 5', 'DISTRITO 6', 'DISTRITO 7',
  'DISTRITO LAVA LAVA', 'DISTRITO CHIÑATA',
] as const;

export const GEO_ZONES = ['Urbano', 'Rural'] as const;
export const UTM_ZONES = ['19K', '20K']      as const;

export const EFFLUENT_DISPOSAL_OPTIONS = [
  'PTAR', 'PTAR+ALCANTARILLADO', 'ALCANTARILLADO COOPERATIVA',
  'POZO SEPTICO', 'OTRO',
] as const;

export const SOLID_WASTE_DISPOSAL_OPTIONS = [
  'GERES', 'TERCIARIZACIÓN', 'GERES+TERCIARIZACIÓN', 'OTRO',
] as const;

export const WATER_SUPPLY_OPTIONS = [
  'POZO DE AGUA', 'RED DE AGUA(COOPERATIVA)', 'CISTERNA',
  'EMAPAS', 'POZO+COOPERATIVA', 'OTROS',
] as const;

// Main interface 

export interface Company {
  id:        string;
  isActive:  boolean;
  createdAt: string;

  // Existing fields
  legalName:        string;
  nit?:             string;
  raiNumber?:       string;
  category:         'C3' | 'C4';
  address?:         string;
  phone?:           string;
  email?:           string;
  legalRepName?:    string;
  legalRepCi?:      string;
  caebCodes?:       string[];
  economicActivity?: string;
  municipality?:    string;
  observations?:    string;

  // New fields
  businessClass?:                  string;
  district?:                       string;
  geoZone?:                        string;
  utmZone?:                        string;
  coordinates?:                    string;
  effluentDisposal?:               string;
  solidWasteDisposal?:             string;
  useHazardousSubstances?:         boolean;
  hazardousSubstancesDescription?: string;
  usesMercury?:                    boolean;
  rawMaterials?:                   RawMaterial[];
  finalProducts?:                  FinalProduct[];
  usedArea?:                       number;
  areaUnit?:                       string;
  waterSupply?:                    string;
  installedPower?:                 number;
}

export interface CompanyParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  category?:     string;
  municipality?: string;
  hasRaiNumber?: boolean;
  isActive?:     boolean;
  sortBy?:       'legalName' | 'createdAt' | 'raiNumber';
  sortOrder?:    'asc' | 'desc';
  geoZone?:      string; 
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api      = inject(ApiClient);
  private readonly basePath = '/companies';

  getCompanies(params?: CompanyParams) {
    return this.api.get<PaginatedResponse<Company>>(this.basePath, params as any);
  }

  getCompanyById(id: string, include?: string) {
    const params = include ? { include } : undefined;
    return this.api.get<Company>(`${this.basePath}/${id}`, params);
  }

  getCompanyCaseFile(id: string) {
    return this.api.get<any>(`${this.basePath}/${id}/case-file`);
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