import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { UserFormComponent } from '../../components/user-form/user-form';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, UserFormComponent, FormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersListComponent {
  isModalOpen = false;
  
  isDeleteModalOpen = false; 
  userToDelete: any = null; 

  users = [
    { name: 'María', lastName: 'González', ci: '12345678', email: 'maria.gonzalez@gams.gob.bo', role: 'Secretaría', status: 'Activo' },
    { name: 'Carlos', lastName: 'Pérez', ci: '87654321', email: 'carlos.inspector@gams.gob.bo', role: 'Inspector', status: 'Activo' },
    { name: 'Ana', lastName: 'Rodríguez', ci: '11223344', email: 'ana.super@gams.gob.bo', role: 'SuperAdmin', status: 'Activo' },
    { name: 'Juan', lastName: 'Mamani', ci: '55667788', email: 'juan.inspector@gams.gob.bo', role: 'Inspector', status: 'Activo' },
    { name: 'Rosa', lastName: 'Quispe', ci: '99887766', email: 'rosa.secretaria@gams.gob.bo', role: 'Secretaría', status: 'Inactivo' },
  ];

  searchTerm: string = '';
  sortAscending: boolean = true;
  itemsPerPage: number = 5;
  currentPage: number = 1;

  get filteredUsers() {
    let filtered = this.users.filter(u => 
      u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.ci.includes(this.searchTerm) ||
      u.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let res = a.name.localeCompare(b.name);
      return this.sortAscending ? res : -res;
    });

    return filtered;
  }

  get displayedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
  }

  onSearchChange() {
    this.currentPage = 1; 
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDeleteModal(user: any) {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.users = this.users.filter(u => u.ci !== this.userToDelete.ci);
      this.closeDeleteModal();
      
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    }
  }
}