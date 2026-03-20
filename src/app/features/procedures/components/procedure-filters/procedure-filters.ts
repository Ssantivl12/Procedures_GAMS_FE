import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';

@Component({
  selector: 'app-procedure-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="relative flex-1 min-w-[200px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          [ngModel]="searchQuery"
          (ngModelChange)="search.emit($event)"
          placeholder="Buscar por empresa o hoja de ruta..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
      </div>
      <select
        [ngModel]="statusFilter"
        (ngModelChange)="statusChange.emit($event)"
        class="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option value="">Todos los estados</option>
        <option [value]="ProcedureStatus.RECIBIDO">Recibido</option>
        <option [value]="ProcedureStatus.EN_REVISION">En Revisión</option>
        <option [value]="ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO">Observado</option>
        <option [value]="ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO">Subsanación</option>
        <option [value]="ProcedureStatus.CERRADO">Cerrado</option>
        <option [value]="ProcedureStatus.ABANDONADO">Abandonado</option>
      </select>
      <select
        [ngModel]="typeFilter"
        (ngModelChange)="typeChange.emit($event)"
        class="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option value="">Todos los tipos</option>
        <option [value]="ProcedureTypeCode.RAI">RAI</option>
        <option [value]="ProcedureTypeCode.MAI_PMA">MAI-PMA</option>
        <option [value]="ProcedureTypeCode.IAA">IAA</option>
        <option [value]="ProcedureTypeCode.CIERRE">Cierre</option>
      </select>
      <select
        [ngModel]="pageSize"
        (ngModelChange)="pageSizeChange.emit($event)"
        class="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option [ngValue]="10">10 por página</option>
        <option [ngValue]="25">25 por página</option>
        <option [ngValue]="50">50 por página</option>
      </select>
      <button
        (click)="refresh.emit()"
        class="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
        title="Actualizar">
        <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
      </button>
    </div>
  `,
})
export class ProcedureFiltersComponent {
  @Input() searchQuery = '';
  @Input() statusFilter = '';
  @Input() typeFilter = '';
  @Input() pageSize = 10;
  @Output() search = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() typeChange = new EventEmitter<string>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();

  readonly ProcedureStatus = ProcedureStatus;
  readonly ProcedureTypeCode = ProcedureTypeCode;
}
