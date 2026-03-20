import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { Observation } from '../../../../shared/models';
import { CategoryBadgeComponent } from '../../../../shared/ui/category-badge/category-badge';
import { PriorityBadgeComponent } from '../../../../shared/ui/priority-badge/priority-badge';

@Component({
  selector: 'app-observation-item',
  standalone: true,
  imports: [CommonModule, CategoryBadgeComponent, PriorityBadgeComponent],
  template: `
    <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div class="flex-shrink-0 mt-0.5">
        @if (observation.isResolved) {
          <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } @else {
          <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        }
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-foreground">{{ observation.summary }}</p>
        @if (observation.details) {
          <p class="text-xs text-muted-foreground mt-0.5">{{ observation.details }}</p>
        }
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          @if (observation.category) {
            <app-category-badge [category]="observation.category"></app-category-badge>
          }
          @if (observation.priority) {
            <app-priority-badge [priority]="observation.priority"></app-priority-badge>
          }
          <span class="text-xs text-muted-foreground">
            {{ getIssuedByName() }}
          </span>
          <span class="text-xs text-muted-foreground">{{ (observation.issuedAt || observation.createdAt) | date:'dd/MM/yyyy' }}</span>
        </div>
        @if (observation.isResolved && observation.resolutionNote) {
          <div class="mt-2 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p class="text-xs text-emerald-700">
              <span class="font-medium">Resolución:</span> {{ observation.resolutionNote }}
            </p>
            @if (observation.resolvedBy) {
              <p class="text-xs text-emerald-600 mt-0.5">
                {{ getResolvedByName() }} · {{ observation.resolvedAt | date:'dd/MM/yyyy' }}
              </p>
            }
          </div>
        }
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        @if (!observation.isResolved && canResolve) {
          <button class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  (click)="resolve.emit(observation)">
            Resolver
          </button>
        }
        @if (observation.isResolved && canReopen) {
          <button class="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  (click)="reopen.emit(observation)">
            Reabrir
          </button>
        }
      </div>
    </div>
  `,
})
export class ObservationItemComponent {
  private readonly auth = inject(AuthService);

  @Input({ required: true }) observation!: Observation;
  @Output() resolve = new EventEmitter<Observation>();
  @Output() reopen = new EventEmitter<Observation>();

  get canResolve(): boolean {
    return this.auth.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO, UserRole.INSPECTOR]);
  }

  get canReopen(): boolean {
    return this.auth.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]);
  }

  getIssuedByName(): string {
    const ib = this.observation.issuedBy;
    if (!ib) return '';
    return (ib as any).fullName || `${(ib as any).firstName || ''} ${(ib as any).lastName || ''}`.trim();
  }

  getResolvedByName(): string {
    const rb = this.observation.resolvedBy;
    if (!rb) return '';
    return (rb as any).fullName || `${(rb as any).firstName || ''} ${(rb as any).lastName || ''}`.trim();
  }
}
