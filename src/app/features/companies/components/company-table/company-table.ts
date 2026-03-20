import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService, Company, CompanyParams } from '../../services/company.service';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-company-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-[0.1em] border-y border-border">
              <th class="px-6 py-4 font-semibold">Empresa</th>
              <th class="px-6 py-4 font-semibold">Identificación</th>
              <th class="px-6 py-4 font-semibold">Categoría</th>
              <th class="px-6 py-4 font-semibold">Representante</th>
              <th class="px-6 py-4 font-semibold">Estado</th>
              <th class="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <!-- Loading State -->
            <tr *ngIf="isLoading && companies.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                <svg class="animate-spin h-8 w-8 mx-auto text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-sm font-medium">Cargando empresas...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="!isLoading && companies.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-border mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p class="text-sm font-medium">No se encontraron empresas registradas.</p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr *ngFor="let company of companies" class="hover:bg-muted/50 transition-colors group" [class.opacity-60]="!company.isActive">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100 shadow-sm">
                    {{ company.legalName.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-foreground leading-tight">{{ company.legalName }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5" *ngIf="company.address">{{ company.address }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                 <div class="flex flex-col">
                    <span class="text-sm text-foreground font-medium">{{ company.nit || 'Sin NIT' }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5" *ngIf="company.raiNumber">RAI: {{ company.raiNumber }}</span>
                 </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-md bg-secondary text-[11px] font-bold text-primary uppercase tracking-wider">
                   {{ company.category }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                    <span class="text-sm text-foreground font-medium">{{ company.legalRepName || 'N/A' }}</span>
                    <span class="text-[10px] text-muted-foreground italic mt-0.5" *ngIf="company.phone">{{ company.phone }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  [ngClass]="company.isActive 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'bg-destructive/10 text-destructive ring-1 ring-destructive/20'">
                  <span class="h-1.5 w-1.5 rounded-full" [ngClass]="company.isActive ? 'bg-emerald-500' : 'bg-destructive'"></span>
                  {{ company.isActive ? 'Vigente' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 transition-opacity">
                  <button [routerLink]="['/companies', company.id]" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Ver Detalle">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button *ngIf="canEdit" (click)="onEdit(company)" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Editar">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button *ngIf="canDelete && company.isActive" (click)="onDelete(company)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Eliminar">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div *ngIf="totalPages > 1" class="bg-muted/30 px-6 py-3 border-t border-border flex justify-between items-center">
        <div class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
          Página {{ currentPage }} de {{ totalPages }}
        </div>
        <div class="flex items-center gap-2">
            <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" 
                class="p-1 px-3 border border-border rounded-lg text-xs font-bold bg-background hover:bg-accent disabled:opacity-40 transition-all font-inter">
                Anterior
            </button>
            <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages" 
                class="p-1 px-3 border border-border rounded-lg text-xs font-bold bg-background hover:bg-accent disabled:opacity-40 transition-all font-inter">
                Siguiente
            </button>
        </div>
      </div>

      <!-- Mini Info Footer for count -->
      <div *ngIf="companies.length > 0 && totalPages <= 1" class="bg-muted/30 px-6 py-3 border-t border-border">
        <div class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
          Total: {{ companies.length }} empresas cargadas
        </div>
      </div>
    </div>
  `,
})
export class CompanyTableComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @Input() pageSize = 10;
  
  @Output() edit = new EventEmitter<Company>();
  @Output() delete = new EventEmitter<Company>();

  companies: Company[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  
  currentFilters: CompanyParams = {
    isActive: true,
    sortBy: 'legalName',
    sortOrder: 'asc'
  };

  canEdit = false;
  canDelete = false;

  ngOnInit() {
    this.checkPermissions();
    this.loadCompanies();
  }

  private checkPermissions() {
    this.canEdit = !this.authService.hasRole(UserRole.INSPECTOR);
    this.canDelete = this.authService.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]);
  }

  loadCompanies() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const params: CompanyParams = {
      ...this.currentFilters,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.companyService.getCompanies(params).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.companies = response.data || [];
        this.totalPages = response.meta?.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  updateFilters(filters: any) {
    const [sortField, sortOrder] = (filters.sortBy || 'legalName-asc').split('-');
    
    this.currentFilters = {
      ...filters,
      sortBy: sortField as any,
      sortOrder: sortOrder as any
    };
    
    this.refresh();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCompanies(); 
    }
  }

  onEdit(company: Company) {
    this.edit.emit(company);
  }

  onDelete(company: Company) {
    this.delete.emit(company);
  }

  refresh() {
    this.currentPage = 1;
    this.loadCompanies();
  }
}
