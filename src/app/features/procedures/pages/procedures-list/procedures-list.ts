import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ProcedureHeaderComponent } from '../../components/procedure-header/procedure-header';
import { ProcedureFiltersComponent } from '../../components/procedure-filters/procedure-filters';
import { ProcedureTableComponent } from '../../components/procedure-table/procedure-table';
import { ProcedureFormComponent } from '../../components/procedure-form/procedure-form';

@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    ProcedureHeaderComponent,
    ProcedureFiltersComponent,
    ProcedureTableComponent,
    ProcedureFormComponent,
  ],
  templateUrl: './procedures-list.html',
  styleUrl: './procedures-list.css',
})
export class ProceduresListComponent {
  @ViewChild(ProcedureTableComponent) procedureTable!: ProcedureTableComponent;

  isModalOpen = false;
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  pageSize = 10;

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
  }

  onTypeChange(type: string): void {
    this.typeFilter = type;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
  }

  onRefresh(): void {
    this.procedureTable?.refresh();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onProcedureSaved(): void {
    this.isModalOpen = false;
    this.procedureTable?.refresh();
  }
}
