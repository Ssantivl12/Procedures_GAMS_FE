import { DocumentGroup } from './enums';

export interface ProcedureDocument {
  id: string;
  procedureId: string;
  cycleId: string | null;
  docGroup: DocumentGroup;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  version: number;
  isLatest: boolean;
  checksum: string;
  uploadedByUserId: string;
  uploadedAt: string;
  isActive: boolean;
  downloadUrl?: string;
  uploadedBy?: { id: string; fullName: string };
}
