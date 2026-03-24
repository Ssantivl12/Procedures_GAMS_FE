import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

export interface CompanyFilterState {
  search?: string;
  sortBy: string;
  category?: string;
  geoZone?: string;
  hasRaiNumber?: boolean;
  isActive?: boolean | undefined;
}

@Component({
  selector: 'app-company-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-card p-4 rounded-xl border border-border shadow-sm animate-fade-in">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
                <!-- Search -->
                <div class="relative flex-1 w-full">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onFilterChange()"
                        placeholder="Buscar por nombre, NIT o RAI..."
                        class="block w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background transition-all"
                    />
                </div>

                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <!-- Sort By -->
                    <div class="flex items-center gap-2">
                        <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ordenar:</label>
                        <select
                            [(ngModel)]="sortBy"
                            (ngModelChange)="onFilterChange()"
                            class="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block p-2 outline-none transition-all cursor-pointer">
                            <option value="legalName-asc">Nombre (A-Z)</option>
                            <option value="legalName-desc">Nombre (Z-A)</option>
                            <option value="raiNumber-asc">RAI (Creciente)</option>
                            <option value="createdAt-desc">Más recientes</option>
                        </select>
                    </div>

                    <!-- Page Size -->
                    <div class="flex items-center gap-2">
                        <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ver:</label>
                        <select
                            [(ngModel)]="pageSize"
                            (ngModelChange)="onPageSizeChange()"
                            class="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block p-2 outline-none transition-all cursor-pointer">
                            <option [value]="10">10</option>
                            <option [value]="25">25</option>
                            <option [value]="50">50</option>
                        </select>
                    </div>

                    <!-- Refresh -->
                    <button
                        (click)="onRefresh()"
                        class="inline-flex items-center justify-center p-2 bg-muted/50 text-muted-foreground rounded-lg border border-transparent hover:bg-muted hover:text-primary transition-all cursor-pointer"
                        title="Actualizar">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Advanced Filters -->
            <div class="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">

                <!-- Categoría -->
                <div class="flex items-center gap-2">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categoría:</label>
                    <select
                        [(ngModel)]="category"
                        (ngModelChange)="onFilterChange()"
                        class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
                        <option value="">Todas</option>
                        <option value="C3">C3</option>
                        <option value="C4">C4</option>
                    </select>
                </div>

                <!-- Zona -->
                <div class="flex items-center gap-2">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Zona:</label>
                    <select
                        [(ngModel)]="geoZone"
                        (ngModelChange)="onFilterChange()"
                        class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
                        <option value="">Todas</option>
                        <option value="Urbano">Urbano</option>
                        <option value="Rural">Rural</option>
                    </select>
                </div>

                <!-- Tiene RAI -->
                <div class="flex items-center gap-2">
                    <label class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            [checked]="hasRaiNumber"
                            (click)="hasRaiNumber = !hasRaiNumber; onFilterChange()"
                            class="cursor-pointer w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary/30">
                        <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tiene RAI</span>
                    </label>
                </div>

                <!-- Estado -->
                <div class="flex items-center gap-2" *ngIf="canSeeInactive">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado:</label>
                    <select
                        [(ngModel)]="statusFilter"
                        (ngModelChange)="onFilterChange()"
                        class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                        <option value="all">Todas</option>
                    </select>
                </div>

            </div>
        </div>
    </div>
  `
})
export class CompanyFiltersComponent implements OnInit {
  private authService = inject(AuthService);

  @Input() pageSize = 10;

  searchQuery = '';
  sortBy = 'legalName-asc';
  category = '';
  geoZone = '';           
  hasRaiNumber = false;
  statusFilter = 'active';

  canSeeInactive = false;

  @Output() filtersChanged = new EventEmitter<CompanyFilterState>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();

  ngOnInit() {
    this.canSeeInactive = this.authService.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]);
  }

  onFilterChange() {
    const isActive: boolean | undefined =
      this.statusFilter === 'all'
        ? undefined
        : this.statusFilter === 'active'
        ? true
        : false;

    this.filtersChanged.emit({
      search:       this.searchQuery.trim() || undefined,
      sortBy:       this.sortBy,
      category:     this.category || undefined,
      geoZone:         this.geoZone || undefined,       
      hasRaiNumber: this.hasRaiNumber || undefined,
      isActive,
    });
  }

  onPageSizeChange() {
    this.pageSizeChange.emit(this.pageSize);
  }

  onRefresh() {
    this.refresh.emit();
  }
}