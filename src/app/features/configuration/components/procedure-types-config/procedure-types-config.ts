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
                      @if (type.allowsObservations) {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-3 h-3 shrink-0" fill="currentColor">
                          <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/>
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-3 h-3 shrink-0" fill="currentColor">
                          <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z"/>
                        </svg>
                      }
                      {{ type.allowsObservations ? 'Permitido' : 'No' }}
                    </span>
                  </div>
                </td>
                
                <td class="px-6 py-4">
                  <span [class]="type.allowsReentry ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'" 
                        class="p-1 px-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                    @if (type.allowsReentry) {
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-3 h-3 shrink-0" fill="currentColor">
                        <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/>
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-3 h-3 shrink-0" fill="currentColor">
                        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z"/>
                      </svg>
                    }
                    {{ type.allowsReentry ? 'Habilitado' : 'No' }}
                  </span>
                </td>
                
                <td class="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">{{ type.description || 'Sin descripción' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center">
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