import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationPriority } from '../../models';

const PRIORITY_CONFIG: Record<ObservationPriority, { label: string; classes: string }> = {
  [ObservationPriority.ALTA]: { label: 'Alta', classes: 'bg-red-100 text-red-700' },
  [ObservationPriority.MEDIA]: { label: 'Media', classes: 'bg-yellow-100 text-yellow-700' },
  [ObservationPriority.BAJA]: { label: 'Baja', classes: 'bg-green-100 text-green-700' },
};

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          [ngClass]="config.classes">
      {{ config.label }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: ObservationPriority;

  get config() {
    return PRIORITY_CONFIG[this.priority] ?? { label: this.priority, classes: 'bg-gray-100 text-gray-700' };
  }
}
