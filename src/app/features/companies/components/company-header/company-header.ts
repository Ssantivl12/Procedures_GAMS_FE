import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-company-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
            <h1 class="text-2xl font-bold text-foreground tracking-tight">Gestión de Empresas</h1>
            <p class="text-muted-foreground text-sm mt-1 font-medium">
                Administra y categoriza las empresas registradas en el sistema GAMS.
            </p>
        </div>

        <div class="flex items-center space-x-3 w-full sm:w-auto" *ngIf="canCreate">
            <button 
                class="btn-primary-horus w-full sm:w-auto flex items-center justify-center gap-2"
                (click)="onAddCompany()"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                <span>Registrar Empresa</span>
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
export class CompanyHeaderComponent implements OnInit {
  private authService = inject(AuthService);
  
  @Output() addCompany = new EventEmitter<void>();
  
  canCreate = false;

  ngOnInit() {
    this.canCreate = !this.authService.hasRole(UserRole.INSPECTOR);
  }

  onAddCompany() { this.addCompany.emit(); }
}
