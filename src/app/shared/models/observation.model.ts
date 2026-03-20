import { ObservationCategory, ObservationPriority } from './enums';

export interface Observation {
  id: string;
  procedureId: string;
  cycleId: string;
  summary: string;
  details: string | null;
  category: ObservationCategory;
  priority: ObservationPriority;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  issuedByUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  issuedBy?: { id: string; firstName: string; lastName: string };
  resolvedBy?: { id: string; firstName: string; lastName: string };
}

export interface ObservationsSummary {
  total: number;
  pending: number;
  resolved: number;
}

export interface ObservationsGroupedByCycle {
  cycleId: string;
  cycleNumber: number;
  observations: Observation[];
}

export interface CreateObservationPayload {
  cycleId: string;
  summary: string;
  details?: string;
  category: ObservationCategory;
  priority: ObservationPriority;
}
