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
        background-color: var(--color-primary);
        color: var(--color-primary-foreground);
        padding: 10px 20px;
        border-radius: var(--radius-lg);
        font-weight: 700;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        border: none;
        cursor: pointer;
        font-family: var(--font-sans);
        box-shadow: var(--shadow-sm);
      }

      .login-button:hover {
        background-color: var(--color-sidebar-primary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .login-button .arrow {
        font-size: 1.125rem;
        transition: transform 0.2s;
      }
      
      .login-button:hover .arrow {
        transform: translateX(4px);
      }
    `,
  ],
})
export class LoginButtonComponent {}
