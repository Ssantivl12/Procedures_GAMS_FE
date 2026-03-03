import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamsNavbarComponent } from '../../shared/ui/Navbar';

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
      font-size: 13px;
      color: #4caf50;
      cursor: pointer;
      font-weight: 500;
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
              <label>Usuario / Correo</label>
              <input
                type="text"
                class="form-control"
                placeholder="Ingrese su usuario o correo electrónico"
                formControlName="usuario"
              />
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
                >
                  {{ showPassword ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn-ingresar">
              INGRESAR
            </button>
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

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onBack() {
    window.history.back();
  }

  onSubmit() {}
}
