import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, DestroyRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ObservationService } from '../../services/observation.service';
import { Observation, ObservationsGroupedByCycle, ObservationsSummary, Procedure, ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';
import { ObservationItemComponent } from '../observation-item/observation-item';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-observations-card',
  standalone: true,
  imports: [CommonModule, ObservationItemComponent],
  templateUrl: './observations-card.html',
  styleUrl: './observations-card.css',
})
export class ObservationsCardComponent implements OnInit, OnChanges, OnDestroy {
  @HostBinding('class') get hostClass() { return this.showObservations ? 'block' : 'hidden'; }

  private readonly observationService = inject(ObservationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Cancels any in-flight loadObservations call when a new one starts */
  private readonly cancelLoad$ = new Subject<void>();

  @Input({ required: true }) procedure!: Procedure;
  @Input() currentStatus: ProcedureStatus = ProcedureStatus.RECIBIDO;
  @Input() procedureTypeCode: ProcedureTypeCode = ProcedureTypeCode.RAI;

  get procedureId(): string {
    return this.procedure.id;
  }

  get activeCycleId(): string | null {
    if (!this.procedure.cycles || this.procedure.cycles.length === 0) return null;
    const sorted = [...this.procedure.cycles].sort((a, b) => b.cycleNumber - a.cycleNumber);
    return sorted[0]?.id || null;
  }

  groupedByCycle: ObservationsGroupedByCycle[] = [];
  summary: ObservationsSummary = { total: 0, pending: 0, resolved: 0 };
  isLoading = false;

  get showObservations(): boolean {
    return this.procedureTypeCode !== ProcedureTypeCode.CIERRE;
  }

  ngOnInit(): void {
    if (this.showObservations) {
      this.loadObservations();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['procedure'] && !changes['procedure'].firstChange) {
      if (this.showObservations) {
        this.loadObservations();
      }
    }
  }

  ngOnDestroy(): void {
    this.cancelLoad$.next();
    this.cancelLoad$.complete();
  }

  loadObservations(): void {
    // Cancel any previous in-flight request before starting a new one
    this.cancelLoad$.next();
    this.isLoading = true;
    this.observationService.getObservations(this.procedureId)
      .pipe(takeUntil(this.cancelLoad$))
      .subscribe({
        next: (res) => {
          // Normalize: handle both grouped and flat array responses
          if (Array.isArray(res)) {
            this.groupedByCycle = [];
            this.summary = { total: res.length, pending: 0, resolved: 0 };
          } else {
            this.groupedByCycle = res.groupedByCycle || [];
            this.summary = res.observationsSummary || { total: 0, pending: 0, resolved: 0 };
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.groupedByCycle = [];
          this.summary = { total: 0, pending: 0, resolved: 0 };
          this.isLoading = false;
          showToast('error', 'Error al cargar las observaciones');
          this.cdr.detectChanges();
        },
      });
  }

  onResolve(obs: Observation): void {
    this.observationService.resolveObservation(this.procedureId, obs.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          showToast('success', 'Observación resuelta');
          this.loadObservations();
        },
        error: () => showToast('error', 'No se pudo resolver la observación'),
      });
  }

  onReopen(obs: Observation): void {
    this.observationService.reopenObservation(this.procedureId, obs.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          showToast('success', 'Observación reabierta');
          this.loadObservations();
        },
        error: () => showToast('error', 'No se pudo reabrir la observación'),
      });
  }
}
