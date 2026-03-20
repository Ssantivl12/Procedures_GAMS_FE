import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { UserService, User } from '../../../users/services/user.service';

@Component({
  selector: 'app-assign-inspector-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeDialog.emit()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Asignar Inspector</h2>
          <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="closeDialog.emit()">
            <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <label class="block text-sm font-medium text-foreground mb-1.5">Inspector</label>
          <select [(ngModel)]="selectedInspectorId"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Seleccionar inspector</option>
            @for (inspector of inspectors; track inspector.id) {
              <option [value]="inspector.id">{{ inspector.firstName }} {{ inspector.lastName }}</option>
            }
          </select>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeDialog.emit()"
                    class="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button [disabled]="!selectedInspectorId || isLoading"
                    (click)="onAssign()"
                    class="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              @if (isLoading) {
                <svg class="animate-spin w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              Asignar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class AssignInspectorDialogComponent implements OnInit {
  private readonly procedureService = inject(ProcedureService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) procedureId!: string;
  @Input() currentInspectorId: string | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() inspectorAssigned = new EventEmitter<void>();

  inspectors: User[] = [];
  selectedInspectorId = '';
  isLoading = false;

  ngOnInit(): void {
    this.selectedInspectorId = this.currentInspectorId || '';
    this.userService.getUsers({ roles: 'INSPECTOR' }).subscribe({
      next: (users) => {
        this.inspectors = (Array.isArray(users) ? users : (users as any).data || [])
          .filter((u: User) => u.isActive);
        this.cdr.detectChanges();
      },
    });
  }

  onAssign(): void {
    if (!this.selectedInspectorId) return;
    this.isLoading = true;
    this.procedureService.assignInspector(this.procedureId, this.selectedInspectorId).subscribe({
      next: () => {
        this.isLoading = false;
        this.inspectorAssigned.emit();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
