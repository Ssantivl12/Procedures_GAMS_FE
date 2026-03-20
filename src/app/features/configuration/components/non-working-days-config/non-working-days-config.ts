import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NonWorkingDaysService, NonWorkingDay } from '../../services/non-working-days.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-non-working-days-config',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  templateUrl: './non-working-days-config.html',
  styleUrl: './non-working-days-config.css',
})
export class NonWorkingDaysConfigComponent implements OnInit {
  private readonly service = inject(NonWorkingDaysService);
  private readonly cdr = inject(ChangeDetectorRef);

  days: NonWorkingDay[] = [];
  isLoading = true;
  isSaving = false;

  showForm = false;
  editingId: number | null = null;
  form: Partial<NonWorkingDay> = this.emptyForm();

  filterYear: number = new Date().getFullYear();
  filterType: string = '';

  readonly dayTypes: NonWorkingDay['type'][] = ['NACIONAL', 'DEPARTAMENTAL', 'MUNICIPAL', 'OTRO'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const params: Record<string, string | number | boolean> = {};
    if (this.filterType) params['type'] = this.filterType;

    this.service.getAll(params).subscribe({
      next: (data) => {
        this.days = data
          .filter(d => new Date(d.date).getFullYear() === this.filterYear)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      NACIONAL: 'Nacional',
      DEPARTAMENTAL: 'Departamental',
      MUNICIPAL: 'Municipal',
      OTRO: 'Otro',
    };
    return labels[type] || type;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(d: NonWorkingDay): void {
    this.form = {
      date: d.date.substring(0, 10),
      name: d.name,
      type: d.type,
      isActive: d.isActive,
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
        this.loadData();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(d: NonWorkingDay): void {
    if (!confirm(`¿Eliminar "${d.name}" (${this.formatDate(d.date)})?`)) return;
    this.service.delete(d.id).subscribe({
      next: () => this.loadData(),
      error: () => {},
    });
  }

  private emptyForm(): Partial<NonWorkingDay> {
    return { date: '', name: '', type: 'NACIONAL', isActive: true };
  }
}
