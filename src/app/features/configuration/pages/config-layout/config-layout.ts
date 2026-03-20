import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlinesConfigComponent } from '../../components/deadlines-config/deadlines-config';
import { NonWorkingDaysConfigComponent } from '../../components/non-working-days-config/non-working-days-config';
import { ProcedureTypesConfigComponent } from '../../components/procedure-types-config/procedure-types-config';

@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [
    CommonModule,
    DeadlinesConfigComponent,
    NonWorkingDaysConfigComponent,
    ProcedureTypesConfigComponent,
  ],
  templateUrl: './config-layout.html',
  styleUrl: './config-layout.css',
})
export class ConfigLayoutComponent {
  activeTab: 'deadlines' | 'holidays' | 'types' = 'deadlines';
}
