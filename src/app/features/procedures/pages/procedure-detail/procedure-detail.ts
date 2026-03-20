import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { ProcedureStepperComponent } from '../../components/procedure-stepper/procedure-stepper';
import { ProcedureInfoCardComponent } from '../../components/procedure-info-card/procedure-info-card';
import { ProcedureActionsComponent, ActionEvent } from '../../components/procedure-actions/procedure-actions';
import { ProcedureAuditTimelineComponent } from '../../components/procedure-audit-timeline/procedure-audit-timeline';
import { ObservationsCardComponent } from '../../components/observations-card/observations-card';
import { DocumentsCardComponent } from '../../components/documents-card/documents-card';
import { StatusChangeDialogComponent } from '../../components/status-change-dialog/status-change-dialog';
import { AssignInspectorDialogComponent } from '../../components/assign-inspector-dialog/assign-inspector-dialog';
import { ObservationFormComponent } from '../../components/observation-form/observation-form';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';
import { TypeBadgeComponent } from '../../../../shared/ui/type-badge/type-badge';
import { ProcedureService } from '../../services/procedure.service';
import { Procedure, ProcedureAudit, ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';

@Component({
  selector: 'app-procedure-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    DashboardHeaderComponent, ProcedureStepperComponent, ProcedureInfoCardComponent,
    ProcedureActionsComponent, ProcedureAuditTimelineComponent,
    ObservationsCardComponent, DocumentsCardComponent,
    StatusChangeDialogComponent, AssignInspectorDialogComponent, ObservationFormComponent,
    StatusBadgeComponent, TypeBadgeComponent,
  ],
  templateUrl: './procedure-detail.html',
  styleUrl: './procedure-detail.css',
})
export class ProcedureDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  procedure: Procedure | null = null;
  auditItems: ProcedureAudit[] = [];
  isLoading = true;
  procedureId = '';

  showStatusDialog = false;
  statusDialogAction: 'advance' | 'pickup' | 'reentry' | 'close' | 'abandon' | 'reverse-abandon' = 'advance';
  showAssignDialog = false;
  showObservationForm = false;

  ngOnInit(): void {
    this.procedureId = this.route.snapshot.paramMap.get('id') || '';
    this.loadProcedure();
  }

  loadProcedure(): void {
    this.isLoading = true;
    this.procedureService.getProcedureById(this.procedureId).subscribe({
      next: (proc) => {
        this.procedure = proc;
        this.isLoading = false;
        this.loadAudit();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAudit(): void {
    this.procedureService.getAuditHistory(this.procedureId).subscribe({
      next: (items) => {
        this.auditItems = items;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  onAction(event: ActionEvent): void {
    switch (event.action) {
      case 'advance':
        if (this.procedure?.currentStatus === ProcedureStatus.RECIBIDO) {
          this.statusDialogAction = 'advance';
        } else if (this.procedure?.currentStatus === ProcedureStatus.EN_REVISION) {
          this.statusDialogAction = 'close';
        }
        this.showStatusDialog = true;
        break;
      case 'observe':
        this.showObservationForm = true;
        break;
      case 'pickup':
        this.statusDialogAction = 'pickup';
        this.showStatusDialog = true;
        break;
      case 'reentry':
        this.statusDialogAction = 'reentry';
        this.showStatusDialog = true;
        break;
      case 'abandon':
        this.statusDialogAction = 'abandon';
        this.showStatusDialog = true;
        break;
      case 'reverse-abandon':
        this.statusDialogAction = 'reverse-abandon';
        this.showStatusDialog = true;
        break;
      case 'assign':
        this.showAssignDialog = true;
        break;
    }
  }

  onStatusChanged(): void {
    this.showStatusDialog = false;
    this.loadProcedure();
  }

  onInspectorAssigned(): void {
    this.showAssignDialog = false;
    this.loadProcedure();
  }

  onObservationCreated(): void {
    this.showObservationForm = false;
    this.loadProcedure();
  }

  get procedureTypeCode(): ProcedureTypeCode {
    return (this.procedure?.procedureType?.code as ProcedureTypeCode) || ProcedureTypeCode.RAI;
  }
}
