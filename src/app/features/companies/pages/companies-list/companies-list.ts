import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyHeaderComponent } from '../../components/company-header/company-header';
import { CompanyFiltersComponent, CompanyFilterState } from '../../components/company-filters/company-filters';
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

  isModalOpen    = false;
  selectedCompany: Company | null = null;
  pageSize       = 10;

  companyToDelete: Company | null = null;
  isDeleting = false;

  onFiltersChanged(filters: CompanyFilterState) {
    this.companyTable.updateFilters(filters);
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
    this.companyToDelete = company;
  }

  cancelDelete() {
    this.companyToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete() {
    if (!this.companyToDelete) return;
    this.isDeleting = true;

    this.companyService.deleteCompany(this.companyToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.companyToDelete = null;
        this.onRefresh();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Error eliminando empresa:', err);
        alert('No se pudo eliminar la empresa. Intente de nuevo.');
        this.companyToDelete = null;
      }
    });
  }
}