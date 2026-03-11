import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GamsNavbarComponent } from '../../shared/ui/Navbar';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  accessToken: string;
}

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GamsNavbarComponent],
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      display: block;
      height: 100vh;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f6f8;
    }

    .login-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .login-back-button {
      background-color: #2e7d32;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont,
        sans-serif;
      transition: background-color 0.2s ease;
    }

    .login-back-button:hover {
      background-color: #2e7d32;
    }

    .login-back-button .arrow {
      font-size: 1.125rem;
    }

    .login-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
    }

    .back-button {
      border: none;
      background: none;
      color: #4caf50;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 16px;
    }

    .back-button:hover {
      text-decoration: underline;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 35px;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
      letter-spacing: 1px;
      color: #4caf50;
      font-size: 28px;
      font-weight: 600;
    }

    .logo-image {
      height: 32px;
      width: auto;
      object-fit: contain;
    }

    .logo-text {
      display: inline-block;
    }

    .subtitle {
      font-size: 14px;
      color: #777;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #444;
    }

    .form-control {
      width: 100%;
      height: 48px;
      padding: 0 15px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #4caf50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
    }

    .password-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: none;
      color: #4caf50;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-password:hover {
      background: rgba(76, 175, 80, 0.10);
    }

    .toggle-password:focus-visible {
      outline: 2px solid rgba(76, 175, 80, 0.35);
      outline-offset: 2px;
    }

    .toggle-password svg {
      width: 18px;
      height: 18px;
      display: block;
    }

    .btn-ingresar {
      width: 100%;
      height: 50px;
      border: none;
      border-radius: 10px;
      background-color: #4caf50;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-top: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-ingresar:hover {
      background-color: #43a047;
      transform: translateY(-2px);
    }

    .forgot-password {
      text-align: center;
      margin-top: 20px;
    }

    .forgot-password a {
      font-size: 14px;
      color: #4caf50;
      text-decoration: none;
    }

    .forgot-password a:hover {
      text-decoration: underline;
    }

    .footer {
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #eee;
      text-align: center;
    }

    .footer-title {
      font-size: 13px;
      font-weight: 600;
      color: #444;
      margin-bottom: 4px;
    }

    .footer-subtitle {
      font-size: 12px;
      color: #999;
    }

    .error-message {
      margin-top: 12px;
      font-size: 13px;
      color: #d32f2f;
      text-align: center;
    }

    .field-error {
      margin-top: 6px;
      font-size: 12px;
      color: #d32f2f;
    }
  `],
  template: `
    <div class="login-page">
      <app-gams-navbar>
        <a routerLink="/home" class="login-back-button">
          Volver al inicio
          <span class="arrow">→</span>
        </a>
      </app-gams-navbar>

      <div class="login-container">
        <div class="login-box">
          <div class="logo-section">
            <div class="logo">
              <img
                src="assets/img/LogoGams.png"
                alt="Logo GAMS"
                class="logo-image"
              />
              <span class="logo-text">GAMS</span>
            </div>
            <p class="subtitle">Acceso al Sistema</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                class="form-control"
                placeholder="Ingrese su correo electrónico"
                formControlName="usuario"
              />
              <div *ngIf="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched" class="field-error">
                {{ loginForm.get('usuario')?.errors?.['email'] ? 'Correo electrónico inválido.' : 'El correo es obligatorio.' }}
              </div>
            </div>

            <div class="form-group">
              <label>Contraseña</label>
              <div class="password-wrapper">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Ingrese su contraseña"
                  formControlName="contrasena"
                />
                <button
                  type="button"
                  class="toggle-password"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword ? 'Contraseña visible' : 'Contraseña oculta'"
                >
                  @if (showPassword) {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" class="btn-ingresar" [disabled]="loading">
              {{ loading ? 'INGRESANDO...' : 'INGRESAR' }}
            </button>

            <div *ngIf="loginError" class="error-message">
              {{ loginError }}
            </div>
          </form>

          <div class="forgot-password">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <div class="footer">
            <p class="footer-title">Sistema de Gestión Ambiental</p>
            <p class="footer-subtitle">
              Gobierno Municipal de Sacaba - Departamento Ambiental
            </p>
          </div>
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
