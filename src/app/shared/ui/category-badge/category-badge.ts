import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationCategory } from '../../models';

const CATEGORY_CONFIG: Record<ObservationCategory, { label: string; classes: string }> = {
  [ObservationCategory.DOCUMENTAL]: { label: 'Documental', classes: 'bg-blue-100 text-blue-700' },
  [ObservationCategory.TECNICA]: { label: 'Técnica', classes: 'bg-teal-100 text-teal-700' },
  [ObservationCategory.ADMINISTRATIVA]: { label: 'Administrativa', classes: 'bg-slate-100 text-slate-700' },
  [ObservationCategory.LEGAL]: { label: 'Legal', classes: 'bg-indigo-100 text-indigo-700' },
  [ObservationCategory.OTRA]: { label: 'Otra', classes: 'bg-gray-100 text-gray-700' },
};

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          [ngClass]="config.classes">
      {{ config.label }}
    </span>
  `,
})
export class CategoryBadgeComponent {
  @Input({ required: true }) category!: ObservationCategory;

  get config() {
    return CATEGORY_CONFIG[this.category] ?? { label: this.category, classes: 'bg-gray-100 text-gray-700' };
  }
}
