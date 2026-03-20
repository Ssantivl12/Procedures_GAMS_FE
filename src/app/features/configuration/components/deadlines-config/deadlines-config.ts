import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { DeadlineConfigService, DeadlineConfig } from '../../services/deadline-config.service';
import { ProcedureTypesService } from '../../services/procedure-types.service';
import { ProcedureType } from '../../../../shared/models';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-deadlines-config',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  templateUrl: './deadlines-config.html',
  styleUrl: './deadlines-config.css',
})
export class DeadlinesConfigComponent implements OnInit {
  private readonly service = inject(DeadlineConfigService);
  private readonly typesService = inject(ProcedureTypesService);
  private readonly cdr = inject(ChangeDetectorRef);

  deadlines: DeadlineConfig[] = [];
  procedureTypes: ProcedureType[] = [];
  isLoading = true;
  isSaving = false;

  showForm = false;
  editingId: number | null = null;
  form: Partial<DeadlineConfig> = this.emptyForm();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.typesService.getAll().subscribe({
      next: (types) => {
        this.procedureTypes = types;
        this.loadDeadlines();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDeadlines(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.deadlines = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTypeName(typeId: number): string {
    return this.procedureTypes.find(t => t.id === typeId)?.name || `Tipo #${typeId}`;
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(d: DeadlineConfig): void {
    this.form = {
      procedureTypeId: d.procedureTypeId,
      cycleNumber: d.cycleNumber,
      reviewDays: d.reviewDays,
      subsanationDays: d.subsanationDays,
    };
    this.editingId = d.id;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  save(): void {
    this.isSaving = true;
    const obs = this.editingId
      ? this.service.update(this.editingId, this.form)
      : this.service.create(this.form);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.editingId = null;
        this.loadDeadlines();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(d: DeadlineConfig): void {
    if (!confirm(`¿Eliminar plazo de "${this.getTypeName(d.procedureTypeId)}" ciclo ${d.cycleNumber}?`)) return;
    this.service.delete(d.id).subscribe({
      next: () => this.loadDeadlines(),
      error: () => {},
    });
  }

  private emptyForm(): Partial<DeadlineConfig> {
    return { procedureTypeId: undefined, cycleNumber: 1, reviewDays: 10, subsanationDays: 10 };
  }
}
