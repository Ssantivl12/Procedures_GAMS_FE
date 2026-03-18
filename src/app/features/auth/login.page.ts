import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  accessToken: string;
}

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [`
    :host {
      display: block;
      height: 100vh;
      font-family: var(--font-sans);
    }

    .login-page {
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(
        180deg,
        hsl(165, 60%, 12%) 0%,
        hsl(165, 60%, 8%) 45%,
        hsl(165, 60%, 5%) 100%
      );
      color: #ffffff;
      padding: 48px 20px;
      box-sizing: border-box;
    }

    /* ===== Header ===== */
    .lp-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .lp-shield-icon {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.09);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
    }

    .lp-shield-logo {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }

    .lp-title {
      font-size: 26px;
      letter-spacing: 0.15em; 
      text-transform: uppercase;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .lp-subtitle {
      font-size: 14px; 
      opacity: 0.7;
      letter-spacing: 0.05em;
    }

    /* ===== Card ===== */
    .lp-card {
      width: 420px;
      max-width: 100%;
      border-radius: 24px;
      background: #ffffff;
      color: var(--color-foreground);
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: fade-in-up 0.6s ease-out;
    }

    .lp-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .lp-card-avatar {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-sidebar-primary));
      box-shadow: 0 8px 16px rgba(15, 92, 58, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .lp-card-title {
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      color: var(--color-foreground);
    }

    .lp-card-subtitle {
      font-size: 13px;
      color: var(--color-primary);
      font-weight: 700;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--color-muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .form-control {
      width: 100%;
      height: 54px;
      padding: 0 18px;
      border-radius: 14px;
      border: 1px solid var(--color-border);
      background-color: var(--color-secondary);
      font-size: 15px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--color-foreground);
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-accent);
      background-color: #ffffff;
    }

    .password-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: none;
      color: var(--color-primary);
      cursor: pointer;
      padding: 8px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    
    .toggle-password:hover {
      background-color: var(--color-accent);
    }
    
    .toggle-password svg {
      width: 22px;
      height: 22px;
    }

    .btn-ingresar {
      width: 100%;
      height: 56px;
      border: none;
      border-radius: 16px;
      background-color: var(--color-primary);
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-top: 8px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 15px -3px rgba(15, 92, 58, 0.3);
    }

    .btn-ingresar:hover:not(:disabled) {
      background-color: var(--color-sidebar-primary);
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(15, 92, 58, 0.4);
    }

    .btn-ingresar:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-ingresar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .forgot-password {
      text-align: center;
      margin-top: 24px;
    }

    .forgot-password a {
      font-size: 13px;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 700;
      transition: color 0.2s;
    }
    
    .forgot-password a:hover {
      color: var(--color-sidebar-primary);
      text-decoration: underline;
    }

    /* SSL Pill */
    .lp-ssl-pill {
      margin-top: 32px;
      padding: 10px 24px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .lp-ssl-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
      animation: pulse 2s infinite;
    }

    .lp-footer {
      margin-top: 24px;
      font-size: 12px;
      opacity: 0.6;
      text-align: center;
      color: #ffffff;
      max-width: 340px;
      line-height: 1.6;
      font-weight: 500;
    }

    .error-message {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      background-color: var(--color-destructive);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
  `],
  template: `
    <div class="login-page">
      <!-- Header Section -->
      <div class="lp-header">
        <div class="lp-shield-icon">
          <img src="assets/img/LogoGams.png" alt="GAMS Logo" class="lp-shield-logo" />
        </div>
        <h1 class="lp-title">GAMS</h1>
        <p class="lp-subtitle">Gestión Ambiental Sacaba</p>
      </div>

      <!-- Card Section -->
      <div class="lp-card">
        <div class="lp-card-header">
          <div class="lp-card-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <h2 class="lp-card-title">Bienvenido</h2>
            <p class="lp-card-subtitle">Inicie sesión para continuar</p>
          </div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Username -->
          <div class="form-group">
            <label for="usuario">Usuario / Correo</label>
            <input
              id="usuario"
              type="email"
              class="form-control"
              placeholder="nombre@ejemplo.com"
              formControlName="usuario"
              autocomplete="username"
            />
            <div *ngIf="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched" class="error-message" style="background: none; color: var(--color-destructive); box-shadow: none; text-align: left; padding: 4px 0;">
              {{ loginForm.get('usuario')?.errors?.['email'] ? 'Correo inválido.' : 'Campo requerido.' }}
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="contrasena">Contraseña</label>
            <div class="password-wrapper">
              <input
                id="contrasena"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="••••••••"
                formControlName="contrasena"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.218 3.475.613m1.34 1.34A9.961 9.961 0 0119.542 12c-1.274 4.057-5.064 7-9.542 7-1.225 0-2.39-.218-3.475-.613M9 9l6 6m0-6l-6 6" /></svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-ingresar" [disabled]="loading">
            {{ loading ? 'VERIFICANDO...' : 'ENTRAR AL SISTEMA' }}
          </button>

          <!-- Error Alert -->
          <div *ngIf="loginError" class="error-message">
            <svg style="width: 16px; height: 16px; display: inline-block; vertical-align: text-top; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ loginError }}
          </div>
        </form>

        <div class="forgot-password">
          <a routerLink="/auth/forgot-password">¿Olvidó sus credenciales?</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onBack() {
    window.history.back();
  }

  async onSubmit() {
    if (this.loading) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.loginError = null;

    const { usuario, contrasena } = this.loginForm.value;

    try {
      // Usamos el servicio de auth que ya utiliza ApiClient e interceptores
      const data = await this.auth.login(usuario, contrasena);

      if (data?.accessToken) {
        this.auth.setAccessToken(data.accessToken);
        this.router.navigate(['/dashboard']);
      } else {
        this.loginError = 'Respuesta del servidor inválida.';
      }
    } catch (err: any) {
      // Los errores ya vienen formateados como AppError por el errorInterceptor
      // o son errores de conexión (status 0)
      this.loginError = err.message || 'No se pudo conectar con el servidor.';
      console.error('Login error:', err);
    } finally {
      this.loading = false;
    }
  }
}
