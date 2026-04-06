import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { CreateCyclePayload } from '../../../../shared/models';

/**
 * Validator to ensure reviewStartDate is not before reentryDate
 */
export const dateRangeValidator = (control: AbstractControl): ValidationErrors | null => {
  const reentryDate = control.get('reentryDate')?.value;
  const reviewStartDate = control.get('reviewStartDate')?.value;

  if (reentryDate && reviewStartDate) {
    const d1 = new Date(reentryDate);
    const d2 = new Date(reviewStartDate);
    if (d2 < d1) {
      return { invalidDateRange: true };
    }
  }
  return null;
};

@Component({
  selector: 'app-reentry-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeDialog.emit()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </div>
             <div>
               <h2 class="text-lg font-bold text-foreground">Registrar Reingreso</h2>
               <p class="text-xs text-muted-foreground">Inicia un nuevo ciclo de revisión</p>
             </div>
          </div>
          <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="closeDialog.emit()">
            <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (feedbackMessage()) {
          <div class="px-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div class="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium p-3 rounded-xl flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ feedbackMessage() }}
            </div>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Fecha Reingreso *</label>
              <div class="relative">
                <input formControlName="reentryDate" type="date"
                       class="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       [class.border-destructive]="form.get('reentryDate')?.touched && form.get('reentryDate')?.invalid" />
              </div>
              <p class="text-[10px] text-muted-foreground italic ml-1">Fecha en que se entregó el reingreso</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Inicio de Revisión *</label>
              <div class="relative">
                <input formControlName="reviewStartDate" type="date"
                       class="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       [class.border-destructive]="(form.get('reviewStartDate')?.touched && form.get('reviewStartDate')?.invalid) || form.errors?.['invalidDateRange']" />
              </div>
              <p class="text-[10px] text-muted-foreground italic ml-1">Fecha en que inicia el plazo interno</p>
            </div>
          </div>

          @if (form.errors?.['invalidDateRange'] && form.get('reviewStartDate')?.touched) {
            <p class="text-[11px] text-destructive font-medium flex items-center gap-1 ml-1 animate-in fade-in duration-200">
               <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               La fecha de inicio de revisión no puede ser anterior a la de reingreso.
            </p>
          }

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nota (Opcional)</label>
            <textarea formControlName="note" rows="3" placeholder="Agregue información relevante sobre este reingreso..."
                      class="w-full px-4 py-3 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" (click)="closeDialog.emit()"
                    class="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-all active:scale-95">
              Cancelar
            </button>
            <button type="submit" [disabled]="form.invalid || isLoading"
                    class="px-6 py-2.5 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center gap-2">
              @if (isLoading) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Procesando...
              } @else {
                Registrar Reingreso
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ReentryDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) procedureId!: string;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() reentryCompleted = new EventEmitter<void>();

  isLoading = false;
  feedbackMessage = signal<string | null>(null);

  form = this.fb.group({
    reentryDate: ['', [Validators.required]],
    reviewStartDate: ['', [Validators.required]],
    note: [''],
  }, { validators: [dateRangeValidator] });

  ngOnInit(): void {
    // Default dates to today
    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({
      reentryDate: today,
      reviewStartDate: today
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const val = this.form.getRawValue();
    const payload: CreateCyclePayload = {
      reentryDate: val.reentryDate!,
      reviewStartDate: val.reviewStartDate!,
      autoTransition: true,
      note: val.note || undefined,
    };

    this.procedureService.createCycle(this.procedureId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.reentryCompleted.emit();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422) {
          this.feedbackMessage.set(err.error?.message || 'Error: Los datos ingresados para el reingreso no son válidos.');
        } else {
          this.feedbackMessage.set('Ocurrió un error inesperado al registrar el reingreso.');
        }
        this.cdr.detectChanges();
        setTimeout(() => this.feedbackMessage.set(null), 5000);
      },
    });
  }
}
