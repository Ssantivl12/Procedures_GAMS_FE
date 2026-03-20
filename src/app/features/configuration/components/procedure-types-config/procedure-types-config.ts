import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigCacheService } from '../../services/config-cache.service';

@Component({
  selector: 'app-procedure-types-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card rounded-2xl border border-border overflow-hidden shadow-sm animate-fade-in">
      <div class="p-6 border-b border-border bg-muted/30">
        <h3 class="text-sm font-bold text-foreground uppercase tracking-wider tabular-nums">Catálogo de Tipos de Trámite</h3>
        <p class="text-xs text-muted-foreground mt-1">Definición de trámites soportados por el sistema (Solo Lectura).</p>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
              <th class="px-6 py-4">Código</th>
              <th class="px-6 py-4">Nombre</th>
              <th class="px-6 py-4">Observaciones</th>
              <th class="px-6 py-4">Reingreso</th>
              <th class="px-6 py-4">Descripción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (type of procedureTypes(); track type.id) {
              <tr class="hover:bg-muted/20 transition-colors">
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-lg">{{ type.code }}</span>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-foreground">{{ type.name }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span [class]="type.allowsObservations ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'" 
                          class="p-1 px-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ type.allowsObservations ? 'Permitido' : 'No' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="type.allowsReentry ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'" 
                        class="p-1 px-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {{ type.allowsReentry ? 'Habilitado' : 'No' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">{{ type.description || 'Sin descripción' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p class="text-sm font-medium text-foreground">No hay tipos de trámite cargados</p>
                    <p class="text-xs text-muted-foreground mt-1">La configuración inicial no se ha completado.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProcedureTypesConfigComponent {
  private readonly configCache = inject(ConfigCacheService);
  readonly procedureTypes = this.configCache.procedureTypes;
}
