import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { UserService, User } from '../../../users/services/user.service';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-assign-inspector-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeDialog.emit()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Asignar Inspector</h2>
          <button class="cursor-pointer p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="closeDialog.emit()">
            <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <label class="block text-sm font-medium text-foreground mb-1.5">Inspector</label>
          <select [(ngModel)]="selectedInspectorId"
                  class="cursor-pointer w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Seleccionar inspector...</option>
            @if (isLoading) {
              <option value="" disabled>Cargando inspectores...</option>
            }
            @for (inspector of inspectors; track inspector.id) {
              <option [value]="inspector.id">{{ inspector.firstName }} {{ inspector.lastName }}</option>
            }
          </select>
          @if (!isLoading && inspectors.length === 0) {
            <p class="mt-1.5 text-xs text-orange-600 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              No se encontraron inspectores activos.
            </p>
          }

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeDialog.emit()"
                    class="cursor-pointer px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button [disabled]="!selectedInspectorId || isLoading"
                    (click)="onAssign()"
                    class="cursor-pointer px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
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
    this.isLoading = true;

    this.userService.getInspectors().subscribe({
      next: (inspectors) => {
        const all = Array.isArray(inspectors) ? inspectors : [];
        this.inspectors = all.filter((u: any) => {
          const roles: string[] = Array.isArray(u.roles) ? u.roles : [];
          return roles.some(r => [
            UserRole.INSPECTOR as string,
            UserRole.ENCARGADO as string,
            UserRole.SUPERADMIN as string
          ].includes(r?.toUpperCase()));
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AssignDialog] Error fetching inspectors:', err);
        this.inspectors = [];
        this.isLoading = false;
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
