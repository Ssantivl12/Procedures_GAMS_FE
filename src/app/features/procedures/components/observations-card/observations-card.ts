import { Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ObservationService } from '../../services/observation.service';
import { Observation, ObservationsGroupedByCycle, ObservationsSummary, ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';
import { ObservationItemComponent } from '../observation-item/observation-item';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-observations-card',
  standalone: true,
  imports: [CommonModule, ObservationItemComponent],
  templateUrl: './observations-card.html',
  styleUrl: './observations-card.css',
})
export class ObservationsCardComponent implements OnInit {
  private readonly observationService = inject(ObservationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) procedureId!: string;
  @Input() currentStatus: ProcedureStatus = ProcedureStatus.RECIBIDO;
  @Input() procedureTypeCode: ProcedureTypeCode = ProcedureTypeCode.RAI;

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

  loadObservations(): void {
    this.isLoading = true;
    this.observationService.getObservations(this.procedureId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // Normalize: handle both grouped and flat array responses
          if (Array.isArray(res)) {
            // Backend returned flat array — group client-side
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
