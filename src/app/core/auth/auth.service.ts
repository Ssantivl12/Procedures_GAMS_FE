import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client';
import { BehaviorSubject, firstValueFrom, map, Observable, tap } from 'rxjs';

const ACCESS_TOKEN_KEY = 'gams_access_token';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ENCARGADO = 'ENCARGADO',
  SECRETARIA = 'SECRETARIA',
  INSPECTOR = 'INSPECTOR',
}

export interface UserPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  fullName: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: UserPayload;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private currentUserSubject = new BehaviorSubject<UserPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.hydrateSession();
  }

  private hydrateSession(): void {
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = this.decodeToken(token);
        this.currentUserSubject.next(payload);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    const payload = this.decodeToken(token);
    this.currentUserSubject.next(payload);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  hasRole(allowedRoles: UserRole | UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return user.roles.some(role => rolesToCheck.includes(role));
  }

  logout(): void {
    this.clearSession();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return firstValueFrom(
      this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
        tap(res => {
          if (res.accessToken) {
            this.setAccessToken(res.accessToken);
          }
        })
      )
    );
  }

  private decodeToken(token: string): UserPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      throw new Error('Invalid token format');
    }
  }
}
