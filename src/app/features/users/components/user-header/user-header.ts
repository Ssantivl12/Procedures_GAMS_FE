import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
            <h1 class="text-2xl font-bold text-foreground tracking-tight">Gestión de Personal</h1>
            <p class="text-muted-foreground text-sm mt-1">
                Administra el registro, roles y permisos de los usuarios del sistema.
            </p>
        </div>

        <div class="flex items-center space-x-3 w-full sm:w-auto">
            <button 
                class="cursor-pointer btn-primary-horus w-full sm:w-auto flex items-center justify-center gap-2"
                (click)="onAddUser()"
            >
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Añadir Personal</span>
            </button>
        </div>
    </div>
  `,
  styles: [`
    .btn-primary-horus {
        background-color: var(--color-primary);
        color: white;
        padding: 0.625rem 1.25rem;
        border-radius: 0.75rem; /* rounded-xl */
        font-size: 0.875rem;
        font-weight: 600;
        transition: all 0.2s;
        border: none;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .btn-primary-horus:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class UserHeaderComponent {
  @Output() addUser = new EventEmitter<void>();
  onAddUser() { this.addUser.emit(); }
}
