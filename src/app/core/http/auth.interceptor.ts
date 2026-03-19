import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/change-password')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  let authReq = req;
  const token = auth.getAccessToken();

  if (token && !isAuthEndpoint(req.url)) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // The error might be a raw HttpErrorResponse OR an AppError (if errorInterceptor ran first)
      const status = error instanceof HttpErrorResponse ? error.status : (error.status || null);
      
      if (status === 401 && !isAuthEndpoint(req.url)) {
        return handle401Error(authReq, next, auth, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: any, next: any, auth: AuthService, router: Router): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Call the refreshed token from AuthService
    return new Observable(observer => {
      auth.refreshToken().then(
        (response) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);
          
          const newReq = req.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` },
          });
          next(newReq).subscribe({
            next: (v: any) => observer.next(v),
            error: (e: any) => observer.error(e),
            complete: () => observer.complete()
          });
        },
        (err) => {
          isRefreshing = false;
          auth.logout();
          router.navigate(['/login']);
          observer.error(err);
        }
      );
    });
  } else {
    // Wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwt => {
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${jwt}` },
          })
        );
      })
    );
  }
}
