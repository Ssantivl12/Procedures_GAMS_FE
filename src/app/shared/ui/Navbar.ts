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
        padding: 1.5rem 2.5rem;
        background-color: #ffffff;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        position: relative;
        z-index: 10;
      }

      .gams-navbar__logo-container {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .gams-navbar__logo-image {
        height: 55px;
        width: auto;
        object-fit: contain;
      }

      .gams-navbar__logo-text {
        font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont,
          sans-serif;
        font-size: 1.875rem;
        font-weight: 600;
        color: #008259;
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


