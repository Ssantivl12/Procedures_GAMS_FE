import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-gams-navbar',
  template: `
    <header class="gams-navbar">
      <div class="gams-navbar__logo-container">
        <img
          src="assets/img/LogoGams.png"
          alt="Logo GAMS"
          class="gams-navbar__logo-image"
        />
        <span class="gams-navbar__logo-text">GAMS</span>
      </div>

      <div class="gams-navbar__right">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .gams-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 2.5rem;
        background-color: var(--color-background);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        position: relative;
        z-index: 10;
      }

      .gams-navbar__logo-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .gams-navbar__logo-image {
        height: 48px;
        width: auto;
        object-fit: contain;
      }

      .gams-navbar__logo-text {
        font-family: var(--font-sans);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-primary);
        letter-spacing: -0.025em;
      }

      .gams-navbar__right {
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class GamsNavbarComponent {}


