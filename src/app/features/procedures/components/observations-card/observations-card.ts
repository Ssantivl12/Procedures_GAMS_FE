import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ObservationService } from '../../services/observation.service';
import { Observation, ObservationsGroupedByCycle, ObservationsSummary, ProcedureStatus, ProcedureTypeCode } from '../../../../shared/models';
import { ObservationItemComponent } from '../observation-item/observation-item';

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
    this.observationService.getObservations(this.procedureId).subscribe({
      next: (res: any) => {
        // Normalize: handle both grouped and flat array responses
        if (Array.isArray(res)) {
          // Backend returned flat array — group client-side
          this.groupedByCycle = [];
          this.summary = { total: res.length, pending: 0, resolved: 0 };
        } else {
          const grouped = res?.groupedByCycle || res?.grouped_by_cycle || [];
          this.groupedByCycle = Array.isArray(grouped) ? grouped : [];
          const sum = res?.observationsSummary || res?.observations_summary || res?.summary;
          this.summary = sum || { total: 0, pending: 0, resolved: 0 };
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.groupedByCycle = [];
        this.summary = { total: 0, pending: 0, resolved: 0 };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onResolve(obs: Observation): void {
    this.observationService.resolveObservation(this.procedureId, obs.id).subscribe({
      next: () => this.loadObservations(),
    });
  }

  onReopen(obs: Observation): void {
    this.observationService.reopenObservation(this.procedureId, obs.id).subscribe({
      next: () => this.loadObservations(),
    });
  }
}
