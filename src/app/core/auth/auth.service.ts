import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client';
import { firstValueFrom } from 'rxjs';

const ACCESS_TOKEN_KEY = 'gams_access_token';

export interface LoginResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  logout(): void {
    this.clearSession();
  }

  /**
   * Realiza el login usando el ApiClient para asegurar que se usen
   * los interceptores y la configuración global.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return firstValueFrom(this.api.post<LoginResponse>('/auth/login', { email, password }));
  }
}
