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
                  <button type="button" (click)="onEdit(user, $event)" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Editar">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" *ngIf="user.isActive" (click)="onDelete(user, $event)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Eliminar">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button type="button" *ngIf="!user.isActive" (click)="onReactivate(user, $event)" class="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Reactivar">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mini Info Footer -->
      <div *ngIf="users.length > 0" class="bg-muted/30 px-6 py-3 border-t border-border">
        <div class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
          Total: {{ users.length }} registros cargados
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

  ngOnInit() {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] || changes['sortBy']) {
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
    
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u => 
        (u.firstName || '').toLowerCase().includes(q) || 
        (u.lastName || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q) ||
        (u.roles || []).join(' ').toLowerCase().includes(q)
      );
    }

    if (this.sortBy === 'lastName-asc') {
      result.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
    } else if (this.sortBy === 'firstName-asc') {
      result.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    } else if (this.sortBy === 'role') {
      result.sort((a, b) => (a.roles[0] || '').localeCompare(b.roles[0] || ''));
    }
    
    result.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
    
    this.users = result;
    this.cdr.detectChanges();
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
