import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  @Input() visible: boolean = true;
  
  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initMenu();
  }

  initMenu() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Portfolio',
        icon: 'pi pi-briefcase',
        routerLink: '/portfolio'
      },
      {
        label: 'Risk Assessment',
        icon: 'pi pi-chart-bar',
        routerLink: '/risk'
      }
    ];

    // Add admin menu items if user has admin role
    if (this.authService.hasRole('ADMIN')) {
      this.menuItems.push({
        label: 'Administration',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'User Management',
            icon: 'pi pi-users',
            routerLink: '/admin/users'
          },
          {
            label: 'Organization Management',
            icon: 'pi pi-building',
            routerLink: '/admin/organizations'
          },
          {
            label: 'Audit Logs',
            icon: 'pi pi-list',
            routerLink: '/admin/audit-logs'
          }
        ]
      });
    }
  }
}
