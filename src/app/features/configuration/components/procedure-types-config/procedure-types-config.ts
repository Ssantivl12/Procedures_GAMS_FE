import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProcedureTypesService } from '../../services/procedure-types.service';
import { ProcedureType } from '../../../../shared/models';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-procedure-types-config',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  templateUrl: './procedure-types-config.html',
  styleUrl: './procedure-types-config.css',
})
export class ProcedureTypesConfigComponent implements OnInit {
  private readonly service = inject(ProcedureTypesService);
  private readonly cdr = inject(ChangeDetectorRef);

  types: ProcedureType[] = [];
  isLoading = true;
  isSaving = false;

  showForm = false;
  editingType: ProcedureType | null = null;
  form: Partial<ProcedureType> = {};

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.types = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openEdit(t: ProcedureType): void {
    this.editingType = t;
    this.form = {
      name: t.name,
      description: t.description,
      allowsObservations: t.allowsObservations,
      allowsReentry: t.allowsReentry,
      isActive: t.isActive,
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingType = null;
  }

  save(): void {
    if (!this.editingType) return;
    this.isSaving = true;
    this.service.update(this.editingType.id, this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.editingType = null;
        this.loadData();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
