import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ObservationService } from '../../services/observation.service';
import { ProcedureService } from '../../services/procedure.service';
import { ObservationCategory, ObservationPriority, ProcedureCycle } from '../../../../shared/models';

@Component({
  selector: 'app-observation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './observation-form.html',
  styleUrl: './observation-form.css',
})
export class ObservationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly observationService = inject(ObservationService);
  private readonly procedureService = inject(ProcedureService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) procedureId!: string;
  @Input() activeCycleId: string | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() observationCreated = new EventEmitter<void>();

  cycles: ProcedureCycle[] = [];
  isLoading = false;
  submitted = false;

  readonly categories = Object.values(ObservationCategory);
  readonly priorities = Object.values(ObservationPriority);

  readonly categoryLabels: Record<string, string> = {
    DOCUMENTAL: 'Documental',
    TECNICA: 'Técnica',
    ADMINISTRATIVA: 'Administrativa',
    LEGAL: 'Legal',
    OTRA: 'Otra',
  };

  readonly priorityLabels: Record<string, string> = {
    ALTA: 'Alta',
    MEDIA: 'Media',
    BAJA: 'Baja',
  };

  form = this.fb.group({
    cycleId: ['', Validators.required],
    summary: ['', [Validators.required, Validators.maxLength(500)]],
    details: [''],
    category: [ObservationCategory.DOCUMENTAL, Validators.required],
    priority: [ObservationPriority.MEDIA, Validators.required],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.procedureService.getCycles(this.procedureId).subscribe({
      next: (cycles) => {
        this.cycles = cycles;
        if (this.activeCycleId) {
          this.form.patchValue({ cycleId: this.activeCycleId });
        } else {
          const activeCycle = cycles.find((c: ProcedureCycle) => !c.closedAt);
          if (activeCycle) {
            this.form.patchValue({ cycleId: activeCycle.id });
          }
        }
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.isLoading = true;
    const val = this.form.getRawValue();
    this.observationService.createObservation(this.procedureId, {
      cycleId: val.cycleId!,
      summary: val.summary!,
      details: val.details || undefined,
      category: val.category as ObservationCategory,
      priority: val.priority as ObservationPriority,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.observationCreated.emit();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
