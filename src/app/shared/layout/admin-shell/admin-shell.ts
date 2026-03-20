import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from '../../../features/dashboard/components/dashboard-sidebar/dashboard-sidebar';
import { ConfigCacheService } from '../../../features/configuration/services/config-cache.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardSidebarComponent],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShellComponent implements OnInit {
  private readonly configCache = inject(ConfigCacheService);
  
  isSidebarOpen = false;
  isSidebarCollapsed = false;

  ngOnInit(): void {
    this.configCache.loadInitialConfig();
  }
}

