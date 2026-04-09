import { ProcedureStatus, ProcedureKind, ProcedureTypeCode } from './enums';
import { CaseFile } from './case-file.model';
import { ProcedureCycle } from './procedure-cycle.model';

export enum CompanyStatus {
  OPERACION = 'OPERACION',
  PROYECTO = 'PROYECTO',
  AMPLIACION = 'AMPLIACION',
  DIVERSIFICACION = 'DIVERSIFICACION',
}

export interface ProcedureType {
  id: number;
  code: ProcedureTypeCode;
  name: string;
  description: string | null;
  allowsObservations: boolean;
  allowsReentry: boolean;
  isActive: boolean;
}

export interface Procedure {
  id: string;
  caseFileId: string;
  procedureTypeId: number;
  procedureKind: ProcedureKind;
  currentStatus: ProcedureStatus;
  cycleCount: number;
  receptionDate: string;
  reviewStartDate: string | null;
  obsPickedDate: string | null;
  deadlineDate: string | null;
  daysElapsed: number | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  routeSheetNumber: string | null;
  companyStatus: CompanyStatus | null;
  approvalDate: string | null;
  approvalCertificate: string | null;
  expirationDate: string | null;
  generalNotes: string | null;
  closedAt: string | null;
  createdByUserId: string;
  assignedInspectorUserId: string | null;
  abandonReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  procedureType?: ProcedureType;
  caseFile?: CaseFile & { company?: { id: string; legalName: string; nit?: string; category: string } };
  assignedInspector?: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  cycles?: ProcedureCycle[];
  observationsSummary?: { total: number; pending: number; resolved: number };
}

export interface ProcedureAudit {
  id: string;
  procedureId: string;
  fromStatus: ProcedureStatus | null;
  toStatus: ProcedureStatus;
  changedBy: { id: string; fullName: string };
  changedAt: string;
  note: string | null;
}

export interface ChangeStatusPayload {
  toStatus: ProcedureStatus;
  reviewStartDate?: string;
  obsPickedDate?: string;
  approvalDate?: string;
  approvalCertificate?: string;
  expirationDate?: string;
  abandonReason?: string;
  note?: string;
}

export interface CreateProcedurePayload {
  caseFileId: string;
  procedureTypeId: number;
  procedureKind?: ProcedureKind;
  receptionDate: string;
  routeSheetNumber?: string;
  companyStatus?: CompanyStatus;
  generalNotes?: string;
}

export interface CreateCyclePayload {
  reentryDate: string;
  reviewStartDate: string;
  autoTransition: boolean;
  note?: string;
}
