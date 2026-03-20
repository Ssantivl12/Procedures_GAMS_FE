export interface ProcedureCycle {
  id: string;
  procedureId: string;
  cycleNumber: number;
  openedAt: string;
  closedAt: string | null;
  reentryDate: string | null;
  reviewDeadline: string | null;
  note: string | null;
  isActive: boolean;
  deletedAt: string | null;
}
