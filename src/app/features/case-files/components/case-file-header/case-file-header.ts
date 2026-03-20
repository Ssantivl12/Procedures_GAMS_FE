import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-case-file-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Expedientes</h1>
        <p class="text-sm text-muted-foreground mt-1">Gestión de expedientes de empresas registradas</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        (click)="addCaseFile.emit()">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nuevo Expediente
      </button>
    </div>
  `,
})
export class CaseFileHeaderComponent {
  @Output() addCaseFile = new EventEmitter<void>();
}
