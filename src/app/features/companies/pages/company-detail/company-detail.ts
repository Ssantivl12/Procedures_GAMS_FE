import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CompanyService, Company } from '../../services/company.service';
import { CaseFileService } from '../../../case-files/services/case-file.service';
import { ProcedureService } from '../../../procedures/services/procedure.service';
import { CaseFileFormComponent } from '../../../case-files/components/case-file-form/case-file-form';
import { ProcedureFormComponent } from '../../../procedures/components/procedure-form/procedure-form';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { CaseFile, Procedure, PaginatedResponse } from '../../../../shared/models';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DashboardHeaderComponent,
    CaseFileFormComponent, ProcedureFormComponent,
    StatusBadgeComponent, TypeBadgeComponent, EmptyStateComponent,
  ],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.css',
})
export class CompanyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly companyService = inject(CompanyService);
  private readonly caseFileService = inject(CaseFileService);
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  company: Company | null = null;
  caseFile: CaseFile | null = null;
  procedures: Procedure[] = [];
  isLoadingCompany = true;
  isLoadingCaseFile = true;
  isLoadingProcedures = false;

  activeTab = 'general';
  showCaseFileForm = false;
  showProcedureForm = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompany(id);
      this.loadCaseFile(id);
    }
  }

  loadCompany(id: string): void {
    this.isLoadingCompany = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (company) => {
        this.company = company;
        this.isLoadingCompany = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCompany = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCaseFile(companyId: string): void {
    this.isLoadingCaseFile = true;
    this.caseFileService.getCaseFileByCompany(companyId).subscribe({
      next: (cf) => {
        this.caseFile = cf;
        this.isLoadingCaseFile = false;
        if (cf) {
          this.loadProcedures(cf.id);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.caseFile = null;
        this.isLoadingCaseFile = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadProcedures(caseFileId: string): void {
    this.isLoadingProcedures = true;
    this.procedureService.getProcedures({ caseFileId, limit: 50 }).subscribe({
      next: (res: PaginatedResponse<Procedure>) => {
        this.procedures = res.data || [];
        this.isLoadingProcedures = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProcedures = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  onCaseFileSaved(): void {
    this.showCaseFileForm = false;
    if (this.company) {
      this.loadCaseFile(this.company.id);
    }
  }

  onProcedureSaved(): void {
    this.showProcedureForm = false;
    if (this.caseFile) {
      this.loadProcedures(this.caseFile.id);
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
