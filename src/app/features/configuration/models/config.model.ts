export interface ProcedureType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  allowsObservations: boolean;
  allowsReentry: boolean;
}

export interface DeadlineConfig {
  id: number;
  procedureType: string;
  cycleNumber: number;
  deadlineDays: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface NonWorkingDay {
  id: string;
  date: string;
  description: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateNonWorkingDayDto {
  date: string;
  description: string | null;
  type: string;
}

export interface BulkCreateNonWorkingDaysDto {
  dates: CreateNonWorkingDayDto[];
}

export interface UpdateDeadlineConfigDto {
  procedureType: string;
  cycleNumber: number;
  deadlineDays: number;
  description?: string | null;
}

export interface UpdateNonWorkingDayDto {
  date?: string;
  description?: string | null;
  type?: string;
}
