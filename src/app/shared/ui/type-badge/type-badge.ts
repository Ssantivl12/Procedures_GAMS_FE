import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcedureTypeCode } from '../../models';

const TYPE_CONFIG: Record<ProcedureTypeCode, { label: string; classes: string }> = {
  [ProcedureTypeCode.RAI]: { label: 'RAI', classes: 'bg-emerald-100 text-emerald-700' },
  [ProcedureTypeCode.MAI_PMA]: { label: 'MAI-PMA', classes: 'bg-violet-100 text-violet-700' },
  [ProcedureTypeCode.IAA]: { label: 'IAA', classes: 'bg-sky-100 text-sky-700' },
  [ProcedureTypeCode.CIERRE]: { label: 'Cierre', classes: 'bg-rose-100 text-rose-700' },
};

@Component({
  selector: 'app-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
          [ngClass]="config.classes">
      {{ config.label }}
    </span>
  `,
})
export class TypeBadgeComponent {
  @Input({ required: true }) type!: ProcedureTypeCode;

  get config() {
    return TYPE_CONFIG[this.type] ?? { label: this.type, classes: 'bg-gray-100 text-gray-700' };
  }
}
