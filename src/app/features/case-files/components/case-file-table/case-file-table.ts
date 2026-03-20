import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CaseFileService } from '../../services/case-file.service';
import { CaseFile } from '../../../../shared/models';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-case-file-table',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      @if (isLoading) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="ml-2 text-sm text-muted-foreground">Cargando expedientes...</span>
        </div>
      } @else if (caseFiles.length === 0) {
        <app-empty-state title="Sin expedientes" message="No se encontraron expedientes."></app-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th class="px-6 py-4 text-left font-semibold">Código</th>
                <th class="px-6 py-4 text-left font-semibold">Empresa</th>
                <th class="px-6 py-4 text-left font-semibold">Nro. Expediente</th>
                <th class="px-6 py-4 text-left font-semibold">Fecha Apertura</th>
                <th class="px-6 py-4 text-left font-semibold">Estado</th>
                <th class="px-6 py-4 text-left font-semibold">Trámites</th>
                <th class="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (cf of caseFiles; track cf.id) {
                <tr class="hover:bg-muted/30 transition-colors group">
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-foreground">{{ cf.code || '—' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-foreground">{{ cf.company?.legalName || '—' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-muted-foreground">{{ cf.fileNumber || '—' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-muted-foreground">{{ cf.openedAt | date:'dd/MM/yyyy' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="cf.closedAt ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'">
                      {{ cf.closedAt ? 'Cerrado' : 'Abierto' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-muted-foreground">{{ cf._count?.procedures || 0 }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    @if (cf.company) {
                      <a [routerLink]="['/companies', cf.companyId]"
                         class="text-sm text-primary hover:text-primary/80 font-medium transition-colors opacity-0 group-hover:opacity-100">
                        Ver Empresa
                      </a>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-between text-sm">
          <span class="text-muted-foreground">{{ caseFiles.length }} de {{ totalItems }} expedientes</span>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)">
              Anterior
            </button>
            <span class="text-muted-foreground">{{ currentPage }} / {{ totalPages }}</span>
            <button
              class="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)">
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CaseFileTableComponent implements OnInit, OnChanges {
  private readonly caseFileService = inject(CaseFileService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() searchQuery = '';
  @Input() pageSize = 10;

  caseFiles: CaseFile[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.loadCaseFiles();
  }

  ngOnChanges(): void {
    this.currentPage = 1;
    this.loadCaseFiles();
  }

  loadCaseFiles(): void {
    this.isLoading = true;
    const params: Record<string, string | number | boolean> = {
      page: this.currentPage,
      limit: this.pageSize,
    };
    if (this.searchQuery) params['search'] = this.searchQuery;

    this.caseFileService.getCaseFiles(params).subscribe({
      next: (res) => {
        this.caseFiles = res.data;
        this.totalPages = res.meta.totalPages;
        this.totalItems = res.meta.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadCaseFiles();
  }

  refresh(): void {
    this.loadCaseFiles();
  }
}
