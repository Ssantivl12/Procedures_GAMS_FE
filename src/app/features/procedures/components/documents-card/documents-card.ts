import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { ProcedureDocument, ProcedureStatus } from '../../../../shared/models';
import { DocumentItemComponent } from '../document-item/document-item';
import { DocumentUploadComponent } from '../document-upload/document-upload';

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

  @Input({ required: true }) procedureId!: string;
  @Input() currentStatus: ProcedureStatus = ProcedureStatus.RECIBIDO;

  documents: ProcedureDocument[] = [];
  isLoading = false;
  showUploadForm = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocuments(this.procedureId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onDownload(doc: ProcedureDocument): void {
    this.documentService.downloadDocument(this.procedureId, doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getDocName(doc);
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  onDelete(doc: ProcedureDocument): void {
    const name = this.getDocName(doc);
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    this.documentService.deleteDocument(this.procedureId, doc.id).subscribe({
      next: () => this.loadDocuments(),
    });
  }

  private getDocName(doc: ProcedureDocument): string {
    return (doc as any).originalFileName || (doc as any).originalName || 'documento.pdf';
  }

  onUploaded(): void {
    this.showUploadForm = false;
    this.loadDocuments();
  }
}
