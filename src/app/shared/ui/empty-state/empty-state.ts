import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="iconPath" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-foreground mb-1">{{ title }}</h3>
      <p class="text-sm text-muted-foreground max-w-sm">{{ message }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Sin resultados';
  @Input() message = 'No se encontraron registros.';
  @Input() iconPath = 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
}
