import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { ProcedureDocument } from '../../../../shared/models';

@Component({
  selector: 'app-document-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
      <div class="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
        <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-foreground truncate">{{ doc.originalName }}</p>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{{ doc.docGroup }}</span>
          <span>v{{ doc.version }}</span>
          <span>{{ formatSize(doc.sizeBytes) }}</span>
          <span>{{ doc.createdAt | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Descargar"
                (click)="download.emit(doc)">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
        @if (canDelete) {
          <button class="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar"
                  (click)="deleteDoc.emit(doc)">
            <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class DocumentItemComponent {
  private readonly auth = inject(AuthService);

  @Input({ required: true }) doc!: ProcedureDocument;
  @Output() download = new EventEmitter<ProcedureDocument>();
  @Output() deleteDoc = new EventEmitter<ProcedureDocument>();

  get canDelete(): boolean {
    return this.auth.hasRole(UserRole.SUPERADMIN);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
