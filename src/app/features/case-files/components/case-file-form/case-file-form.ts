import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CaseFileService } from '../../services/case-file.service';
import { CompanyService, Company } from '../../../companies/services/company.service';
import { CaseFile, CreateCaseFileDto, UpdateCaseFileDto } from '../../../../shared/models/case-file.model';
import { debounceTime, distinctUntilChanged, finalize, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-case-file-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="onClose()">
      <div class="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 animate-slide-up" (click)="$event.stopPropagation()">
        @if (showSuccess) {
          <div class="flex flex-col items-center justify-center py-8 px-6">
            <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-foreground">{{ isEditing ? 'Expediente Actualizado' : 'Expediente Creado' }}</h3>
            <p class="text-sm text-muted-foreground mt-1">La operación se ha realizado exitosamente.</p>
          </div>
        } @else {
          <div class="flex items-center justify-between p-6 border-b border-border">
            <h2 class="text-lg font-semibold text-foreground">{{ isEditing ? 'Editar Expediente' : 'Crear Expediente' }}</h2>
            <button class="p-1.5 rounded-lg hover:bg-muted transition-colors" (click)="onClose()">
              <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            <!-- Error Alert -->
            <div *ngIf="errorMessage" class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-shake">
                {{ errorMessage }}
            </div>

            <!-- Company Selector (Create Only) -->
            <div *ngIf="!isEditing && !companyId">
              <label class="block text-sm font-medium text-foreground mb-1.5">Empresa *</label>
              <div class="relative">
                <input type="text" [formControl]="companySearchCtrl" placeholder="Buscar empresa por nombre o NIT..."
                       class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                       [class.border-red-400]="submitted && f['companyId'].invalid" />
                
                <!-- Search Results Dropdown -->
                <div *ngIf="isSearching || foundCompanies.length > 0" 
                     class="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    <div *ngIf="isSearching" class="p-3 text-center text-xs text-muted-foreground">Buscando...</div>
                    <div *ngIf="!isSearching && foundCompanies.length === 0" class="p-3 text-center text-xs text-muted-foreground">No se encontraron empresas</div>
                    <button type="button" *ngFor="let company of foundCompanies" 
                            (click)="selectCompany(company)"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0">
                        <div class="font-medium">{{ company.legalName }}</div>
                        <div class="text-[10px] text-muted-foreground">NIT: {{ company.nit || '—' }} | RAI: {{ company.raiNumber || '—' }}</div>
                    </button>
                </div>
              </div>
              <!-- Selected Company Preview -->
              <div *ngIf="selectedCompany" class="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div class="text-xs">
                    <span class="font-bold text-primary">Seleccionado:</span> {{ selectedCompany.legalName }}
                </div>
                <button type="button" (click)="clearSelection()" class="text-muted-foreground hover:text-destructive p-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <!-- Pre-defined Company Info (if companyId provided) -->
            <div *ngIf="!isEditing && companyId" class="p-3 rounded-xl bg-muted/50 border border-border">
                <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Empresa</label>
                <div class="text-sm font-semibold">{{ preSelectedCompanyName || 'Cargando...' }}</div>
            </div>

            <!-- Code Info (Read Only for Edit) -->
            <div *ngIf="isEditing" class="p-3 rounded-xl bg-muted/50 border border-border">
                <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Código de Expediente</label>
                <div class="text-sm font-mono font-bold text-primary">{{ caseFileToEdit?.code }}</div>
            </div>

            <!-- File Number (Editable always, but special case for Edit) -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Número de Expediente Físico</label>
              <input formControlName="fileNumber" type="text" placeholder="Ej: SAC-2025-001"
                     class="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p class="text-[10px] text-muted-foreground mt-1">Corresponde a la numeración en el archivo físico (opcional).</p>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-border">
              <button type="button" (click)="onClose()"
                      class="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" [disabled]="isLoading"
                      class="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                <span *ngIf="isLoading" class="inline-block w-4 h-4 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                {{ isEditing ? 'Guardar Cambios' : 'Crear Expediente' }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
  `],
})
export class CaseFileFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly caseFileService = inject(CaseFileService);
  private readonly companyService = inject(CompanyService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() companyId: string | null = null;
  @Input() caseFileToEdit: CaseFile | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() caseFileSaved = new EventEmitter<void>();

  isLoading = false;
  submitted = false;
  showSuccess = false;
  errorMessage: string | null = null;
  
  isEditing = false;
  preSelectedCompanyName = '';
  
  // Company Search
  companySearchCtrl = this.fb.control('');
  foundCompanies: Company[] = [];
  isSearching = false;
  selectedCompany: Company | null = null;

  form = this.fb.group({
    companyId: ['', Validators.required],
    fileNumber: [''],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    if (this.caseFileToEdit) {
      this.isEditing = true;
      this.form.patchValue({
        companyId: this.caseFileToEdit.companyId,
        fileNumber: this.caseFileToEdit.fileNumber || '',
      });
      // Disable companyId for editing as it shouldn't change
      this.form.get('companyId')?.disable();
    } else {
      if (this.companyId) {
        this.form.patchValue({ companyId: this.companyId });
        this.loadPreSelectedCompany(this.companyId);
      }
      this.setupCompanySearch();
    }
  }

  private setupCompanySearch() {
    this.companySearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of({ data: [] });
        this.isSearching = true;
        this.cdr.detectChanges();
        return this.companyService.getCompanies({ search: query, limit: 5 });
      }),
      finalize(() => {
        this.isSearching = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.foundCompanies = res.data || [];
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadPreSelectedCompany(id: string) {
    this.companyService.getCompanyById(id).subscribe(c => {
      this.preSelectedCompanyName = c.legalName;
      this.cdr.detectChanges();
    });
  }

  selectCompany(company: Company) {
    this.selectedCompany = company;
    this.form.patchValue({ companyId: company.id });
    this.foundCompanies = [];
    this.companySearchCtrl.setValue('', { emitEvent: false });
    this.cdr.detectChanges();
  }

  clearSelection() {
    this.selectedCompany = null;
    this.form.patchValue({ companyId: '' });
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    if (this.form.invalid) return;

    this.isLoading = true;
    const val = this.form.getRawValue();

    if (this.isEditing && this.caseFileToEdit) {
      this.caseFileService.updateCaseFile(this.caseFileToEdit.id, {
        fileNumber: val.fileNumber!
      }).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.caseFileService.createCaseFile({
        companyId: val.companyId!,
        fileNumber: val.fileNumber || undefined,
      }).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess() {
    this.showSuccess = true;
    this.cdr.detectChanges();
    setTimeout(() => this.caseFileSaved.emit(), 1500);
  }

  private handleError(err: any) {
    this.isLoading = false;
    if (err.status === 409) {
      const msg = err.error?.message || '';
      if (msg.toLowerCase().includes('already has an active case file')) {
        this.errorMessage = 'La empresa ya tiene un expediente activo.';
      } else if (msg.toLowerCase().includes('filenumber') || msg.toLowerCase().includes('existe')) {
        this.errorMessage = 'El fileNumber proporcionado ya existe.';
      } else if (msg.toLowerCase().includes('activo')) {
          this.errorMessage = 'La empresa ya tiene un expediente activo.';
      } else {
        this.errorMessage = msg || 'Conflicto al procesar la solicitud.';
      }
    } else {
      this.errorMessage = 'Ocurrió un error inesperado. Por favor intente de nuevo.';
    }
    this.cdr.detectChanges();
  }

  onClose() {
      if (!this.isLoading) {
          this.closeForm.emit();
      }
  }
}
