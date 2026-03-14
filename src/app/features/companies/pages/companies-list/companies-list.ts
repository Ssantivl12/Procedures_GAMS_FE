import { Component, OnInit, inject } from '@angular/core';
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

  isModalOpen = false; 
  companies: Company[] = []; 

  searchTerm: string = '';
  sortAscending: boolean = true;
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  ngOnInit() {
    this.loadCompanies(); 
  }

  loadCompanies() {
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortBy: 'legalName',
      sortOrder: this.sortAscending ? 'asc' : 'desc'
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.companyService.getCompanies(params).subscribe({
      next: (response) => {
        this.companies = response.data; 
        this.totalPages = response.meta.totalPages; 
      },
      error: (err) => {
        console.error('Error al cargar las empresas:', err);
      }
    });
  }

  onSearchChange() {
    this.currentPage = 1; 
    this.loadCompanies(); 
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.currentPage = 1;
    this.loadCompanies(); 
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCompanies(); 
    }
  }

  onCompanyRegistered() {
    this.isModalOpen = false;
    this.loadCompanies(); 
  }
}