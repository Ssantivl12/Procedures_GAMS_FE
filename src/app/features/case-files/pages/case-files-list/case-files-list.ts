import { Component, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { CaseFileHeaderComponent } from '../../components/case-file-header/case-file-header';
import { CaseFileFiltersComponent } from '../../components/case-file-filters/case-file-filters';
import { CaseFileTableComponent } from '../../components/case-file-table/case-file-table';
import { CaseFileFormComponent } from '../../components/case-file-form/case-file-form';
import { CaseFileService } from '../../services/case-file.service';
import { CaseFile } from '../../../../shared/models/case-file.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-case-files-list',
  standalone: true,
  imports: [
    CommonModule, DashboardHeaderComponent,
    CaseFileHeaderComponent, CaseFileFiltersComponent,
    CaseFileTableComponent, CaseFileFormComponent,
  ],
  template: `
    <div class="min-h-screen pb-12" style="background: hsl(var(--background))">
      <app-dashboard-header></app-dashboard-header>
      <main class="max-w-[1400px] mx-auto p-4 sm:p-6" style="animation: fadeIn 0.4s ease-out">
        <app-case-file-header (addCaseFile)="openCreateModal()"></app-case-file-header>
        
        <app-case-file-filters
          [pageSize]="pageSize"
          (filtersChanged)="onFiltersChanged($event)"
          (pageSizeChange)="handlePageSizeChange($event)"
          (refresh)="caseFileTable.refresh()">
        </app-case-file-filters>

        <app-case-file-table 
          [pageSize]="pageSize"
          (close)="openCloseModal($event)"
          (reopen)="openReopenModal($event)"
          (delete)="openDeleteModal($event)">
        </app-case-file-table>
      </main>

      <!-- Create/Edit Form Modal -->
      @if (isModalOpen) {
        <app-case-file-form
          [caseFileToEdit]="selectedCaseFile"
          (closeForm)="closeModal()"
          (caseFileSaved)="onCaseFileSaved()">
        </app-case-file-form>
      }

      <!-- Actions Confirmation Modals -->
      
      <!-- Close Modal -->
      @if (caseFileToClose) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border shrink-0 m-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-foreground">Cerrar Expediente</h3>
                        <p class="text-sm text-muted-foreground mt-1 text-balance">¿Estás seguro de cerrar el expediente <span class="font-semibold text-foreground">{{ caseFileToClose.code }}</span>? Esta acción evitará nuevos trámites.</p>
                    </div>
                </div>
                
                @if (actionError) {
                    <div class="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider">
                        {{ actionError }}
                    </div>
                }

                <div class="flex items-center justify-end gap-3 mt-6">
                    <button type="button" class="px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors" (click)="caseFileToClose = null; actionError = null">Cancelar</button>
                    <button type="button" class="px-4 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2" [disabled]="isProcessing" (click)="confirmClose()">
                        <span *ngIf="isProcessing" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Cerrar Expediente
                    </button>
                </div>
            </div>
        </div>
      }

      <!-- Reopen Modal -->
      @if (caseFileToReopen) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border shrink-0 m-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-foreground">Reabrir Expediente</h3>
                        <p class="text-sm text-muted-foreground mt-1">¿Deseas habilitar nuevamente el expediente <span class="font-semibold text-foreground">{{ caseFileToReopen.code }}</span>?</p>
                    </div>
                </div>
                
                <div class="flex items-center justify-end gap-3 mt-6">
                    <button type="button" class="px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors" (click)="caseFileToReopen = null">Cancelar</button>
                    <button type="button" class="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2" [disabled]="isProcessing" (click)="confirmReopen()">
                        <span *ngIf="isProcessing" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Reabrir
                    </button>
                </div>
            </div>
        </div>
      }

      <!-- Delete Modal -->
      @if (caseFileToDelete) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border shrink-0 m-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-foreground">Eliminar Expediente</h3>
                        <p class="text-sm text-muted-foreground mt-1">¿Estás seguro de eliminar el expediente <span class="font-semibold text-foreground">{{ caseFileToDelete.code }}</span>? Esta acción es irreversible.</p>
                    </div>
                </div>
                
                @if (actionError) {
                    <div class="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider">
                        {{ actionError }}
                    </div>
                }

                <div class="flex items-center justify-end gap-3 mt-6">
                    <button type="button" class="cursor-pointer px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors" (click)="caseFileToDelete = null; actionError = null">Cancelar</button>
                    <button type="button" class="cursor-pointer px-4 py-2 text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors flex items-center gap-2" [disabled]="isProcessing" (click)="confirmDelete()">
                        <span *ngIf="isProcessing" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Eliminar Permanente
                    </button>
                </div>
            </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class CaseFilesListComponent {
  private readonly caseFileService = inject(CaseFileService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  @ViewChild(CaseFileTableComponent) caseFileTable!: CaseFileTableComponent;
  
  isModalOpen = false;
  selectedCaseFile: CaseFile | null = null;
  
  caseFileToClose: CaseFile | null = null;
  caseFileToReopen: CaseFile | null = null;
  caseFileToDelete: CaseFile | null = null;
  
  isProcessing = false;
  actionError: string | null = null;
  pageSize = 10;
 
  onFiltersChanged(filters: any) {
    this.caseFileTable?.updateFilters(filters);
  }

  handlePageSizeChange(size: number) {
    this.pageSize = size;
    this.cdr.detectChanges();
  }

  openCreateModal() {
    this.selectedCaseFile = null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCaseFile = null;
  }

  onCaseFileSaved(): void {
    this.isModalOpen = false;
    this.selectedCaseFile = null;
    this.caseFileTable?.refresh();
  }

  openCloseModal(cf: CaseFile) { this.caseFileToClose = cf; this.actionError = null; }
  openReopenModal(cf: CaseFile) { this.caseFileToReopen = cf; }
  openDeleteModal(cf: CaseFile) { this.caseFileToDelete = cf; this.actionError = null; }

  confirmClose() {
    if (!this.caseFileToClose) return;
    this.isProcessing = true;
    this.actionError = null;
    
    this.caseFileService.closeCaseFile(this.caseFileToClose.id)
      .pipe(finalize(() => { this.isProcessing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.caseFileToClose = null; this.caseFileTable.refresh(); },
        error: (err) => this.handleActionError(err, 'close')
      });
  }

  confirmReopen() {
    if (!this.caseFileToReopen) return;
    this.isProcessing = true;
    this.actionError = null;
    
    this.caseFileService.reopenCaseFile(this.caseFileToReopen.id)
      .pipe(finalize(() => { this.isProcessing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.caseFileToReopen = null; this.caseFileTable.refresh(); },
        error: (err) => {
          this.actionError = err.error?.message || 'Error al reabrir el expediente. Es posible que existan conflictos con otros trámites.';
        }
      });
  }

  confirmDelete() {
    if (!this.caseFileToDelete) return;
    this.isProcessing = true;
    this.actionError = null;
    
    this.caseFileService.deleteCaseFile(this.caseFileToDelete.id)
      .pipe(finalize(() => { this.isProcessing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.caseFileToDelete = null; this.caseFileTable.refresh(); },
        error: (err) => this.handleActionError(err, 'delete')
      });
  }

  private handleActionError(err: any, type: 'close' | 'delete') {
    if (err.status === 409) {
      const msg = err.error?.message || '';
      if (type === 'close') {
          this.actionError = 'No se puede cerrar: hay trámites en estados activos.';
      } else if (type === 'delete') {
          this.actionError = 'No se puede eliminar: el expediente tiene trámites asociados.';
      } else {
          this.actionError = msg || 'Conflicto al procesar la solicitud.';
      }
    } else {
      this.actionError = 'Ocurrió un error inesperado.';
    }
  }
}
