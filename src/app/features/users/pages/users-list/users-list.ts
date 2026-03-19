import { Component, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  @ViewChild(UsersTableComponent) usersTable!: UsersTableComponent;

  isModalOpen = false;
  selectedUser: User | null = null;
  
  userToDelete: User | null = null;
  isDeleting = false;

  userToReactivate: User | null = null;
  isReactivating = false;

  searchQuery = '';
  sortBy = 'lastName-asc';
  pageSize = 10;

  onSearch(query: string) {
    this.searchQuery = query;
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
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
    this.userToDelete = user;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.userToDelete = null;
    this.isDeleting = false;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (!this.userToDelete) return;
    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.userService.updateUser(this.userToDelete.id!, { isActive: false }).subscribe({
      next: () => {
        this.isDeleting = false;
        this.userToDelete = null;
        this.onRefresh();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Error soft-deleting user:', err);
        this.userToDelete = null;
        this.cdr.detectChanges();
      }
    });
  }

  onReactivateUser(user: User) {
    this.userToReactivate = user;
    this.cdr.detectChanges();
  }

  cancelReactivate() {
    this.userToReactivate = null;
    this.isReactivating = false;
    this.cdr.detectChanges();
  }

  confirmReactivate() {
    if (!this.userToReactivate) return;
    this.isReactivating = true;
    this.cdr.detectChanges();
    
    this.userService.updateUser(this.userToReactivate.id!, { isActive: true }).subscribe({
      next: () => {
        this.isReactivating = false;
        this.userToReactivate = null;
        this.onRefresh();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isReactivating = false;
        console.error('Error reactivating user:', err);
        this.userToReactivate = null;
        this.cdr.detectChanges();
      }
    });
  }
}