import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
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
                  <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100 shadow-sm">
                    {{ user.fullName.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-foreground leading-tight">{{ user.fullName }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">ID: {{ user.id?.substring(0, 8) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground lowercase">
                {{ user.email }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let role of user.roles" class="px-2 py-1 rounded-md bg-secondary text-[11px] font-bold text-primary uppercase tracking-wider">
                    {{ role }}
                  </span>
                </div>
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
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="onEdit(user)" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Editar">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="onDelete(user)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Eliminar">
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
export class UsersTableComponent implements OnInit {
  private userService = inject(UserService);

  @Input() searchQuery = '';
  @Input() sortBy = 'fullName-asc';
  @Input() pageSize = 10;
  
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();

  users: User[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    console.log('Cargando usuarios de GAMS...');
    
    this.userService.getUsers({
      query: this.searchQuery
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: User[]) => {
        console.log('Usuarios recibidos:', data.length);
        this.users = data;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  onEdit(user: User) {
    this.edit.emit(user);
  }

  onDelete(user: User) {
    this.delete.emit(user);
  }

  refresh() {
    this.loadUsers();
  }
}
