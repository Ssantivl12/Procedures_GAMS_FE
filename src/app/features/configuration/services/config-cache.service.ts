import { Injectable, inject, signal, computed } from '@angular/core';
import { ConfigService } from './config.service';
import { ProcedureType, DeadlineConfig, NonWorkingDay } from '../models/config.model';
import { forkJoin, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigCacheService {
  private readonly configService = inject(ConfigService);

  // Private signals for write access
  private readonly _procedureTypes = signal<ProcedureType[]>([]);
  private readonly _deadlineConfigs = signal<DeadlineConfig[]>([]);
  private readonly _nonWorkingDays = signal<NonWorkingDay[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isLoaded = signal<boolean>(false);

  // Public readonly accessors
  readonly procedureTypes = this._procedureTypes.asReadonly();
  readonly deadlineConfigs = this._deadlineConfigs.asReadonly();
  readonly nonWorkingDays = this._nonWorkingDays.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();

  // Helper selectors
  readonly procedureTypesMap = computed(() => {
    const map = new Map<string, ProcedureType>();
    this.procedureTypes().forEach(pt => map.set(pt.id, pt));
    return map;
  });

  loadInitialConfig(): void {
    if (this._isLoaded() || this._isLoading()) return;

    this._isLoading.set(true);

    forkJoin({
      procedureTypes: this.configService.getProcedureTypes(),
      deadlineConfigs: this.configService.getDeadlineConfigs(),
      nonWorkingDays: this.configService.getNonWorkingDays()
    }).pipe(
      finalize(() => this._isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this._procedureTypes.set(res.procedureTypes);
        this._deadlineConfigs.set(res.deadlineConfigs);
        this._nonWorkingDays.set(res.nonWorkingDays);
        this._isLoaded.set(true);
      },
      error: (err) => {
        console.error('Error loading initial configuration:', err);
        this._isLoaded.set(false);
      }
    });
  }

  // Refresh methods for individual parts if needed
  refreshNonWorkingDays(): void {
    this.configService.getNonWorkingDays().subscribe(days => {
      this._nonWorkingDays.set(days);
    });
  }

  refreshDeadlineConfigs(): void {
    this.configService.getDeadlineConfigs().subscribe(configs => {
      this._deadlineConfigs.set(configs);
    });
  }
}
