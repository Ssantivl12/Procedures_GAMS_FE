import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parsePureDate } from '../../utils/date.utils';

@Component({
  selector: 'app-deadline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (deadlineDate && daysRemaining !== null) {
      <div class="flex items-center gap-1.5 text-xs" [ngClass]="isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'">
        <!--<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          @if (isOverdue) {
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          } @else {
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
        </svg>-->
        <span>{{ displayText }}</span>
      </div>
    }
  `,
})
export class DeadlineIndicatorComponent implements OnChanges {
  @Input() deadlineDate: string | null = null;
  @Input() daysRemaining: number | null = null;
  @Input() isOverdue = false;

  displayText = '';

  ngOnChanges(): void {
    if (!this.deadlineDate || this.daysRemaining === null) {
      this.displayText = '';
      return;
    }

    const deadline = parsePureDate(this.deadlineDate);
    const formatted = deadline.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (this.daysRemaining < 0) {
      this.displayText = `Vencido hace ${Math.abs(this.daysRemaining)} día${Math.abs(this.daysRemaining) !== 1 ? 's' : ''} hábil${Math.abs(this.daysRemaining) !== 1 ? 'es' : ''} - ${formatted}`;
    } else if (this.daysRemaining === 0) {
      this.displayText = `Vence hoy - ${formatted}`;
    } else {
      this.displayText = `Quedan ${this.daysRemaining} día${this.daysRemaining !== 1 ? 's' : ''} hábil${this.daysRemaining !== 1 ? 'es' : ''} - ${formatted}`;
    }
  }
}
