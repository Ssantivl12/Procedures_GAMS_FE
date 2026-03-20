export interface ProcedureCycle {
  id: string;
  procedureId: string;
  cycleNumber: number;
  startedAt: string;
  closedAt: string | null;
  deadlineDate: string | null;
  subsanationDeadlineDate: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { observations: number };
}
