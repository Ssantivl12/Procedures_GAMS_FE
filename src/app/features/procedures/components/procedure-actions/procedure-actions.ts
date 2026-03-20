import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/auth/auth.service';
import { ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';

export interface ActionEvent {
  action: 'advance' | 'observe' | 'pickup' | 'reentry' | 'close' | 'abandon' | 'reverse-abandon' | 'assign';
}

@Component({
  selector: 'app-procedure-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 class="text-sm font-semibold text-foreground mb-4">Acciones Rápidas</h3>
      <div class="space-y-2">

        @if (canAdvance) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  (click)="actionClick.emit({ action: 'advance' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.69zM12.75 8.689c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.69z" />
            </svg>
            {{ advanceLabel }}
          </button>
        }

        @if (canObserve) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-300 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
                  (click)="actionClick.emit({ action: 'observe' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Emitir Observación
          </button>
        }

        @if (canPickup) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-purple-300 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
                  (click)="actionClick.emit({ action: 'pickup' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
            </svg>
            Registrar Recojo
          </button>
        }

        @if (canReentry) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
                  (click)="actionClick.emit({ action: 'reentry' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Registrar Reingreso
          </button>
        }

        @if (canAssign) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  (click)="actionClick.emit({ action: 'assign' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Asignar Inspector
          </button>
        }

        @if (canAbandon) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-700 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors mt-4"
                  (click)="actionClick.emit({ action: 'abandon' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Marcar Abandonado
          </button>
        }

        @if (canReverseAbandon) {
          <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
                  (click)="actionClick.emit({ action: 'reverse-abandon' })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Revertir Abandono
          </button>
        }
      </div>
    </div>
  `,
})
export class ProcedureActionsComponent {
  private readonly auth = inject(AuthService);

  @Input({ required: true }) currentStatus!: ProcedureStatus;
  @Input() procedureTypeCode: ProcedureTypeCode = ProcedureTypeCode.RAI;
  @Output() actionClick = new EventEmitter<ActionEvent>();

  get isSuperadminOrEncargado(): boolean {
    return this.auth.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]);
  }

  get isInspector(): boolean {
    return this.auth.hasRole(UserRole.INSPECTOR);
  }

  get isSecretaria(): boolean {
    return this.auth.hasRole(UserRole.SECRETARIA);
  }

  get canAdvance(): boolean {
    if (this.currentStatus === ProcedureStatus.RECIBIDO) {
      return this.isSuperadminOrEncargado || this.isInspector;
    }
    if (this.currentStatus === ProcedureStatus.EN_REVISION) {
      return this.isSuperadminOrEncargado || this.isInspector;
    }
    return false;
  }

  get advanceLabel(): string {
    if (this.currentStatus === ProcedureStatus.RECIBIDO) return 'Iniciar Revisión';
    if (this.currentStatus === ProcedureStatus.EN_REVISION) return 'Cerrar / Aprobar';
    return 'Avanzar';
  }

  get canObserve(): boolean {
    return this.currentStatus === ProcedureStatus.EN_REVISION
      && this.procedureTypeCode !== ProcedureTypeCode.CIERRE
      && (this.isSuperadminOrEncargado || this.isInspector);
  }

  get canPickup(): boolean {
    return this.currentStatus === ProcedureStatus.OBSERVADO_PENDIENTE_RECOJO
      && (this.isSuperadminOrEncargado || this.isSecretaria);
  }

  get canReentry(): boolean {
    return this.currentStatus === ProcedureStatus.SUBSANACION_PENDIENTE_REINGRESO
      && (this.isSuperadminOrEncargado || this.isInspector);
  }

  get canAssign(): boolean {
    return this.isSuperadminOrEncargado;
  }

  get canAbandon(): boolean {
    return this.currentStatus !== ProcedureStatus.CERRADO
      && this.currentStatus !== ProcedureStatus.ABANDONADO
      && this.isSuperadminOrEncargado;
  }

  get canReverseAbandon(): boolean {
    return this.currentStatus === ProcedureStatus.ABANDONADO && this.isSuperadminOrEncargado;
  }
}
