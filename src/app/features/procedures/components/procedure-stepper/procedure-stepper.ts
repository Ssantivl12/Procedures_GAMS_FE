import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';

interface StepInfo {
  status: ProcedureStatus;
  label: string;
  shortLabel: string;
}

const STANDARD_STEPS: StepInfo[] = [
  { status: ProcedureStatus.RECIBIDO, label: 'Recibido', shortLabel: 'Recibido' },
  { status: ProcedureStatus.EN_REVISION, label: 'En Revisión', shortLabel: 'Revisión' },
  { status: ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO, label: 'Observado', shortLabel: 'Observado' },
  { status: ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO, label: 'Subsanación', shortLabel: 'Subsanación' },
  { status: ProcedureStatus.CERRADO, label: 'Cerrado', shortLabel: 'Cerrado' },
];

const CIERRE_STEPS: StepInfo[] = [
  { status: ProcedureStatus.RECIBIDO, label: 'Recibido', shortLabel: 'Recibido' },
  { status: ProcedureStatus.EN_REVISION, label: 'En Revisión', shortLabel: 'Revisión' },
  { status: ProcedureStatus.CERRADO, label: 'Cerrado', shortLabel: 'Cerrado' },
];

const STATUS_ORDER: Record<ProcedureStatus, number> = {
  [ProcedureStatus.RECIBIDO]: 0,
  [ProcedureStatus.EN_REVISION]: 1,
  [ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO]: 2,
  [ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO]: 3,
  [ProcedureStatus.CERRADO]: 4,
  [ProcedureStatus.ABANDONADO]: -1,
};

@Component({
  selector: 'app-procedure-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentStatus === ProcedureStatus.ABANDONADO) {
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <span class="text-sm font-semibold text-red-700">Trámite Abandonado</span>
          <p class="text-xs text-red-600 mt-0.5">Este trámite ha sido marcado como abandonado.</p>
        </div>
      </div>
    }

    <div class="relative flex items-center justify-between mb-6">
      <!-- Progress bar background -->
      <div class="absolute top-5 left-0 right-0 h-1 bg-border rounded-full mx-8"></div>
      <!-- Progress bar fill -->
      <div class="absolute top-5 left-0 h-1 bg-primary rounded-full mx-8 transition-all duration-500"
           [style.width.%]="progressPercent"></div>

      @for (step of steps; track step.status; let i = $index) {
        <div class="relative flex flex-col items-center z-10" [style.flex]="'1'">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300"
               [ngClass]="{
                 'bg-primary border-primary text-primary-foreground shadow-md': isStepCompleted(i) || isStepActive(i),
                 'bg-card border-border text-muted-foreground': !isStepCompleted(i) && !isStepActive(i)
               }">
            @if (isStepCompleted(i)) {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            } @else {
              {{ i + 1 }}
            }
          </div>
          <span class="mt-2 text-xs font-medium text-center max-w-[80px]"
                [ngClass]="isStepActive(i) ? 'text-primary' : 'text-muted-foreground'">
            {{ step.shortLabel }}
          </span>
        </div>
      }
    </div>
  `,
})
export class ProcedureStepperComponent implements OnChanges {
  @Input({ required: true }) currentStatus!: ProcedureStatus;
  @Input() procedureTypeCode: ProcedureTypeCode = ProcedureTypeCode.RAI;

  readonly ProcedureStatus = ProcedureStatus;
  steps: StepInfo[] = STANDARD_STEPS;
  currentStepIndex = 0;
  progressPercent = 0;

  ngOnChanges(): void {
    this.steps = this.procedureTypeCode === ProcedureTypeCode.CIERRE ? CIERRE_STEPS : STANDARD_STEPS;

    if (this.currentStatus === ProcedureStatus.ABANDONADO) {
      this.currentStepIndex = -1;
      this.progressPercent = 0;
      return;
    }

    this.currentStepIndex = this.steps.findIndex(s => s.status === this.currentStatus);
    if (this.currentStepIndex < 0) this.currentStepIndex = 0;

    const maxIndex = this.steps.length - 1;
    this.progressPercent = maxIndex > 0 ? (this.currentStepIndex / maxIndex) * 100 : 0;
  }

  isStepCompleted(index: number): boolean {
    if (this.currentStatus === ProcedureStatus.ABANDONADO) return false;
    return index < this.currentStepIndex;
  }

  isStepActive(index: number): boolean {
    if (this.currentStatus === ProcedureStatus.ABANDONADO) return false;
    return index === this.currentStepIndex;
  }
}
