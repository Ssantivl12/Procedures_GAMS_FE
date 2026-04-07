import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigCacheService } from '../../services/config-cache.service';
import { ConfigService } from '../../services/config.service';
import { DeadlineConfig } from '../../models/config.model';
import { finalize } from 'rxjs';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-deadlines-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-card rounded-2xl border border-border overflow-hidden shadow-sm animate-fade-in">
      <div class="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
        <div>
          <h3 class="text-sm font-bold text-foreground uppercase tracking-wider tabular-nums">Configuración de Plazos</h3>
          <p class="text-xs text-muted-foreground mt-1">Define los días hábiles para cada ciclo de revisión.</p>
        </div>
        <div *ngIf="isUpdating()" class="flex items-center gap-2 text-primary animate-pulse">
            <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            <span class="text-xs font-bold uppercase tracking-wider">Guardando...</span>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
              <th class="px-6 py-4">Trámite</th>
              <th class="px-6 py-4 text-center">
                Ciclo / Etapa
                <div class="text-[9px] normal-case tracking-normal font-normal text-muted-foreground/70 mt-0.5">
                  (0 = 1ª Revisión · 1+ = Reingresos)
                </div>
              </th>
              <th class="px-6 py-4 text-center">Días Hábiles</th>
              <th class="px-6 py-4 text-right pr-10" *ngIf="!isReadOnly">Edición Directa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (config of deadlineConfigs(); track config.id) {
              <tr class="hover:bg-muted/20 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-foreground uppercase tracking-wider">{{ config.procedureType }}</span>
                    <span class="text-[10px] text-muted-foreground line-clamp-1 italic">{{ config.description || 'Sin descripción' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-[10px] font-bold px-2 py-1 rounded-full border" 
                        [class]="config.cycleNumber === 0 ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-amber-100 text-amber-700 border-amber-200'">
                    {{ config.cycleNumber === 0 ? 'Primera Revisión' : 'Reingresos' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="text-sm font-mono font-bold">{{ config.deadlineDays }} d</span>
                </td>
                <td class="px-6 py-4 text-right pr-10" *ngIf="!isReadOnly">
                    <div class="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity" 
                         [class.opacity-30]="!isSuperAdmin">
                        <input type="number" 
                               [(ngModel)]="config.deadlineDays" 
                               (blur)="updateDays(config)"
                               (keyup.enter)="updateDays(config)"
                               min="1" max="90"
                               [disabled]="isReadOnly || isUpdating()"
                               class="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        <span class="text-[10px] text-muted-foreground font-medium italic">hábiles</span>
                    </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class DeadlinesConfigComponent implements OnInit {
  private readonly configCache = inject(ConfigCacheService);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);
  
  @Input() isReadOnly = false;
  
  readonly deadlineConfigs = this.configCache.deadlineConfigs;
  readonly isUpdating = signal(false);
  
  isSuperAdmin = false;
  private originalValues = new Map<number, number>();

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.hasRole([UserRole.SUPERADMIN]);
    
    // Initialize original values for change detection
    const configs = this.deadlineConfigs();
    if (configs) {
      configs.forEach(c => this.originalValues.set(c.id, c.deadlineDays));
    }
  }

  updateDays(config: DeadlineConfig) {
    if (this.isReadOnly || this.isUpdating()) return;
    
    const newValue = config.deadlineDays;
    const originalValue = this.originalValues.get(config.id) ?? config.deadlineDays;

    if (newValue === originalValue) return;

    this.isUpdating.set(true);

    this.configService.updateDeadlineConfig({ 
      procedureType: config.procedureType,
      cycleNumber: Number(config.cycleNumber),
      deadlineDays: Number(newValue),
      description: config.description || undefined
    }).pipe(
      finalize(() => {
        this.isUpdating.set(false);
      })
    ).subscribe({
      next: () => {
        this.originalValues.set(config.id, newValue);
        showToast('success', 'Plazo actualizado correctamente');
        this.configCache.refreshDeadlineConfigs();
      },
      error: (err) => {
        console.error('Error updating deadline:', err);
        config.deadlineDays = originalValue; // Revert
        showToast('error', 'Error al actualizar el plazo');
      }
    });
  }
}
