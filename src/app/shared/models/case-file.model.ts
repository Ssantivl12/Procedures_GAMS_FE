import { Company } from '../../features/companies/services/company.service';

export interface CaseFile {
  id: string;
  companyId: string;
  code: string | null;
  fileNumber: string | null;
  openedAt: string;
  closedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  _count?: { procedures: number };
}
