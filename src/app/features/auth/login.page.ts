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
      padding: 28px 20px;
      box-sizing: border-box;
    }

    /* ===== Header ===== */
    .lp-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
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
      margin-bottom: 16px; 
      position: relative;
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

    .form-control.is-invalid {
      border-color: var(--color-destructive) !important;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1) !important;
      background-color: #fffafb;
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

    .error-feedback {
      color: var(--color-destructive); /* El rojo de tu sistema */
      font-size: 11px;
      font-weight: 700;
      margin-top: 4px;
      text-transform: none;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <div class="login-page">
      <!-- Header Section -->
      <div class="lp-header">
        <!--<div class="lp-shield-icon">
          <img src="assets/img/LogoGams.png" alt="GAMS Logo" class="lp-shield-logo" />
        </div> -->
        <h1 class="lp-title">GAMS</h1>
        <p class="lp-subtitle">Gobierno Autónomo Municipal de Sacaba</p>
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
              [class.is-invalid]="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched"
              placeholder="nombre@ejemplo.com"
              formControlName="usuario"
              autocomplete="username"
            />
            <div *ngIf="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched" class="error-feedback">
              {{ loginForm.get('usuario')?.errors?.['email'] ? 'El formato de correo no es válido.' : 'Este campo es obligatorio.' }}
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
                [class.is-invalid]="loginForm.get('contrasena')?.invalid && loginForm.get('contrasena')?.touched"
                placeholder="••••••••"
                formControlName="contrasena"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="toggle-password" 
                (click)="togglePasswordVisibility()"
                [title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                
                <svg *ngIf="!showPassword" class="icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path fill="currentColor" d="M320 144C254.8 144 201.2 173.6 160.1 211.7C121.6 247.5 95 290 81.4 320C95 350 121.6 392.5 160.1 428.3C201.2 466.4 254.8 496 320 496C385.2 496 438.8 466.4 479.9 428.3C518.4 392.5 545 350 558.6 320C545 290 518.4 247.5 479.9 211.7C438.8 173.6 385.2 144 320 144zM127.4 176.6C174.5 132.8 239.2 96 320 96C400.8 96 465.5 132.8 512.6 176.6C559.4 220.1 590.7 272 605.6 307.7C608.9 315.6 608.9 324.4 605.6 332.3C590.7 368 559.4 420 512.6 463.4C465.5 507.1 400.8 544 320 544C239.2 544 174.5 507.2 127.4 463.4C80.6 419.9 49.3 368 34.4 332.3C31.1 324.4 31.1 315.6 34.4 307.7C49.3 272 80.6 220 127.4 176.6zM320 400C364.2 400 400 364.2 400 320C400 290.4 383.9 264.5 360 250.7C358.6 310.4 310.4 358.6 250.7 360C264.5 383.9 290.4 400 320 400zM240.4 311.6C242.9 311.9 245.4 312 248 312C283.3 312 312 283.3 312 248C312 245.4 311.8 242.9 311.6 240.4C274.2 244.3 244.4 274.1 240.5 311.5zM286 196.6C296.8 193.6 308.2 192.1 319.9 192.1C328.7 192.1 337.4 193 345.7 194.7C346 194.8 346.2 194.8 346.5 194.9C404.4 207.1 447.9 258.6 447.9 320.1C447.9 390.8 390.6 448.1 319.9 448.1C258.3 448.1 206.9 404.6 194.7 346.7C192.9 338.1 191.9 329.2 191.9 320.1C191.9 309.1 193.3 298.3 195.9 288.1C196.1 287.4 196.2 286.8 196.4 286.2C208.3 242.8 242.5 208.6 285.9 196.7z"/>
                </svg>

                <svg *ngIf="showPassword" class="icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path fill="currentColor" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM208.9 175.1C241 156.2 278.1 144 320 144C385.2 144 438.8 173.6 479.9 211.7C518.4 247.4 545 290 558.5 320C544.9 350 518.3 392.5 479.9 428.3C476.8 431.1 473.7 433.9 470.5 436.7L425.8 392C439.8 371.5 448 346.7 448 320C448 249.3 390.7 192 320 192C293.3 192 268.5 200.2 248 214.2L208.9 175.1zM390.9 357.1L282.9 249.1C294 243.3 306.6 240 320 240C364.2 240 400 275.8 400 320C400 333.4 396.7 346 390.9 357.1zM135.4 237.2L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L384.2 486C364.2 492.4 342.8 496 320 496C254.8 496 201.2 466.4 160.1 428.3C121.6 392.6 95 350 81.5 320C91.9 296.9 110.1 266.4 135.5 237.2z"/>
                </svg>

              </button>
            </div>
            <div *ngIf="loginForm.get('contrasena')?.invalid && loginForm.get('contrasena')?.touched" class="error-feedback">
              Contraseña requerida para ingresar.
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
      const data = await this.auth.login(usuario, contrasena);

      if (data?.accessToken) {
        this.router.navigate(['/dashboard']);
      } else {
        this.loginError = 'Respuesta del servidor inválida.';
      }
    } catch (err: any) {
      this.loginError = err.message || 'No se pudo conectar con el servidor.';
      console.error('Login error:', err);
    } finally {
      this.loading = false;
    }
  }
}
