import { Company } from '../../features/companies/services/company.service';

export interface CaseFile {
  id: string;
  companyId: string;
  code: string | null;
  fileNumber: string | null;
  openedAt: string;
  closedAt: string | null;
  isActive: boolean;
  company?: Company;
  raiStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO' | null;
  proceduresSummary?: {
    total: number;
    active: number;
    closed: number;
  };
}

export interface CreateCaseFileDto {
  companyId: string;
  fileNumber?: string;
}

export interface UpdateCaseFileDto {
  fileNumber: string;
}
