import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureService } from '../../services/procedure.service';
import { ProcedureTypesService } from '../../../configuration/services/procedure-types.service';
import { ProcedureType, ProcedureKind } from '../../../../shared/models';

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
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() caseFileId: string | null = null;
  @Input() companyCategory: 'C3' | 'C4' = 'C3';
  @Output() closeForm = new EventEmitter<void>();
  @Output() procedureSaved = new EventEmitter<void>();

  procedureTypes: ProcedureType[] = [];
  isLoading = false;
  submitted = false;
  showSuccess = false;

  today = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    caseFileId: ['', Validators.required],
    procedureTypeId: [0, [Validators.required, Validators.min(1)]],
    procedureKind: [ProcedureKind.NUEVO, Validators.required],
    receptionDate: ['', Validators.required],
    routeSheetNumber: [''],
    internalFileNumber: [''],
    generalNotes: [''],
  });

  ngOnInit(): void {
    if (this.caseFileId) {
      this.form.patchValue({ caseFileId: this.caseFileId });
    }
    this.loadProcedureTypes();
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

    this.isLoading = true;
    const val = this.form.getRawValue();
    this.procedureService.createProcedure({
      caseFileId: val.caseFileId!,
      procedureTypeId: Number(val.procedureTypeId),
      procedureKind: val.procedureKind as ProcedureKind,
      receptionDate: val.receptionDate!,
      routeSheetNumber: val.routeSheetNumber || undefined,
      internalFileNumber: val.internalFileNumber || undefined,
      generalNotes: val.generalNotes || undefined,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => this.procedureSaved.emit(), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
