import { Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentService } from '../../services/document.service';
import { Procedure, ProcedureDocument, ProcedureStatus } from '../../../../shared/models';
import { DocumentItemComponent } from '../document-item/document-item';
import { DocumentUploadComponent } from '../document-upload/document-upload';
import { showToast } from '../../../../shared/utils/toast.utils';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-documents-card',
  standalone: true,
  imports: [CommonModule, DocumentItemComponent, DocumentUploadComponent],
  templateUrl: './documents-card.html',
  styleUrl: './documents-card.css',
})
export class DocumentsCardComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) procedure!: Procedure;
  @Input() currentStatus: ProcedureStatus = ProcedureStatus.RECIBIDO;

  get procedureId(): string {
    return this.procedure.id;
  }

  get activeCycleId(): string | null {
    if (!this.procedure.cycles || this.procedure.cycles.length === 0) return null;
    const sorted = [...this.procedure.cycles].sort((a, b) => b.cycleNumber - a.cycleNumber);
    return sorted[0]?.id || null;
  }

  documents: ProcedureDocument[] = [];
  isLoading = false;
  showUploadForm = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocuments(this.procedureId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          this.documents = docs;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          showToast('error', 'Error al cargar los documentos');
          this.cdr.detectChanges();
        },
      });
  }

  onDownload(doc: ProcedureDocument): void {
    this.documentService.downloadDocument(this.procedureId, doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.getDocName(doc);
          a.click();
          window.URL.revokeObjectURL(url);
          showToast('success', 'Descarga iniciada');
        },
        error: () => showToast('error', 'Error al descargar el archivo'),
      });
  }

  async onDelete(doc: ProcedureDocument): Promise<void> {
    const name = this.getDocName(doc);
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el documento "${name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      width: '400px', 
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-xl border border-border bg-card text-foreground shadow-lg p-4',
        title: 'text-lg font-semibold pt-2',
        htmlContainer: 'text-sm text-muted-foreground mt-2 mb-4',
        actions: 'flex gap-3 w-full justify-center',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
      }
    });

    if (result.isConfirmed) {
      this.documentService.deleteDocument(this.procedureId, doc.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            showToast('success', 'Documento eliminado correctamente');
            this.loadDocuments(); 
          },
          error: () => showToast('error', 'Error al eliminar el documento'),
        });
    }
  }

  private getDocName(doc: ProcedureDocument): string {
    return doc.originalFileName || (doc as any).fileName || 'documento.pdf';
  }

  onUploaded(): void {
    this.showUploadForm = false;
    this.loadDocuments();
  }
}
