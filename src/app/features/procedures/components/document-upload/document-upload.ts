import { Component, EventEmitter, Input, Output, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentService } from '../../services/document.service';
import { DocumentGroup } from '../../../../shared/models';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css',
})
export class DocumentUploadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) procedureId!: string;
  @Input() cycleId: string | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  isLoading = false;
  submitted = false;
  error = '';

  readonly docGroups = Object.values(DocumentGroup);
  readonly docGroupLabels: Record<string, string> = {
    INGRESO: 'Ingreso',
    ANEXO: 'Anexo',
    ACTA: 'Acta',
    INFORME: 'Informe',
    OBSERVACIONES: 'Observaciones',
    REINGRESO: 'Reingreso',
    RESULTADO_FINAL: 'Resultado Final',
    OTRO: 'Otro',
  };

  form = this.fb.group({
    docGroup: [DocumentGroup.INGRESO, Validators.required],
    description: [''],
  });

  get f() { return this.form.controls; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.error = 'Solo se permiten archivos PDF.';
      this.selectedFile = null;
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.error = 'El archivo no puede superar 20 MB.';
      this.selectedFile = null;
      return;
    }

    this.error = '';
    this.selectedFile = file;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || !this.selectedFile) {
      if (!this.selectedFile) this.error = 'Seleccione un archivo PDF.';
      return;
    }

    this.isLoading = true;
    const val = this.form.getRawValue();
    this.documentService.uploadDocument(
      this.procedureId,
      this.selectedFile,
      val.docGroup as DocumentGroup,
      this.cycleId || undefined,
      val.description || undefined,
    ).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.isLoading = false;
        showToast('success', 'Documento subido con éxito');
        this.uploaded.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Error al subir el documento.';
        showToast('error', this.error);
        this.cdr.detectChanges();
      },
    });
  }
}
