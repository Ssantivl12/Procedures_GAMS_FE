import { ProcedureStatus, ProcedureTypeCode } from './enums';

export interface AdminDashboard {
  role: 'ADMIN';
  statusSummary: Record<ProcedureStatus, number>;
  typeSummary: Record<ProcedureTypeCode, number>;
  overdueList: OverdueItem[];
  raiExpirationAlerts: RaiExpirationAlert[];
  iaaDelinquent: IaaDelinquentItem[];
  inspectorWorkload: InspectorWorkload[];
  activityThisMonth: ActivitySummary;
}

export interface SecretariaDashboard {
  role: 'SECRETARIA';
  pendingPickup: PendingItem[];
  pendingReentry: PendingItem[];
  recentlyReceived: PendingItem[];
  overdueCount: number;
  abandonedThisMonth: number;
}

export interface InspectorDashboard {
  role: 'INSPECTOR';
  myQueue: QueueItem[];
  myOverdue: QueueItem[];
  unassigned: QueueItem[];
  closedThisMonth: number;
  pendingObsCount: number;
}

export type DashboardData = AdminDashboard | SecretariaDashboard | InspectorDashboard;

export interface OverdueItem {
  procedureId: string;
  routeSheetNumber: string | null;
  companyName: string;
  procedureType: string;
  deadlineDate: string;
  daysOverdue: number;
  inspectorName: string | null;
}

export interface RaiExpirationAlert {
  companyId: string;
  companyName: string;
  raiNumber: string;
  expirationDate: string;
  daysUntilExpiration: number;
  status: 'POR_VENCER' | 'VENCIDO';
}

export interface IaaDelinquentItem {
  companyId: string;
  companyName: string;
  lastIaaDate: string | null;
}

export interface InspectorWorkload {
  inspectorId: string;
  inspectorName: string;
  activeCount: number;
  overdueCount: number;
}

export interface ActivitySummary {
  received: number;
  closed: number;
  abandoned: number;
  avgDaysToClose: number | null;
}

export interface PendingItem {
  procedureId: string;
  routeSheetNumber: string | null;
  companyName: string;
  procedureType: string;
  currentStatus: string;
  deadlineDate: string | null;
  receptionDate: string;
}

export interface QueueItem {
  procedureId: string;
  routeSheetNumber: string | null;
  companyName: string;
  procedureType: string;
  currentStatus: string;
  deadlineDate: string | null;
  isOverdue: boolean;
}

export interface AlertsSummary {
  overdue: number;
  dueSoon: number;
  pendingPickup: number;
  raiExpiration: number;
  iaaMissing: number;
  total: number;
  asOf: string;
}
