import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-case-file-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="bg-card p-8 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-foreground mb-2">Detalle de Expediente</h2>
        <p class="text-sm text-muted-foreground max-w-md">
          Esta vista se encuentra en construcción. Próximamente podrá visualizar aquí toda la información detallada del expediente.
        </p>
      </div>
    </div>
  `
})
export class CaseFileDetailComponent {}
