import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  adminMenuItems: MenuItem[] = [];
  systemStats: any = null;
  statsLoading: boolean = true;
  
  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.initAdminMenu();
    this.loadSystemStats();
  }

  initAdminMenu() {
    this.adminMenuItems = [
      {
        label: 'User Management',
        icon: 'pi pi-users',
        routerLink: ['/admin/users']
      },
      {
        label: 'Organization Management',
        icon: 'pi pi-building',
        routerLink: ['/admin/organizations']
      },
      {
        label: 'Audit Logs',
        icon: 'pi pi-list',
        routerLink: ['/admin/audit-logs']
      }
    ];
  }

  loadSystemStats() {
    this.statsLoading = true;
    
    this.adminService.getSystemStats().subscribe({
      next: (data) => {
        this.systemStats = data;
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load system stats', error);
        this.statsLoading = false;
      }
    });
  }
}
