import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CaseFileService } from '../../services/case-file.service';
import { CaseFile } from '../../../../shared/models';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-case-file-table',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      @if (isLoading) {
        <div class="flex items-center justify-center py-16">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span class="ml-4 text-sm font-medium text-muted-foreground">Cargando expedientes...</span>
        </div>
      } @else if (caseFiles.length === 0) {
        <app-empty-state title="Sin expedientes" message="No se encontraron expedientes con los filtros aplicados."></app-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 text-[11px] uppercase tracking-[0.1em] text-muted-foreground border-b border-border">
                <th class="px-6 py-4 text-left font-bold">Código</th>
                <th class="px-6 py-4 text-left font-bold">Empresa / RAI</th>
                <th class="px-6 py-4 text-left font-bold">Nro. Físico</th>
                <th class="px-6 py-4 text-left font-bold text-center">Trámites</th>
                <th class="px-6 py-4 text-left font-bold">Estado</th>
                <th class="px-6 py-4 text-right font-bold pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (cf of caseFiles; track cf.id) {
                <tr class="hover:bg-muted/30 transition-colors group" [class.opacity-50]="!cf.isActive">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-foreground leading-none">{{ cf.code || '—' }}</span>
                        <span class="text-[10px] text-muted-foreground mt-1 tracking-tighter">{{ cf.id.substring(0,8) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-foreground leading-tight">{{ cf.company?.legalName || '—' }}</span>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[11px] text-muted-foreground">RAI: {{ cf.company?.raiNumber || '—' }}</span>
                            @if (cf.raiStatus) {
                                <span class="w-2 h-2 rounded-full" 
                                      [class]="cf.raiStatus === 'VIGENTE' ? 'bg-emerald-500' : cf.raiStatus === 'POR_VENCER' ? 'bg-orange-500' : 'bg-red-500'"
                                      [title]="'Estado RAI: ' + cf.raiStatus"></span>
                            }
                        </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-mono bg-muted px-2 py-1 rounded border border-border">{{ cf.fileNumber || '—' }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="inline-flex flex-col items-center">
                        <div class="text-sm font-bold text-foreground">{{ cf.proceduresSummary?.active || 0 }}</div>
                        <div class="text-[10px] text-muted-foreground uppercase">de {{ cf.proceduresSummary?.total || 0 }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                          [class]="cf.closedAt ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'">
                      <span class="w-1.5 h-1.5 rounded-full" [class]="cf.closedAt ? 'bg-gray-400' : 'bg-emerald-500'"></span>
                      {{ cf.closedAt ? 'Cerrado' : 'Abierto' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right pr-6">
                    <div class="flex items-center justify-end gap-1 transition-opacity">
                      <!-- Edit (Encargado, Superadmin) -->
                      <button *ngIf="canEdit && !cf.closedAt" 
                              (click)="edit.emit(cf)"
                              class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Editar Nro. Físico">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>

                      <!-- Close (Encargado, Superadmin) -->
                      <button *ngIf="canClose && !cf.closedAt" 
                              (click)="close.emit(cf)"
                              class="p-2 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Cerrar Expediente">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </button>

                      <!-- Reopen (Superadmin only) -->
                      <button *ngIf="canReopen && cf.closedAt" 
                              (click)="reopen.emit(cf)"
                              class="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Reabrir Expediente">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      </button>

                      <!-- Delete (Superadmin only) -->
                      <button *ngIf="canDelete" 
                              (click)="delete.emit(cf)"
                              class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div class="w-px h-4 bg-border mx-1"></div>

                      <a [routerLink]="['/companies', cf.companyId]"
                         class="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all" title="Ver Empresa">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="bg-muted/30 px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Mostrando {{ caseFiles.length }} registros de {{ totalItems }}</span>
          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)">
              Anterior
            </button>
            <div class="flex items-center gap-1">
                <span class="text-foreground font-bold">{{ currentPage }}</span>
                <span class="px-1">/</span>
                <span>{{ totalPages }}</span>
            </div>
            <button
              class="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() pageSize = 10;
  
  @Output() edit = new EventEmitter<CaseFile>();
  @Output() close = new EventEmitter<CaseFile>();
  @Output() reopen = new EventEmitter<CaseFile>();
  @Output() delete = new EventEmitter<CaseFile>();

  caseFiles: CaseFile[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  currentFilters: any = {};

  canEdit = false;
  canClose = false;
  canReopen = false;
  canDelete = false;

  ngOnInit(): void {
    const roles = [UserRole.SUPERADMIN, UserRole.ENCARGADO];
    this.canEdit = this.authService.hasRole(roles);
    this.canClose = this.authService.hasRole(roles);
    this.canReopen = this.authService.hasRole([UserRole.SUPERADMIN]);
    this.canDelete = this.authService.hasRole([UserRole.SUPERADMIN]);
    
    this.loadCaseFiles();
  }

  ngOnChanges(): void {
    this.currentPage = 1;
    this.loadCaseFiles();
  }

  updateFilters(filters: any) {
      this.currentFilters = filters;
      this.currentPage = 1;
      this.loadCaseFiles();
  }

  loadCaseFiles(): void {
    this.isLoading = true;
    const params: Record<string, string | number | boolean> = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.currentFilters
    };

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
