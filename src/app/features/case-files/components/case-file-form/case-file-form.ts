import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CaseFileService } from '../../services/case-file.service';

@Component({
  selector: 'app-case-file-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeForm.emit()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        @if (showSuccess) {
          <div class="flex flex-col items-center justify-center py-8 px-6">
            <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-foreground">Expediente Creado</h3>
            <p class="text-sm text-muted-foreground mt-1">El expediente se ha registrado exitosamente.</p>
          </div>
        } @else {
          <div class="flex items-center justify-between p-6 border-b border-border">
            <h2 class="text-lg font-semibold text-foreground">Crear Expediente</h2>
            <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="closeForm.emit()">
              <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            @if (!companyId) {
              <div>
                <label class="block text-sm font-medium text-foreground mb-1.5">ID Empresa *</label>
                <input formControlName="companyId" type="text" placeholder="ID de la empresa"
                       class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                       [class.border-red-400]="submitted && f['companyId'].invalid" />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Número de Expediente Físico</label>
              <input formControlName="fileNumber" type="text" placeholder="Número de expediente físico (opcional)"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-border">
              <button type="button" (click)="closeForm.emit()"
                      class="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" [disabled]="isLoading"
                      class="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                @if (isLoading) {
                  <svg class="animate-spin w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                }
                Crear Expediente
              </button>
            </div>
          </form>
        }
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
export class CaseFileFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly caseFileService = inject(CaseFileService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() companyId: string | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() caseFileSaved = new EventEmitter<void>();

  isLoading = false;
  submitted = false;
  showSuccess = false;

  form = this.fb.group({
    companyId: ['', Validators.required],
    fileNumber: [''],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    if (this.companyId) {
      this.form.patchValue({ companyId: this.companyId });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.isLoading = true;
    const val = this.form.getRawValue();
    this.caseFileService.createCaseFile({
      companyId: val.companyId!,
      fileNumber: val.fileNumber || undefined,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => this.caseFileSaved.emit(), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
