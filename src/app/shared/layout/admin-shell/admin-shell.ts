import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from '../../../features/dashboard/components/dashboard-sidebar/dashboard-sidebar';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardSidebarComponent],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShellComponent {
  isSidebarOpen = false;
}

