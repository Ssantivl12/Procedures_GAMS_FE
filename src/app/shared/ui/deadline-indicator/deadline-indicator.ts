import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deadline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (deadlineDate) {
      <div class="flex items-center gap-1.5 text-xs" [ngClass]="isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          @if (isOverdue) {
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          } @else {
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
        </svg>
        <span>{{ displayText }}</span>
      </div>
    }
  `,
})
export class DeadlineIndicatorComponent implements OnChanges {
  @Input() deadlineDate: string | null = null;
  @Input() isOverdue = false;

  displayText = '';

  ngOnChanges(): void {
    if (!this.deadlineDate) {
      this.displayText = '';
      return;
    }
    const deadline = new Date(this.deadlineDate);
    const formatted = deadline.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (this.isOverdue) {
      const diffDays = Math.ceil((new Date().getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
      this.displayText = `Vencido (${diffDays}d) - ${formatted}`;
    } else {
      const diffDays = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      this.displayText = `Vence: ${formatted} (${diffDays}d)`;
    }
  }
}
