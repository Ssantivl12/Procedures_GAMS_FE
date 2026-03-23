import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlinesConfigComponent } from '../../components/deadlines-config/deadlines-config';
import { NonWorkingDaysConfigComponent } from '../../components/non-working-days-config/non-working-days-config';
import { ProcedureTypesConfigComponent } from '../../components/procedure-types-config/procedure-types-config';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [
    CommonModule,
    DeadlinesConfigComponent,
    NonWorkingDaysConfigComponent,
    ProcedureTypesConfigComponent,
    DashboardHeaderComponent,
  ],
  template: `
    <div class="dashboard-wrapper">
      <app-dashboard-header />

      <main class="main-content">
        <div class="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <!-- Header Section -->
          <header class="mb-6">
            <h1 class="text-2xl font-bold text-foreground">Configuración del Sistema</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Gestión centralizada de tipos de trámite, plazos de respuesta y calendario de días no laborables. 
              <span *ngIf="!isSuperAdmin()" class="inline-flex items-center gap-1.5 ml-2 text-primary font-medium">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Vista de Solo Lectura
              </span>
            </p>
          </header>

          <!-- Dynamic Tabs -->
          <div class="flex items-center gap-2 p-1.5 bg-muted/50 backdrop-blur rounded-2xl border border-border/50 mb-8 w-fit shadow-sm">
            <button 
              (click)="activeTab = 'types'"
              [class]="activeTab === 'types' ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
              Tipos de Trámite
            </button>
            
            <button 
              (click)="activeTab = 'deadlines'"
              [class]="activeTab === 'deadlines' ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Configuración de Plazos
            </button>

            <button 
              (click)="activeTab = 'holidays'"
              [class]="activeTab === 'holidays' ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              Días No Laborables
            </button>
          </div>

          <!-- Content Area -->
          <main class="animate-content-in">
            <div *ngIf="activeTab === 'types'" class="animate-tab">
              <app-procedure-types-config />
            </div>
            
            <div *ngIf="activeTab === 'deadlines'" class="animate-tab">
              <app-deadlines-config [isReadOnly]="!isSuperAdmin()" />
            </div>
            
            <div *ngIf="activeTab === 'holidays'" class="animate-tab">
              <app-non-working-days-config [isReadOnly]="!isSuperAdmin()" />
            </div>
          </main>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .animate-content-in { animation: content-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes content-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .animate-tab { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ConfigLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  activeTab: 'deadlines' | 'holidays' | 'types' = 'types';
  isSuperAdmin = signal(false);

  ngOnInit(): void {
    const checkRole = () => {
        this.isSuperAdmin.set(this.authService.hasRole(UserRole.SUPERADMIN));
    };
    
    checkRole();
    // Re-check role if user changes (optional but safer)
    this.authService.currentUser$.subscribe(() => checkRole());
  }
}
