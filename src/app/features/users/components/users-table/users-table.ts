import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-[0.1em] border-y border-border">
              <th class="px-6 py-4 font-semibold">Personal</th>
              <th class="px-6 py-4 font-semibold">Email Institucional</th>
              <th class="px-6 py-4 font-semibold">Rol / Cargo</th>
              <th class="px-6 py-4 font-semibold">Estado</th>
              <th class="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <!-- Loading State -->
            <tr *ngIf="isLoading && users.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                <svg class="animate-spin h-8 w-8 mx-auto text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-sm font-medium">Obteniendo registros de personal...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="!isLoading && users.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-border mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p class="text-sm font-medium">No se encontraron funcionarios registrados.</p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr *ngFor="let user of users" class="hover:bg-muted/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-foreground leading-tight">{{ user.firstName }} {{ user.lastName }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground lowercase">
                {{ user.email }}
              </td>
              <td class="px-6 py-4" *ngIf="user.roles">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let role of user.roles" class="px-2 py-1 rounded-md bg-secondary text-[11px] font-bold text-primary uppercase tracking-wider">
                    {{ role }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4" *ngIf="!user.roles">
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  [ngClass]="user.isActive 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'bg-destructive/10 text-destructive ring-1 ring-destructive/20'">
                  <span class="h-1.5 w-1.5 rounded-full" [ngClass]="user.isActive ? 'bg-emerald-500' : 'bg-destructive'"></span>
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 transition-opacity">
                  <button type="button" (click)="onEdit(user, $event)" class="cursor-pointer p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Editar">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" *ngIf="user.isActive" (click)="onDelete(user, $event)" class="cursor-pointer p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Eliminar">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button type="button" *ngIf="!user.isActive" (click)="onReactivate(user, $event)" class="cursor-pointer p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Reactivar">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 640 640" 
                      class="w-4 h-4 pointer-events-none" 
                      fill="currentColor">
                      <path d="M286 368C384.5 368 464.3 447.8 464.3 546.3C464.3 562.7 451 576 434.6 576L78 576C61.6 576 48.3 562.7 48.3 546.3C48.3 447.8 128.1 368 226.6 368L286 368zM585.7 169.9C593.5 159.2 608.5 156.8 619.2 164.6C629.9 172.4 632.3 187.4 624.5 198.1L522.1 338.9C517.9 344.6 511.4 348.3 504.4 348.7C497.4 349.1 490.4 346.5 485.5 341.4L439.1 293.4C429.9 283.9 430.1 268.7 439.7 259.5C449.2 250.3 464.4 250.6 473.6 260.1L500.1 287.5L585.7 169.8zM256.3 312C190 312 136.3 258.3 136.3 192C136.3 125.7 190 72 256.3 72C322.6 72 376.3 125.7 376.3 192C376.3 258.3 322.6 312 256.3 312z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Info Footer -->
      <div *ngIf="totalFiltered > 0" class="bg-white px-6 py-4 border-t border-border flex items-center justify-between">
        <div class="text-sm text-slate-500 font-medium">
          Mostrando {{ users.length }} de {{ totalFiltered }} registros
        </div>

        <div class="flex items-center gap-2">
          <button 
            class="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-400 transition-all"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Anterior
          </button>

          <div class="flex items-center px-1 gap-1">
            <button 
              *ngFor="let page of pageNumbers"
              (click)="goToPage(page)"
              [class]="currentPage === page 
                ? 'w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold shadow-md shadow-emerald-200' 
                : 'w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 font-semibold transition-colors'">
              {{ page }}
            </button>
          </div>

          <button 
            class="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-400 transition-all"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)">
            Siguiente
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UsersTableComponent implements OnInit, OnChanges {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  @Input() searchQuery = '';
  @Input() sortBy = 'lastName-asc';
  @Input() pageSize = 10;
  
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();
  @Output() reactivate = new EventEmitter<User>();

  allUsers: User[] = [];
  users: User[] = [];
  isLoading = true;
  currentPage = 1;
  totalFiltered = 0;

  ngOnInit() {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] || changes['sortBy'] || changes['pageSize']) {
      this.currentPage = 1; 
      this.applyFilters();
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.userService.getUsers().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data: User[]) => {
        this.allUsers = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  applyFilters() {
    if (!this.allUsers) return;

    let result = [...this.allUsers];

    // Filtro de búsqueda
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.lastName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.roles || []).join(' ').toLowerCase().includes(q)
      );
    }

    // Ordenamiento
    switch (this.sortBy) {
      case 'lastName-asc':
        result.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        break;
      case 'lastName-desc':
        result.sort((a, b) => (b.lastName || '').localeCompare(a.lastName || ''));
        break;
      case 'firstName-asc':
        result.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
        break;
      case 'createdAt-desc':
        result.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    // Activos primero
    result.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });

    // Paginación
    this.totalFiltered = result.length;
    const start = (this.currentPage - 1) * this.pageSize;
    this.users = result.slice(start, start + this.pageSize);

    this.cdr.detectChanges();
  }

  get totalPages(): number {
    return Math.ceil(this.totalFiltered / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5; 
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onEdit(user: User, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Action Clicked: EDIT for user', user.email);
    this.edit.emit(user);
  }

  onDelete(user: User, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Action Clicked: DELETE for user', user.email);
    this.delete.emit(user);
  }

  onReactivate(user: User, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Action Clicked: REACTIVATE for user', user.email);
    this.reactivate.emit(user);
  }

  refresh() {
    this.loadUsers();
  }
}
