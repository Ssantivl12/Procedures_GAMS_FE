import { DocumentGroup } from './enums';

export interface ProcedureDocument {
  id: string;
  procedureId: string;
  cycleId: string | null;
  docGroup: DocumentGroup;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  isLatest: boolean;
  checksum: string;
  description: string | null;
  uploadedByUserId: string;
  isActive: boolean;
  createdAt: string;
  uploadedBy?: { id: string; firstName: string; lastName: string };
}
