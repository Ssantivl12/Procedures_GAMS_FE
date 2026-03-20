import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client';
import { BehaviorSubject, firstValueFrom, map, Observable, tap } from 'rxjs';

const ACCESS_TOKEN_KEY = 'gams_access_token';
const REFRESH_TOKEN_KEY = 'gams_refresh_token';

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
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserPayload;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private currentUserSubject = new BehaviorSubject<UserPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  get currentUserId(): string | null {
    return this.currentUserSubject.value?.sub || null;
  }

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

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    try {
      const payload = this.decodeToken(accessToken);
      this.currentUserSubject.next(payload);
    } catch {
      this.clearSession();
    }
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
          if (res.accessToken && res.refreshToken) {
            this.setTokens(res.accessToken, res.refreshToken);
          }
        })
      )
    );
  }

  async refreshToken(): Promise<LoginResponse> {
    const rfToken = this.getRefreshToken();
    if (!rfToken) throw new Error('No refresh token available');
    
    return firstValueFrom(
      this.api.post<LoginResponse>('/auth/refresh', { refreshToken: rfToken }).pipe(
        tap(res => {
          if (res.accessToken && res.refreshToken) {
            this.setTokens(res.accessToken, res.refreshToken);
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
