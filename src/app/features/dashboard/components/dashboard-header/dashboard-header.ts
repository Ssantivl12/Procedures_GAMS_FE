import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserToolbarComponent } from '../../../../shared/ui/UserToolbar';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, UserToolbarComponent],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css'
})
export class DashboardHeaderComponent {

  @Output() toggleMenu = new EventEmitter<void>();
}
