import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-user-toolbar',
  imports: [CommonModule],
  template: `
    <div class="user-toolbar">
      <div class="user-toolbar__date-time">
        <span class="user-toolbar__label">Hoy:</span>
        <span class="user-toolbar__date">{{ today | date: 'dd MMM y' }}</span>
        <span class="user-toolbar__time">{{ now | date: 'HH:mm' }}</span>
      </div>

      <button type="button" class="user-toolbar__icon-btn" aria-label="Notificaciones">
        <span class="user-toolbar__icon-badge"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.657A2 2 0 0113 19H11a2 2 0 01-1.857-1.343M18 8a6 6 0 10-12 0c0 2.577-.487 3.692-1.122 4.5-.409.526-.613.789-.602 1.027a1 1 0 001 0.973h15.448a1 1 0 001-.973c.011-.238-.193-.501-.602-1.027C18.487 11.692 18 10.577 18 8z"
          />
        </svg>
      </button>

      <div class="user-toolbar__profile" *ngIf="auth.currentUser$ | async as user">
        <div class="user-toolbar__info">
          <span class="user-toolbar__name">{{ user.firstName }} {{ user.lastName }}</span>
          <span class="user-toolbar__role">{{ user.roles[0] || 'Usuario' }}</span>
        </div>
        <button
          type="button"
          class="user-toolbar__avatar-btn"
          aria-label="Abrir menú de usuario"
          (click)="toggleMenu()"
        >
          <span class="user-toolbar__avatar">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
        </button>

        <div class="user-toolbar__menu" *ngIf="menuOpen">
          <button type="button" class="user-toolbar__menu-item">
            Ver perfil
          </button>
          <button
            type="button"
            class="user-toolbar__menu-item user-toolbar__menu-item--danger"
            (click)="logout.emit()"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .user-toolbar {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        font-family: var(--font-sans);
      }

      .user-toolbar__date-time {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--color-muted-foreground);
      }

      .user-toolbar__label {
        font-weight: 500;
        color: var(--color-muted-foreground);
      }

      .user-toolbar__date {
        font-weight: 600;
        color: var(--color-foreground);
      }

      .user-toolbar__time {
        padding-left: 0.5rem;
        margin-left: 0.5rem;
        border-left: 1px solid var(--color-border);
        font-weight: 500;
        color: var(--color-foreground);
      }

      .user-toolbar__icon-btn {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        background-color: var(--color-background);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s;
      }
      
      .user-toolbar__icon-btn:hover {
        background-color: var(--color-accent);
        border-color: var(--color-primary);
      }

      .user-toolbar__icon-btn svg {
        width: 20px;
        height: 20px;
        stroke: var(--color-muted-foreground);
        fill: none;
      }

      .user-toolbar__icon-badge {
        position: absolute;
        top: 7px;
        right: 7px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background-color: var(--color-destructive);
      }

      .user-toolbar__profile {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .user-toolbar__info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.1rem;
      }

      .user-toolbar__name {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-foreground);
      }

      .user-toolbar__role {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--color-primary);
      }

      .user-toolbar__avatar-btn {
        border: none;
        padding: 0;
        background: none;
        cursor: pointer;
      }

      .user-toolbar__avatar {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, var(--color-primary), var(--color-sidebar-primary));
        color: var(--primary-foreground);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: var(--shadow-sm);
      }

      .user-toolbar__menu {
        position: absolute;
        right: 0;
        top: 110%;
        min-width: 180px;
        background-color: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 0.35rem;
        display: flex;
        flex-direction: column;
        z-index: 20;
        animation: fade-in-up 0.3s ease-out;
      }

      .user-toolbar__menu-item {
        border: none;
        background-color: transparent;
        padding: 0.6rem 0.75rem;
        border-radius: var(--radius-md);
        text-align: left;
        font-size: 0.85rem;
        color: var(--color-foreground);
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .user-toolbar__menu-item:hover {
        background-color: var(--color-accent);
        color: var(--color-accent-foreground);
      }

      .user-toolbar__menu-item--danger {
        color: var(--color-destructive);
      }

      .user-toolbar__menu-item--danger:hover {
        background-color: var(--color-destructive);
        color: var(--color-destructive-foreground);
      }

      @media (max-width: 768px) {
        .user-toolbar__date-time {
          display: none;
        }
      }
    `,
  ],
})
export class UserToolbarComponent {
  @Output() logout = new EventEmitter<void>();

  auth = inject(AuthService);

  today = new Date();
  now = new Date();
  menuOpen = false;

  private intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      this.now = new Date();
    }, 30_000);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}

