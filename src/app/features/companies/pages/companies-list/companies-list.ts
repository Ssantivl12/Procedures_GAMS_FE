import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyFormComponent } from '../../components/company-form/company-form';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, CompanyFormComponent, RouterModule, FormsModule],
  templateUrl: './companies-list.html', 
  styleUrl: './companies-list.css'    
})
export class CompaniesListComponent {
  isModalOpen = false; 
  companies = [
    { id: '1', name: 'INDUSTRIAS ALIMENTICIAS CORONILLA S.A.', nit: '1016839028', cate: '3', estado: 'Vigente', sub: '9 de 10', vigencia: '23/04/2026' },
    { id: '2', name: 'EMPRESA CONSTRUCTORA Y DE SERVICIOS', nit: '2023456789', cate: '4', estado: 'Observado', sub: '2 de 5', vigencia: '15/10/2025' },
    { id: '3', name: 'COOPERATIVA DE TRANSPORTE Y TURISMO S.R.L.', nit: '3034567891', cate: '4', estado: 'Vigente', sub: '8 de 8', vigencia: '01/01/2027' },
    { id: '4', name: 'PHARMACOSMÉDICA ANDINA S.A.', nit: '4045678912', cate: '3', estado: 'Vigente', sub: '12 de 12', vigencia: '10/06/2026' },
    { id: '5', name: 'GESTIÓN INTEGRAL DE RESIDUOS Y RECICLAJE', nit: '5056789123', cate: '3', estado: 'En Subsanación', sub: '1 de 6', vigencia: '30/08/2025' },
  ];

  searchTerm: string = '';
  sortAscending: boolean = true;
  itemsPerPage: number = 5;
  currentPage: number = 1;

  get filteredCompanies() {
    let filtered = this.companies.filter(c => 
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.nit.includes(this.searchTerm) ||
      c.cate.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let res = a.name.localeCompare(b.name);
      return this.sortAscending ? res : -res;
    });

    return filtered;
  }

  get displayedCompanies() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCompanies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCompanies.length / this.itemsPerPage) || 1;
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
}