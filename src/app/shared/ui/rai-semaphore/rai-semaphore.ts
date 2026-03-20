import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaiStatus } from '../../models';

const SEMAPHORE_CONFIG: Record<RaiStatus, { label: string; dotClass: string; textClass: string }> = {
  [RaiStatus.VIGENTE]: { label: 'Vigente', dotClass: 'bg-emerald-500 shadow-emerald-200', textClass: 'text-emerald-700' },
  [RaiStatus.POR_VENCER]: { label: 'Por Vencer', dotClass: 'bg-yellow-400 shadow-yellow-200', textClass: 'text-yellow-700' },
  [RaiStatus.VENCIDO]: { label: 'Vencido', dotClass: 'bg-red-500 shadow-red-200', textClass: 'text-red-700' },
  [RaiStatus.SIN_RAI]: { label: 'Sin RAI', dotClass: 'bg-gray-300', textClass: 'text-gray-500' },
};

@Component({
  selector: 'app-rai-semaphore',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="inline-block w-2.5 h-2.5 rounded-full shadow-sm" [ngClass]="semaphoreConfig.dotClass"></span>
      <span class="text-xs font-medium" [ngClass]="semaphoreConfig.textClass">{{ semaphoreConfig.label }}</span>
    </div>
  `,
})
export class RaiSemaphoreComponent implements OnChanges {
  @Input() expirationDate: string | null = null;
  @Input() raiStatus: RaiStatus | null = null;

  semaphoreConfig = SEMAPHORE_CONFIG[RaiStatus.SIN_RAI];

  ngOnChanges(): void {
    if (this.raiStatus) {
      this.semaphoreConfig = SEMAPHORE_CONFIG[this.raiStatus];
      return;
    }
    if (!this.expirationDate) {
      this.semaphoreConfig = SEMAPHORE_CONFIG[RaiStatus.SIN_RAI];
      return;
    }
    const now = new Date();
    const exp = new Date(this.expirationDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      this.semaphoreConfig = SEMAPHORE_CONFIG[RaiStatus.VENCIDO];
    } else if (diffDays <= 90) {
      this.semaphoreConfig = SEMAPHORE_CONFIG[RaiStatus.POR_VENCER];
    } else {
      this.semaphoreConfig = SEMAPHORE_CONFIG[RaiStatus.VIGENTE];
    }
  }
}
