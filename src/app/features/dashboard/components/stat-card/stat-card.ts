import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [ngClass]="'stat-' + color">
      <div class="stat-icon-wrap">
        <svg 
          [attr.viewBox]="viewBox"
          [attr.fill]="fill"
          [attr.stroke]="stroke"
          [attr.stroke-width]="strokeWidth"
        >
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon" />
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-value">{{ value }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-radius: 16px;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .stat-icon-wrap {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon-wrap svg { width: 22px; height: 22px; }
    .stat-body { display: flex; flex-direction: column; gap: 0.15rem; }
    .stat-label { font-size: 0.8125rem; color: hsl(var(--muted-foreground)); font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: hsl(var(--foreground)); line-height: 1; }

    .stat-primary .stat-icon-wrap { background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); }
    .stat-warning .stat-icon-wrap { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .stat-danger .stat-icon-wrap { background: rgba(239,68,68,0.1); color: #ef4444; }
    .stat-success .stat-icon-wrap { background: rgba(16,185,129,0.1); color: #10b981; }
    .stat-info .stat-icon-wrap { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .stat-purple .stat-icon-wrap { background: rgba(139,92,246,0.1); color: #8b5cf6; }
  `],
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon = 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z';
  @Input() color: 'primary' | 'warning' | 'danger' | 'success' | 'info' | 'purple' = 'primary';
  @Input() viewBox: string = '0 0 24 24';
  @Input() fill: string = 'none';
  @Input() stroke: string = 'currentColor';
  @Input() strokeWidth: string = '1.5';
}
