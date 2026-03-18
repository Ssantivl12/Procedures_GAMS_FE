import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyHeaderComponent } from '../../components/company-header/company-header';
import { CompanyFiltersComponent } from '../../components/company-filters/company-filters';
import { CompanyTableComponent } from '../../components/company-table/company-table';
import { CompanyFormComponent } from '../../components/company-form/company-form';
import { CompanyService, Company } from '../../services/company.service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardHeaderComponent, 
    CompanyHeaderComponent, 
    CompanyFiltersComponent, 
    CompanyTableComponent, 
    CompanyFormComponent
  ],
  templateUrl: './companies-list.html',
  styleUrl: './companies-list.css'
})
export class CompaniesListComponent {
  private companyService = inject(CompanyService);
  @ViewChild(CompanyTableComponent) companyTable!: CompanyTableComponent;

  isModalOpen = false;
  selectedCompany: Company | null = null;
  
  searchQuery = '';
  sortBy = 'legalName-asc';
  pageSize = 10;

  onSearch(query: string) {
    this.searchQuery = query;
    this.companyTable.searchQuery = query;
    this.companyTable.refresh();
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.companyTable.sortBy = sortBy;
    this.companyTable.refresh();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.companyTable.pageSize = size;
    this.companyTable.refresh();
  }

  onRefresh() {
    this.companyTable.refresh();
  }

  openCompanyModal(company: Company | null = null) {
    this.selectedCompany = company;
    this.isModalOpen = true;
  }

  closeCompanyModal() {
    this.isModalOpen = false;
    this.selectedCompany = null;
  }

  onCompanySaved() {
    this.onRefresh();
    this.closeCompanyModal();
  }

  onDeleteCompany(company: Company) {
    if (confirm(`¿Estás seguro de eliminar la empresa ${company.legalName}? Esta acción no se puede deshacer.`)) {
      this.companyService.deleteCompany(company.id).subscribe({
        next: () => {
          this.onRefresh();
        },
        error: (err) => {
          console.error('Error deleting company:', err);
          alert('No se pudo eliminar la empresa. Intente de nuevo.');
        }
      });
    }
  }
}