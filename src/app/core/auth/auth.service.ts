import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'gams_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

  // Placeholder: endpoint real lo definirá BE
  async loginPlaceholder(_username: string, _password: string): Promise<void> {
    throw new Error('Login no implementado: pendiente contrato de BE.');
  }
}
