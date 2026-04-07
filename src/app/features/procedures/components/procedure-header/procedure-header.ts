import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-procedure-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Gestión de Trámites</h1>
        <p class="text-sm text-muted-foreground mt-1">Seguimiento y gestión de trámites ambientales</p>
      </div>
      <button
        class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        (click)="addProcedure.emit()">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nuevo Trámite
      </button>
    </div>
  `,
})
export class ProcedureHeaderComponent {
  @Output() addProcedure = new EventEmitter<void>();
}
