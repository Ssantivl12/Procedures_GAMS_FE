import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-button',
  imports: [RouterLink],
  template: `
    <a routerLink="/login" 
       class="group flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-full 
              bg-primary text-white shadow-md shadow-primary/20 
              hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg 
              transition-all duration-200 decoration-none">
      
      Iniciar Sesión
      
      <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
      </svg>
    </a>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class LoginButtonComponent {}