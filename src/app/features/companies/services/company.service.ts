import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { PaginatedResponse } from '../../../shared/models';

// Sub-interfaces

export interface RawMaterial {
  name:     string;
  quantity: string;
  unit:     string;
}

export interface FinalProduct {
  name:     string;
  quantity: string;
  unit:     string;
}

export interface LegalRepresentative {
  name:  string;
  ci?:   string;
  phone?: string;
}

export enum District {
  DISTRITO_1 = 'DISTRITO_1',
  DISTRITO_2 = 'DISTRITO_2',
  DISTRITO_3 = 'DISTRITO_3',
  DISTRITO_4 = 'DISTRITO_4',
  DISTRITO_5 = 'DISTRITO_5',
  DISTRITO_6 = 'DISTRITO_6',
  DISTRITO_7 = 'DISTRITO_7',
  DISTRITO_LAVA_LAVA = 'DISTRITO_LAVA_LAVA',
  DISTRITO_CHINATA = 'DISTRITO_CHINATA',
  DISTRITO_PALCA = 'DISTRITO_PALCA',
  DISTRITO_AGUIRRE = 'DISTRITO_AGUIRRE',
  DISTRITO_UCUCHI = 'DISTRITO_UCUCHI',
}

export enum GeoZone {
  Urbano = 'Urbano',
  Rural = 'Rural',
}

export enum UtmZone {
  ZONE_19K = 'ZONE_19K',
  ZONE_20K = 'ZONE_20K',
}

export enum EffluentDisposal {
  PTAR = 'PTAR',
  PTAR_ALCANTARILLADO = 'PTAR_ALCANTARILLADO',
  ALCANTARILLADO_COOPERATIVA = 'ALCANTARILLADO_COOPERATIVA',
  POZO_SEPTICO = 'POZO_SEPTICO',
  OTRO = 'OTRO',
}

export enum SolidWasteDisposal {
  GERES = 'GERES',
  TERCIARIZACION = 'TERCIARIZACION',
  GERES_TERCIARIZACION = 'GERES_TERCIARIZACION',
  OTRO = 'OTRO',
}

export enum WaterSupply {
  POZO_DE_AGUA = 'POZO_DE_AGUA',
  RED_DE_AGUA_COOPERATIVA = 'RED_DE_AGUA_COOPERATIVA',
  CISTERNA = 'CISTERNA',
  EMAPAS = 'EMAPAS',
  POZO_COOPERATIVA = 'POZO_COOPERATIVA',
  OTROS = 'OTROS',
}

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
  district?:                       District;
  geoZone?:                        GeoZone;
  utmZone?:                        UtmZone;
  coordinates?:                    string;
  effluentDisposal?:               EffluentDisposal;
  solidWasteDisposal?:             SolidWasteDisposal;
  useHazardousSubstances?:         boolean;
  hazardousSubstancesDescription?: string;
  usesMercury?:                    boolean;
  rawMaterials?:                   RawMaterial[];
  finalProducts?:                  FinalProduct[];
  legalRepresentatives?:           LegalRepresentative[];
  usedArea?:                       number;
  areaUnit?:                       string;
  waterSupply?:                    WaterSupply;
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
  geoZone?:      GeoZone; 
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

  reactivateCompany(id: string) {
    return this.api.patch<void>(`${this.basePath}/${id}/reactivate`, {});
  }
}