import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-case-file-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-card p-4 rounded-xl border border-border shadow-sm animate-fade-in mb-6">
      <div class="flex flex-col lg:flex-row gap-4 lg:items-center">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="Buscar por código, empresa o RAI..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Status Filter -->
          <div class="flex items-center gap-2">
            <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado:</label>
            <select [(ngModel)]="status" (change)="onFilterChange()"
                    class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
              <option value="">Todos</option>
              <option value="open">Abiertos</option>
              <option value="closed">Cerrados</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div class="flex items-center gap-2">
            <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categoría:</label>
            <select [(ngModel)]="category" (ngModelChange)="onFilterChange()"
                    class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
              <option value="">Todas</option>
              <option value="C3">Categoria C3</option>
              <option value="C4">Categoria C4</option>
            </select>
          </div>

          <!-- Page Size -->
          <div class="flex items-center gap-2 px-1">
            <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ver:</label>
            <select
              [(ngModel)]="pageSize"
              (ngModelChange)="onPageSizeChange()"
              class="bg-muted/30 border-none text-foreground text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
          </div>

          <!-- Soft Delete (Superadmin only) -->
          @if (isSuperAdmin) {
            <div class="flex items-center gap-2 group px-2 py-1 rounded-lg hover:bg-muted transition-colors">
              <input type="checkbox" id="showInactive" 
                     [checked]="showInactive" 
                     (click)="showInactive = !showInactive; onFilterChange()" 
                     class="cursor-pointer w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30 transition-all">
              <label for="showInactive" class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors cursor-pointer">Ver Inactivos</label>
            </div>
          }

          <div class="w-px h-6 bg-border mx-1"></div>

          <button
            (click)="refresh.emit()"
            class="cursor-pointer p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors group"
            title="Actualizar">
            <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CaseFileFiltersComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  @Input() searchQuery = '';
  @Input() pageSize = 10;
  status = '';
  category = '';
  showInactive = false;
  isSuperAdmin = false;

  @Output() filtersChanged = new EventEmitter<any>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();

  ngOnInit() {
    this.isSuperAdmin = this.authService.hasRole([UserRole.SUPERADMIN]);
  }

  onFilterChange() {
    this.filtersChanged.emit({
      search: this.searchQuery || undefined,
      status: this.status || undefined,
      category: this.category || undefined,
      isActive: this.showInactive ? false : undefined
    });
  }

  onPageSizeChange() {
    this.pageSizeChange.emit(this.pageSize);
  }
}
