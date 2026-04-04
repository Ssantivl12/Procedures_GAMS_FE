import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfigCacheService } from '../../services/config-cache.service';
import { ConfigService } from '../../services/config.service';
import { CreateNonWorkingDayDto } from '../../models/config.model';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { showToast } from '../../../../shared/utils/toast.utils';

@Component({
  selector: 'app-non-working-days-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Actions Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-sm font-bold text-foreground uppercase tracking-wider tabular-nums">Días No Laborables</h3>
          <p class="text-xs text-muted-foreground mt-1">Feriados nacionales y regionales que no cuentan como días hábiles.</p>
        </div>
        
        <div class="flex items-center gap-3" *ngIf="!isReadOnly">
            <button (click)="showBulkModal = true" 
                    class="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Agregar Feriado
            </button>
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (day of nonWorkingDays(); track day.id) {
          <div class="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-primary">
                    <span class="text-[10px] font-bold uppercase leading-none">{{ day.date | date:'MMM':'UTC' }}</span>
                    <span class="text-sm font-extrabold leading-none mt-0.5">{{ day.date | date:'dd':'UTC' }}</span>
                </div>
                <div>
                   <div class="flex items-center gap-2">
                        <div class="text-sm font-bold text-foreground">{{ day.description }}</div>
                        <span class="px-1.5 py-0.5 rounded bg-muted text-[8px] font-bold uppercase tracking-widest text-muted-foreground border border-border">
                            {{ day.type }}
                        </span>
                   </div>
                   <div class="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-tight">{{ day.date | date:'EEEE, yyyy':'UTC' }}</div>
                </div>
            </div>
            
            <button *ngIf="!isReadOnly" (click)="deleteDay(day.id)"
                    class="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-3.5a2.25 2.25 0 00-2.25 2.25v2.25m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
        } @empty {
            <div class="col-span-full py-20 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h4 class="text-sm font-bold text-foreground">No hay días no laborables</h4>
                <p class="text-xs text-muted-foreground mt-1">Agrega feriados para que el sistema calcule los plazos correctamente.</p>
            </div>
        }
      </div>

      <!-- Bulk Modal -->
      <div *ngIf="showBulkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="closeModal()">
        <div class="bg-card w-full max-w-2xl rounded-3xl border border-border overflow-hidden shadow-2xl animate-scale-up" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 class="text-lg font-bold text-foreground">Carga Masiva de Feriados</h3>
                <button (click)="closeModal()" class="cursor-pointer p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div *ngIf="errorMessage()" class="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-3 animate-shake">
                    <svg class="w-5 h-5 text-destructive shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p class="text-xs text-destructive font-bold">{{ errorMessage() }}</p>
                </div>

                <div class="space-y-3">
                    @for (row of bulkRows; track $index) {
                        <div class="flex gap-2 items-start animate-fade-in">
                            <input type="date" [(ngModel)]="row.date" 
                                   class="cursor-pointer flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <input type="text" [(ngModel)]="row.description" placeholder="Descripción (ej: Año Nuevo)"
                                   class="flex-[2] px-3 py-2 text-xs font-medium rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <select [(ngModel)]="row.type" 
                                    class="cursor-pointer flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                <option value="NACIONAL">NACIONAL</option>
                                <option value="DEPARTAMENTAL">DEPARTAMENTAL</option>
                                <option value="MUNICIPAL">MUNICIPAL</option>
                            </select>
                            <button (click)="removeBulkRow($index)" class="cursor-pointer p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    }
                </div>
                
                <button (click)="addBulkRow()" class="cursor-pointer w-full py-3 border-2 border-dashed border-border rounded-2xl text-xs font-bold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Agregar otra fila
                </button>
            </div>

            <div class="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button (click)="closeModal()" class="cursor-pointer px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">Cancelar</button>
                <button (click)="submitBulk()" [disabled]="isSubmitting || !hasValidRows"
                        class="cursor-pointer px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-all">
                    <span *ngIf="isSubmitting" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    {{ isSubmitting ? 'Procesando...' : 'Confirmar Carga' }}
                </button>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
  `]
})
export class NonWorkingDaysConfigComponent {
  private readonly configCache = inject(ConfigCacheService);
  private readonly configService = inject(ConfigService);
  
  @Input() isReadOnly = false;
  
  readonly nonWorkingDays = this.configCache.nonWorkingDays;
  showBulkModal = false;
  isSubmitting = false;
  errorMessage = signal<string | null>(null);

  bulkRows: { date: string, description: string, type: string }[] = [
    { date: '', description: '', type: 'NACIONAL' }
  ];

  get hasValidRows() {
    return this.bulkRows.some(r => r.date && r.description);
  }

  addBulkRow() {
    this.bulkRows.push({ date: '', description: '', type: 'NACIONAL' });
  }

  removeBulkRow(index: number) {
    if (this.bulkRows.length > 1) {
      this.bulkRows.splice(index, 1);
    }
  }

  closeModal() {
    if (!this.isSubmitting) {
        this.showBulkModal = false;
        this.errorMessage.set(null);
        this.bulkRows = [{ date: '', description: '', type: 'NACIONAL' }];
    }
  }

  submitBulk() {
    const validDates = this.bulkRows.filter(r => r.date && r.description);
    if (validDates.length === 0) return;

    this.isSubmitting = true;
    this.errorMessage.set(null);

    this.configService.bulkCreateNonWorkingDays({ dates: validDates })
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.configCache.refreshNonWorkingDays();
          
          if (res.skipped > 0) {
            this.errorMessage.set(`Se cargaron ${res.inserted} fechas, pero ${res.skipped} ya existían y fueron omitidas.`);
          } else {
            showToast('success', 'Feriados cargados correctamente');
            this.showBulkModal = false;
            this.bulkRows = [{ date: '', description: '', type: 'NACIONAL' }];
          }
        },
        error: (err) => {
          console.error('Error bulk uploading dates:', err);
          const msg = err.error?.message || 'Error al guardar. Verifique que las fechas sean válidas y no estén duplicadas.';
          this.errorMessage.set(msg);
        }
      });
  }

  async deleteDay(id: string) {
    const result = await Swal.fire({
      title: 'Eliminar Feriado',
      text: '¿Estás seguro de que deseas eliminar este día no laborable? No se contará en el cálculo de plazos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Eliminación',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border',
        title: 'text-lg font-bold text-foreground text-left w-full m-0 p-0 mb-1',
        htmlContainer: 'text-sm text-muted-foreground text-left w-full m-0 p-0',
        actions: 'flex items-center justify-end gap-3 w-full mt-6 p-0',
        confirmButton: 'cursor-pointer px-4 py-2 text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors',
        cancelButton: 'cursor-pointer px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors',
        icon: 'border-0 bg-destructive/10 text-destructive rounded-full w-12 h-12 m-0 mb-4 mx-auto md:mx-0 flex items-center justify-center', 
      }
    });

    if (result.isConfirmed) {
      this.configService.deleteNonWorkingDay(id).subscribe({
        next: () => {
          showToast('success', 'Día eliminado correctamente');
          this.configCache.refreshNonWorkingDays();
        },
        error: () => {
          showToast('error', 'Error al eliminar el día');
        }
      });
    }
  }
}
