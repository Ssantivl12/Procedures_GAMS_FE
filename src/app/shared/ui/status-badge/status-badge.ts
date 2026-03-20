import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcedureStatus } from '../../models';

const STATUS_CONFIG: Record<ProcedureStatus, { label: string; classes: string }> = {
  [ProcedureStatus.RECIBIDO]: { label: 'Recibido', classes: 'bg-blue-100 text-blue-700' },
  [ProcedureStatus.EN_REVISION]: { label: 'En Revisión', classes: 'bg-amber-100 text-amber-700' },
  [ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO]: { label: 'Observado - Pendiente Recojo', classes: 'bg-orange-100 text-orange-700' },
  [ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO]: { label: 'Subsanación - Pendiente Reingreso', classes: 'bg-purple-100 text-purple-700' },
  [ProcedureStatus.CERRADO]: { label: 'Cerrado', classes: 'bg-emerald-100 text-emerald-700' },
  [ProcedureStatus.ABANDONADO]: { label: 'Abandonado', classes: 'bg-red-100 text-red-700' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
          [ngClass]="config.classes">
      {{ config.label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: ProcedureStatus;

  get config() {
    return STATUS_CONFIG[this.status] ?? { label: this.status, classes: 'bg-gray-100 text-gray-700' };
  }
}
