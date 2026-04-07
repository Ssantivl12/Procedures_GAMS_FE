import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, switchMap, of } from 'rxjs';
import { ProcedureService } from '../../services/procedure.service';
import { ProcedureTypesService } from '../../../configuration/services/procedure-types.service';
import { ProcedureType, ProcedureKind, CaseFile, CompanyStatus, ProcedureTypeCode } from '../../../../shared/models';
import { CaseFileService } from '../../../case-files/services/case-file.service';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './procedure-form.html',
  styleUrl: './procedure-form.css',
})
export class ProcedureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly procedureService = inject(ProcedureService);
  private readonly procedureTypesService = inject(ProcedureTypesService);
  private readonly caseFileService = inject(CaseFileService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() caseFileId: string | null = null;
  @Input() companyCategory: 'C3' | 'C4' = 'C3';
  @Output() closeForm = new EventEmitter<void>();
  @Output() procedureSaved = new EventEmitter<void>();

  procedureTypes: ProcedureType[] = [];
  companyStatuses = [
    { value: CompanyStatus.OPERACION, label: 'Operación' },
    { value: CompanyStatus.PROYECTO, label: 'Proyecto' },
    { value: CompanyStatus.AMPLIACION, label: 'Ampliación' },
    { value: CompanyStatus.DIVERSIFICACION, label: 'Diversificación' }
  ];

  isLoading = false;
  submitted = false;
  
  feedbackMessage = signal<string | null>(null);
  feedbackType = signal<'success' | 'error'>('error');

  today = new Date().toISOString().split('T')[0];

  // Case File Search
  caseFileSearchCtrl = new FormControl('');
  foundCaseFiles: CaseFile[] = [];
  isSearchingCaseFiles = false;
  selectedCaseFile: CaseFile | null = null;

  form = this.fb.group({
    caseFileId: ['', Validators.required],
    procedureTypeId: [null as number | null, [Validators.required, Validators.min(1)]],
    procedureKind: [ProcedureKind.NUEVO, Validators.required],
    companyStatus: [CompanyStatus.OPERACION, Validators.required],
    receptionDate: [this.today, Validators.required],
    routeSheetNumber: [''],
    generalNotes: [''],
  });

  ngOnInit(): void {
    if (this.caseFileId) {
      this.form.patchValue({ caseFileId: this.caseFileId });
      this.loadSelectedCaseFile(this.caseFileId);
    } else {
      this.setupCaseFileSearch();
    }
    this.loadProcedureTypes();
    this.setupProcedureTypeListener();
  }

  private setupProcedureTypeListener(): void {
    this.form.get('procedureTypeId')?.valueChanges.subscribe(typeId => {
      if (!typeId) return;
      
      const selectedType = this.procedureTypes.find(t => t.id === Number(typeId));
      if (!selectedType) return;

      const isSpecialType = selectedType.code === ProcedureTypeCode.IAA || 
                            selectedType.code === ProcedureTypeCode.CIERRE;

      if (isSpecialType) {
        this.f['procedureKind'].setValue(null);
        this.f['procedureKind'].disable();
      } else {
        this.f['procedureKind'].enable();
        if (this.f['procedureKind'].value === null) {
          this.f['procedureKind'].setValue(ProcedureKind.NUEVO);
        }
      }
      this.cdr.detectChanges();
    });
  }

  private setupCaseFileSearch(): void {
    this.caseFileSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) {
          return of({ data: [] });
        }
        this.isSearchingCaseFiles = true;
        this.cdr.detectChanges();
        return this.caseFileService.getCaseFiles({ search: query, status: 'open', limit: 5 });
      }),
    ).subscribe({
      next: (res: any) => {
        this.foundCaseFiles = res.data || [];
        this.isSearchingCaseFiles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSearchingCaseFiles = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadSelectedCaseFile(id: string): void {
    this.caseFileService.getCaseFileById(id).subscribe(cf => {
      this.selectedCaseFile = cf;
      this.cdr.detectChanges();
    });
  }

  selectCaseFile(cf: CaseFile): void {
    this.selectedCaseFile = cf;
    this.form.patchValue({ caseFileId: cf.id });
    this.foundCaseFiles = [];
    this.caseFileSearchCtrl.setValue('', { emitEvent: false });
    this.cdr.detectChanges();
  }

  clearCaseFileSelection(): void {
    this.selectedCaseFile = null;
    this.form.patchValue({ caseFileId: '' });
    this.cdr.detectChanges();
  }

  loadProcedureTypes(): void {
    this.procedureTypesService.getAll().subscribe({
      next: (types) => {
        this.procedureTypes = types.filter(t => {
          if (this.companyCategory === 'C4') {
            return t.code === 'RAI' || t.code === 'CIERRE';
          }
          return true;
        });
        this.cdr.detectChanges();
      },
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const typeId = Number(val.procedureTypeId);
    const selectedType = this.procedureTypes.find(t => t.id === typeId);
    
    if (!selectedType) return;

    // --- Business Validations ---
    const category = this.selectedCaseFile?.company?.category;
    const closedCodes = this.selectedCaseFile?.proceduresSummary?.closedProcedureCodes || [];

    // 1. Category 4: No MAI_PMA or IAA
    if (category === 'C4' && (selectedType.code === ProcedureTypeCode.MAI_PMA || selectedType.code === ProcedureTypeCode.IAA)) {
      this.showFeedback('Error: Las empresas de Categoría 4 no pueden tramitar MAI-PMA o IAA.', 'error');
      return;
    }

    // 2. MAI_PMA requires closed RAI
    if (selectedType.code === ProcedureTypeCode.MAI_PMA && !closedCodes.includes(ProcedureTypeCode.RAI)) {
      this.showFeedback('Error: Se requiere un trámite RAI cerrado (aprobado) previo para este expediente.', 'error');
      return;
    }

    // 3. IAA requires closed RAI AND closed MAI_PMA
    if (selectedType.code === ProcedureTypeCode.IAA) {
      const hasRai = closedCodes.includes(ProcedureTypeCode.RAI);
      const hasMai = closedCodes.includes(ProcedureTypeCode.MAI_PMA);
      if (!hasRai || !hasMai) {
        this.showFeedback('Error: El trámite IAA requiere que el RAI y el MAI-PMA estén cerrados (aprobados) previamente.', 'error');
        return;
      }
    }

    this.isLoading = true;
    this.procedureService.createProcedure({
      caseFileId: val.caseFileId!,
      procedureTypeId: Number(val.procedureTypeId),
      procedureKind: (val.procedureKind as ProcedureKind) || undefined,
      companyStatus: val.companyStatus as CompanyStatus,
      receptionDate: val.receptionDate!,
      routeSheetNumber: val.routeSheetNumber || undefined,
      generalNotes: val.generalNotes || undefined,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        showToast('success', 'Trámite creado exitosamente');
        this.procedureSaved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.showFeedback('Error: El trámite ya existe en este expediente o es inválido', 'error');
        } else {
          this.showFeedback('Error al crear el trámite. Verifique los datos.', 'error');
        }
        this.cdr.detectChanges();
      },
    });
  }

  private showFeedback(message: string, type: 'success' | 'error') {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    if (type === 'error') {
      setTimeout(() => this.feedbackMessage.set(null), 5000);
    }
  }
}
