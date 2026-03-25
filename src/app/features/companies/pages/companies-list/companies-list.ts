import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyHeaderComponent } from '../../components/company-header/company-header';
import { CompanyFiltersComponent, CompanyFilterState } from '../../components/company-filters/company-filters';
import { CompanyTableComponent } from '../../components/company-table/company-table';
import { CompanyFormComponent } from '../../components/company-form/company-form';
import { CompanyService, Company } from '../../services/company.service';
import { showToast } from '../../../../shared/utils/toast.utils';
import Swal from 'sweetalert2';

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

  isModalOpen     = false;
  selectedCompany: Company | null = null;
  pageSize        = 10;

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

  async onDeleteCompany(company: Company) {
    const result = await Swal.fire({
      title: 'Eliminar Empresa',
      html: `¿Estás seguro de que deseas eliminar la empresa <span class="font-semibold text-foreground">${company.legalName}</span>? Esta acción la marcará como inactiva.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Eliminación',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border',
        title: 'text-lg font-bold text-foreground text-left w-full m-0 p-0 mb-1',
        htmlContainer: 'text-sm text-muted-foreground text-left w-full m-0 p-0',
        actions: 'flex items-center justify-end gap-3 w-full mt-6 p-0',
        confirmButton: 'cursor-pointer px-4 py-2 text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors',
        cancelButton: 'cursor-pointer px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors',
        icon: 'border-0 bg-destructive/10 text-destructive rounded-full w-12 h-12 m-0 mb-4 mx-auto md:mx-0 flex items-center justify-center', 
      }
    });

    if (!result.isConfirmed) return;

    // Show loading state while deleting
    Swal.fire({
      title: 'Eliminando...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      customClass: {
        popup: 'bg-card rounded-2xl border border-border',
        title: 'text-foreground font-semibold',
      }
    });

    this.companyService.deleteCompany(company.id).subscribe({
      next: () => {
        Swal.close();
        showToast('success', `Empresa eliminada correctamente`);
        this.onRefresh();
      },
      error: (err: any) => {
        Swal.close();
        const backendMsg: string = err?.error?.message ?? '';
        let toastMessage = 'Ocurrió un error inesperado al eliminar.';

        if (err.status === 409) {
          if (backendMsg.toLowerCase().includes('active case file')) {
            toastMessage = 'No se puede eliminar: tiene un expediente abierto.';
          } else if (backendMsg.toLowerCase().includes('already deleted')) {
            toastMessage = 'La empresa ya fue marcada como inactiva.';
          }
        }

        showToast('error', toastMessage);
      },
    });
  }

  async onReactivateCompany(company: Company) {
    const result = await Swal.fire({
      title: 'Reactivar Empresa',
      html: `¿Estás seguro de que deseas reactivar la empresa <span class="font-semibold text-foreground">${company.legalName}</span>? Recuperará su estado vigente.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Reactivación',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border',
        title: 'text-lg font-bold text-foreground text-left w-full m-0 p-0 mb-1',
        htmlContainer: 'text-sm text-muted-foreground text-left w-full m-0 p-0',
        actions: 'flex items-center justify-end gap-3 w-full mt-6 p-0',
        confirmButton: 'cursor-pointer px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors',
        cancelButton: 'cursor-pointer px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors',
        icon: 'border-0 bg-emerald-500/10 text-emerald-500 rounded-full w-12 h-12 m-0 mb-4 mx-auto md:mx-0 flex items-center justify-center', 
      }
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Reactivando...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      customClass: {
        popup: 'bg-card rounded-2xl border border-border',
        title: 'text-foreground font-semibold',
      }
    });

    this.companyService.reactivateCompany(company.id).subscribe({
      next: () => {
        Swal.close();
        showToast('success', `Empresa reactivada correctamente`);
        this.onRefresh();
      },
      error: () => {
        Swal.close();
        showToast('error', 'Ocurrió un error inesperado al reactivar.');
      },
    });
  }
}