import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CaseFileHeaderComponent } from '../../components/case-file-header/case-file-header';
import { CaseFileFiltersComponent } from '../../components/case-file-filters/case-file-filters';
import { CaseFileTableComponent } from '../../components/case-file-table/case-file-table';
import { CaseFileFormComponent } from '../../components/case-file-form/case-file-form';

@Component({
  selector: 'app-case-files-list',
  standalone: true,
  imports: [
    CommonModule, DashboardHeaderComponent,
    CaseFileHeaderComponent, CaseFileFiltersComponent,
    CaseFileTableComponent, CaseFileFormComponent,
  ],
  template: `
    <div class="min-h-screen" style="background: hsl(var(--background))">
      <app-dashboard-header></app-dashboard-header>
      <main class="p-6" style="animation: fadeIn 0.3s ease-out">
        <app-case-file-header (addCaseFile)="isModalOpen = true"></app-case-file-header>
        <app-case-file-filters
          [searchQuery]="searchQuery"
          (search)="searchQuery = $event"
          (refresh)="caseFileTable.refresh()">
        </app-case-file-filters>
        <app-case-file-table [searchQuery]="searchQuery"></app-case-file-table>
      </main>
      @if (isModalOpen) {
        <app-case-file-form
          (closeForm)="isModalOpen = false"
          (caseFileSaved)="onCaseFileSaved()">
        </app-case-file-form>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class CaseFilesListComponent {
  @ViewChild(CaseFileTableComponent) caseFileTable!: CaseFileTableComponent;
  isModalOpen = false;
  searchQuery = '';

  onCaseFileSaved(): void {
    this.isModalOpen = false;
    this.caseFileTable?.refresh();
  }
}
