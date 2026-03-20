export interface ProcedureType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  allowsObservations: boolean;
  allowsReentry: boolean;
}

export interface DeadlineConfig {
  id: string;
  procedureType: string; // Enum code
  cycleNumber: number;
  workingDays: number; // For FE
  deadlineDays?: number; // From BE
  procedureTypeData?: ProcedureType; // Renamed to avoid confusion if needed
}

export interface NonWorkingDay {
  id: string;
  date: string;
  description: string;
}

export interface CreateNonWorkingDayDto {
  date: string;
  description: string;
}

export interface BulkCreateNonWorkingDaysDto {
  dates: CreateNonWorkingDayDto[];
}

export interface UpdateDeadlineConfigDto {
  procedureType: string;
  cycleNumber: number;
  deadlineDays: number;
}
