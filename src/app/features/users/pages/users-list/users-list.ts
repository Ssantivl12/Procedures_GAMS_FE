import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { UserHeaderComponent } from '../../components/user-header/user-header';
import { UserFiltersComponent } from '../../components/user-filters/user-filters';
import { UsersTableComponent } from '../../components/users-table/users-table';
import { UserFormComponent } from '../../components/user-form/user-form';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardHeaderComponent, 
    UserHeaderComponent, 
    UserFiltersComponent, 
    UsersTableComponent, 
    UserFormComponent
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersListComponent {
  private userService = inject(UserService);
  @ViewChild(UsersTableComponent) usersTable!: UsersTableComponent;

  isModalOpen = false;
  selectedUser: User | null = null;
  
  searchQuery = '';
  sortBy = 'lastName-asc';
  pageSize = 10;

  onSearch(query: string) {
    this.searchQuery = query;
    this.usersTable.searchQuery = query;
    this.usersTable.refresh();
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.usersTable.sortBy = sortBy;
    this.usersTable.refresh();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.usersTable.pageSize = size;
    this.usersTable.refresh();
  }

  onRefresh() {
    this.usersTable.refresh();
  }

  openUserModal(user: User | null = null) {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeUserModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  onUserSaved() {
    this.onRefresh();
    this.closeUserModal();
  }

  onDeleteUser(user: User) {
    // TODO: Implementar un modal de confirmación premium como el de Horus en el futuro
    if (confirm(`¿Estás seguro de eliminar a ${user.nombres} ${user.apellidos}? Esta acción no se puede deshacer.`)) {
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.onRefresh();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('No se pudo eliminar al usuario. Intente de nuevo.');
        }
      });
    }
  }
}