import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Procedure, ProcedureStatus } from '../../../../shared/models';
import { DeadlineIndicatorComponent } from '../../../../shared/ui/deadline-indicator/deadline-indicator';
import { formatPureDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-procedure-info-card',
  standalone: true,
  imports: [CommonModule, DeadlineIndicatorComponent],
  template: `
    @if (procedure) {
      <div class="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 class="text-sm font-semibold text-foreground mb-4">Detalles del Trámite</h3>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <svg class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">Fecha de Recepción</p>
              <p class="text-sm font-medium text-foreground">{{ formatPureDate(procedure.receptionDate) }}</p>
            </div>
          </div>

          @if (procedure.reviewStartDate) {
            <div class="flex items-start gap-3">
              <svg class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs text-muted-foreground">Inicio de Revisión</p>
                <p class="text-sm font-medium text-foreground">{{ formatPureDate(procedure.reviewStartDate) }}</p>
              </div>
            </div>
          }

          <div class="flex items-start gap-3">
            <svg class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">Inspector Asignado</p>
              <p class="text-sm font-medium text-foreground">
                {{ procedure.assignedInspector ? procedure.assignedInspector.firstName + ' ' + procedure.assignedInspector.lastName : 'Sin asignar' }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <svg class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">Ciclo Actual</p>
              <p class="text-sm font-medium text-foreground">Ciclo {{ procedure.cycleCount }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <svg class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">Estado Empresa</p>
              <p class="text-sm font-medium text-foreground">
                {{ procedure.companyStatus === 'OPERACION' ? 'Operación' : 
                   procedure.companyStatus === 'PROYECTO' ? 'Proyecto' : 
                   procedure.companyStatus === 'AMPLIACION' ? 'Ampliación' : 
                   procedure.companyStatus === 'DIVERSIFICACION' ? 'Diversificación' : procedure.companyStatus || '—' }}
              </p>
            </div>
          </div>

          @if (procedure.currentStatus === ProcedureStatus.RECIBIDO || procedure.currentStatus === ProcedureStatus.EN_REVISION) {
            @if (procedure.deadlineDate) {
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" [class]="procedure.isOverdue ? 'text-red-500' : 'text-muted-foreground'" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-xs text-muted-foreground">Plazo Técnico</p>
                  <app-deadline-indicator
                    [deadlineDate]="procedure.deadlineDate"
                    [daysRemaining]="procedure.daysRemaining"
                    [isOverdue]="procedure.isOverdue">
                  </app-deadline-indicator>
                </div>
              </div>
            }
          }

          @if (procedure.currentStatus === ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO) {
            @if (procedure.subsanacionDeadlineDate) {
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" [class]="procedure.isSubsanacionOverdue ? 'text-red-500' : 'text-amber-500'" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-xs text-muted-foreground">Plazo de Subsanación (empresa)</p>
                  <app-deadline-indicator
                    [deadlineDate]="procedure.subsanacionDeadlineDate"
                    [daysRemaining]="procedure.subsanacionDaysRemaining"
                    [isOverdue]="procedure.isSubsanacionOverdue">
                  </app-deadline-indicator>
                </div>
              </div>
            }
          }

          @if (procedure.generalNotes) {
            <div class="mt-4 p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground mb-1">Notas Generales</p>
              <p class="text-sm text-foreground">{{ procedure.generalNotes }}</p>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ProcedureInfoCardComponent {
  ProcedureStatus = ProcedureStatus;
  formatPureDate = formatPureDate;

  @Input() procedure: Procedure | null = null;
}
