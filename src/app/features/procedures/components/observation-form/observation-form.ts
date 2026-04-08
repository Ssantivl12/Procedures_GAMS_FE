import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ObservationService } from '../../services/observation.service';
import { ObservationCategory, ObservationPriority } from '../../../../shared/models';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-observation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './observation-form.html',
  styleUrl: './observation-form.css',
})
export class ObservationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly observationService = inject(ObservationService);

  @Input({ required: true }) procedureId!: string;
  @Output() closeForm = new EventEmitter<void>();
  @Output() observationCreated = new EventEmitter<void>();

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
    summary: ['', [Validators.required, Validators.maxLength(500)]],
    details: [''],
    category: [ObservationCategory.DOCUMENTAL, Validators.required],
    priority: [ObservationPriority.MEDIA, Validators.required],
  });

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.isLoading = true;
    const val = this.form.getRawValue();
    this.observationService.createObservation(this.procedureId, {
      summary: val.summary!,
      details: val.details || undefined,
      category: val.category as ObservationCategory,
      priority: val.priority as ObservationPriority,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.observationCreated.emit();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message;
        showToast('error', Array.isArray(msg) ? msg[0] : (msg || 'Error al crear la observación'));
      },
    });
  }
}
