export type AppErrorKind = 'NETWORK' | 'HTTP' | 'AUTH' | 'VALIDATION' | 'UNKNOWN';

export interface AppError {
  kind: AppErrorKind;
  message: string; // user-facing
  status?: number;
  code?: string; // backend-specific code (optional)
  details?: unknown; // tech/debug info
  timestamp: string;
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value &&
    'timestamp' in value
  );
}
