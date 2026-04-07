import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { ProcedureStatus, ProcedureTypeCode, ChangeStatusPayload } from '../../../../shared/models';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-status-change-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeDialog.emit()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">{{ dialogTitle }}</h2>
          <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="closeDialog.emit()">
            <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (feedbackMessage()) {
          <div class="px-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ feedbackMessage() }}
            </div>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          @if (action === 'advance' && currentStatus === ProcedureStatus.RECIBIDO) {
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Fecha de Inicio de Revisión</label>
              <input formControlName="reviewStartDate" type="date"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          }

          @if (action === 'pickup') {
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Fecha de Recojo de Observaciones</label>
              <input formControlName="obsPickedDate" type="date"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          }

          @if (action === 'close') {
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Fecha de Aprobación *</label>
              <input formControlName="approvalDate" type="date"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                     [class.border-red-400]="submitted && (form.get('approvalDate')?.invalid || !form.get('approvalDate')?.value)" />
              @if (submitted && !form.get('approvalDate')?.value) {
                <span class="text-xs text-red-500 mt-1 block">Este campo es requerido.</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Certificado de Aprobación *</label>
              <input formControlName="approvalCertificate" type="text" placeholder="Nro. certificado"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                     [class.border-red-400]="submitted && (form.get('approvalCertificate')?.invalid || !form.get('approvalCertificate')?.value)" />
              @if (submitted && !form.get('approvalCertificate')?.value) {
                <span class="text-xs text-red-500 mt-1 block">Este campo es requerido.</span>
              }
            </div>
            @if (procedureTypeCode === 'RAI') {
              <div>
                <label class="block text-sm font-medium text-foreground mb-1.5">Fecha de Vencimiento RAI *</label>
                <input formControlName="expirationDate" type="date"
                       class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                       [class.border-red-400]="submitted && (form.get('expirationDate')?.invalid || !form.get('expirationDate')?.value)" />
                @if (submitted && !form.get('expirationDate')?.value) {
                  <span class="text-xs text-red-500 mt-1 block">Este campo es requerido para RAI.</span>
                }
              </div>
            }
          }

          @if (action === 'abandon') {
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Motivo de Abandono *</label>
              <textarea formControlName="abandonReason" rows="3" placeholder="Indique el motivo del abandono..."
                        class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        [class.border-red-400]="submitted && (form.get('abandonReason')?.invalid || !form.get('abandonReason')?.value)"></textarea>
              @if (submitted && !form.get('abandonReason')?.value) {
                <span class="text-xs text-red-500 mt-1 block">El motivo de abandono es requerido.</span>
              }
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Nota (opcional)</label>
            <textarea formControlName="note" rows="2" placeholder="Nota adicional..."
                      class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" (click)="closeDialog.emit()"
                    class="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="isLoading"
                    class="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 block min-w-[120px]"
                    [class.bg-red-600]="action === 'abandon'"
                    [class.hover:bg-red-700]="action === 'abandon'"
                    [class.bg-primary]="action !== 'abandon'"
                    [class.hover:bg-primary/90]="action !== 'abandon'">
              @if (isLoading) {
                <svg class="animate-spin w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              {{ submitLabel }}
            </button>
          </div>
        </form>
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
export class StatusChangeDialogComponent {
  ProcedureStatus = ProcedureStatus;
  private readonly fb = inject(FormBuilder);
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) procedureId!: string;
  @Input({ required: true }) currentStatus!: ProcedureStatus;
  @Input() procedureTypeCode: ProcedureTypeCode = ProcedureTypeCode.RAI;
  @Input() action: 'advance' | 'pickup' | 'close' | 'abandon' | 'reverse-abandon' = 'advance';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<void>();

  isLoading = false;
  submitted = false;
  feedbackMessage = signal<string | null>(null);

  form = this.fb.group({
    reviewStartDate: [new Date().toISOString().split('T')[0]],
    obsPickedDate: [new Date().toISOString().split('T')[0]],
    approvalDate: [''],
    approvalCertificate: [''],
    expirationDate: [''],
    abandonReason: [''],
    note: [''],
  });

  get dialogTitle(): string {
    switch (this.action) {
      case 'advance': return this.currentStatus === ProcedureStatus.RECIBIDO ? 'Iniciar Revisión' : 'Avanzar Estado';
      case 'pickup': return 'Registrar Recojo';
      case 'close': return 'Cerrar / Aprobar Trámite';
      case 'abandon': return 'Marcar como Abandonado';
      case 'reverse-abandon': return 'Revertir Abandono';
      default: return 'Cambiar Estado';
    }
  }

  get submitLabel(): string {
    switch (this.action) {
      case 'advance': return 'Iniciar Revisión';
      case 'pickup': return 'Registrar Recojo';
      case 'close': return 'Cerrar Trámite';
      case 'abandon': return 'Confirmar Abandono';
      case 'reverse-abandon': return 'Revertir Abandono';
      default: return 'Confirmar';
    }
  }

  get targetStatus(): ProcedureStatus {
    switch (this.action) {
      case 'advance':
        return this.currentStatus === ProcedureStatus.RECIBIDO
          ? ProcedureStatus.EN_REVISION : ProcedureStatus.CERRADO;
      case 'pickup': return ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO;
      case 'close': return ProcedureStatus.CERRADO;
      case 'abandon': return ProcedureStatus.ABANDONADO;
      case 'reverse-abandon': return this.currentStatus; // Backend handles previous state
      default: return this.currentStatus;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const val = this.form.getRawValue();

    // Manual validations based on action
    if (this.action === 'close') {
      if (!val.approvalDate || !val.approvalCertificate) return;
      if (this.procedureTypeCode === ProcedureTypeCode.RAI && !val.expirationDate) return;
    }
    if (this.action === 'abandon' && !val.abandonReason) {
      return;
    }

    this.isLoading = true;
    const payload: ChangeStatusPayload = {
      toStatus: this.targetStatus,
      note: val.note || undefined,
    };

    if (val.reviewStartDate) payload.reviewStartDate = val.reviewStartDate;
    if (val.obsPickedDate) payload.obsPickedDate = val.obsPickedDate;
    if (val.approvalDate) payload.approvalDate = val.approvalDate;
    if (val.approvalCertificate) payload.approvalCertificate = val.approvalCertificate;
    if (val.expirationDate) payload.expirationDate = val.expirationDate;
    if (val.abandonReason) payload.abandonReason = val.abandonReason;

    this.procedureService.changeStatus(this.procedureId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.feedbackMessage.set(null);
        showToast('success', 'Trámite actualizado correctamente');
        this.statusChanged.emit();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error al actualizar el estado';
        showToast('error', msg);
        if (err.status === 422) {
          this.feedbackMessage.set(msg);
        } else {
          this.feedbackMessage.set('Error crítico al cambiar estado. Verifique los requisitos.');
        }
        this.cdr.detectChanges();
        // Auto-clear after 5s
        setTimeout(() => this.feedbackMessage.set(null), 5000);
      },
    });
  }
}
