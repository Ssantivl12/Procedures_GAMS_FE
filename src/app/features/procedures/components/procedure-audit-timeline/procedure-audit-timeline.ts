import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcedureAudit } from '../../../../shared/models';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-procedure-audit-timeline',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm p-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-sm font-semibold text-foreground">Historial de Cambios</h3>
        <span class="text-xs text-muted-foreground">({{ auditItems?.length || 0 }})</span>
      </div>

      @if (!auditItems || auditItems.length === 0) {
        <p class="text-sm text-muted-foreground text-center py-4">Sin historial disponible.</p>
      } @else {
        <div class="relative">
          <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-border"></div>
          <div class="space-y-4">
            @for (item of auditItems; track item.id) {
              <div class="relative flex gap-4 pl-8">
                <div class="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-card"
                     [class.bg-primary]="!item.fromStatus"
                     [class.bg-blue-500]="!!item.fromStatus">
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    @if (item.fromStatus) {
                      <app-status-badge [status]="item.fromStatus"></app-status-badge>
                      <svg class="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    }
                    <app-status-badge [status]="item.toStatus"></app-status-badge>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-muted-foreground">
                      {{ getChangedByName(item) }}
                    </span>
                    <span class="text-xs text-muted-foreground">·</span>
                    <span class="text-xs text-muted-foreground">{{ item.changedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  @if (item.note) {
                    <p class="text-xs text-muted-foreground mt-1 italic bg-muted/30 px-2 py-1 rounded">{{ item.note }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ProcedureAuditTimelineComponent {
  @Input() auditItems: ProcedureAudit[] = [];

  getChangedByName(item: ProcedureAudit): string {
    const cb = item.changedBy;
    if (!cb) return 'Sistema';
    // Handle both formats: { id, fullName } or string, or legacy { id, firstName, lastName }
    if (typeof cb === 'string') return cb || 'Sistema';
    if ((cb as any).fullName) return (cb as any).fullName;
    if ((cb as any).firstName) return `${(cb as any).firstName} ${(cb as any).lastName || ''}`.trim();
    return 'Sistema';
  }
}
