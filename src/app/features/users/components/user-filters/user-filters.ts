import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-card p-4 rounded-xl border border-border shadow-sm animate-fade-in">
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
                <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
                    placeholder="Buscar por nombre, CI o email..."
                    class="block w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background transition-all" />
            </div>

            <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <!-- Sort By -->
                <div class="flex items-center gap-2">
                    <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ordenar por:</label>
                    <select [(ngModel)]="sortBy" (change)="onSortChange()"
                        class="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block p-2 outline-none transition-all cursor-pointer">
                        <option value="lastName-asc">Apellidos (A-Z)</option>
                        <option value="lastName-desc">Apellidos (Z-A)</option>
                        <option value="firstName-asc">Nombre (A-Z)</option>
                        <option value="createdAt-desc">Más recientes</option>
                    </select>
                </div>

                <!-- Page Size -->
                <div class="flex items-center gap-2">
                    <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Por página:</label>
                    <select [(ngModel)]="pageSize" (change)="onPageSizeChange()"
                        class="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary block p-2 outline-none transition-all cursor-pointer">
                        <option [value]="5">5</option>
                        <option [value]="10">10</option>
                        <option [value]="25">25</option>
                        <option [value]="50">50</option>
                    </select>
                </div>

                <!-- Refresh -->
                <button (click)="onRefresh()"
                    class="inline-flex items-center justify-center p-2 bg-muted/50 text-muted-foreground rounded-lg border border-transparent hover:bg-muted hover:text-primary transition-all cursor-pointer"
                    title="Actualizar">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    `
})
export class UserFiltersComponent {
    @Input() searchQuery = '';
    @Input() sortBy = 'apellidos-asc';
    @Input() pageSize = 10;

    @Output() search = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<string>();
    @Output() pageSizeChange = new EventEmitter<number>();
    @Output() refresh = new EventEmitter<void>();

    onSearchChange() { this.search.emit(this.searchQuery); }
    onSortChange() { this.sortChange.emit(this.sortBy); }
    onPageSizeChange() { this.pageSizeChange.emit(this.pageSize); }
    onRefresh() { this.refresh.emit(); }
}
