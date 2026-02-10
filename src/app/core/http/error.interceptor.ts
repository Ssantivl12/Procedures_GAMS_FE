import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AppError } from '../errors/app-error';

function toAppError(err: HttpErrorResponse): AppError {
  // Network / CORS / offline typically have status 0
  if (err.status === 0) {
    return {
      kind: 'NETWORK',
      message: 'No se pudo conectar con el servidor.',
      status: err.status,
      details: { url: err.url, error: err.error },
      timestamp: new Date().toISOString(),
    };
  }

  if (err.status === 401 || err.status === 403) {
    return {
      kind: 'AUTH',
      message: 'No autorizado. Inicia sesión nuevamente.',
      status: err.status,
      details: err.error,
      timestamp: new Date().toISOString(),
    };
  }

  // Try to read a common backend error shape if exists
  const backendMessage =
    (err.error && (err.error.message || err.error.error || err.error.detail)) ?? null;

  return {
    kind: 'HTTP',
    message: typeof backendMessage === 'string' ? backendMessage : 'Ocurrió un error inesperado.',
    status: err.status,
    details: err.error,
    timestamp: new Date().toISOString(),
  };
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (source: any) =>
      source.catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          return throwError(() => toAppError(err));
        }
        const fallback: AppError = {
          kind: 'UNKNOWN',
          message: 'Ocurrió un error inesperado.',
          details: err,
          timestamp: new Date().toISOString(),
        };
        return throwError(() => fallback);
      })
  );
};
