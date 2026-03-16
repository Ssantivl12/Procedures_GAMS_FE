import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyFormComponent } from '../../components/company-form/company-form';
import { CompanyService, Company } from '../../services/company.service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, CompanyFormComponent, RouterModule, FormsModule],
  templateUrl: './companies-list.html', 
  styleUrl: './companies-list.css'    
})
export class CompaniesListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private cdr = inject(ChangeDetectorRef);

  isModalOpen = false; 
  companies: Company[] = []; 
  
  selectedCompany: Company | null = null; 

  searchTerm: string = '';
  sortAscending: boolean = true;
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  ngOnInit() { this.loadCompanies(); }

  loadCompanies() {
    const params: any = {
      page: this.currentPage, limit: this.itemsPerPage,
      sortBy: 'legalName', sortOrder: this.sortAscending ? 'asc' : 'desc'
    };
    if (this.searchTerm) params.search = this.searchTerm;

    this.companyService.getCompanies(params).subscribe({
      next: (response) => {
        this.companies = response.data; 
        this.totalPages = response.meta.totalPages; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  onSearchChange() { this.currentPage = 1; this.loadCompanies(); }
  toggleSort() { this.sortAscending = !this.sortAscending; this.currentPage = 1; this.loadCompanies(); }
  
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page; this.loadCompanies(); 
    }
  }
  
  openCreateModal() {
    this.selectedCompany = null; 
    this.isModalOpen = true;
  }

  openEditModal(company: Company) {
    this.selectedCompany = company; 
    this.isModalOpen = true;
  }

  deleteCompany(company: Company) {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar la empresa: ${company.legalName}?`);
    
    if (confirmacion) {
      this.companyService.deleteCompany(company.id).subscribe({
        next: () => {
          alert('Empresa eliminada exitosamente.');
          this.loadCompanies(); 
        },
        error: (err: any) => {
          console.error(err);
          alert('Hubo un error al intentar eliminar la empresa.');
        }
      });
    }
  }

  onCompanyRegistered() {
    this.isModalOpen = false; 
    this.loadCompanies(); 
  }
}