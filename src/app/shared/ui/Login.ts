import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-button',
  imports: [RouterLink],
  template: `
    <a routerLink="/login" class="login-button">
      Iniciar Sesión
      <span class="arrow">→</span>
    </a>
  `,
  styles: [
    `
      .login-button {
        background-color: #2e7d32;
        color: var(--white);
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        border: none;
        cursor: pointer;
        font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont,
          sans-serif;
      }

      .login-button:hover {
        background-color: #2e7d32;
      }

      .login-button .arrow {
        font-size: 1.125rem;
      }
    `,
  ],
})
export class LoginButtonComponent {}
