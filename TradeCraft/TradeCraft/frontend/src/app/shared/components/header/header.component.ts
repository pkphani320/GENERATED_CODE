import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  
  userMenuItems: MenuItem[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.initUserMenu();
    });
  }

  initUserMenu() {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/settings'])
      },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => this.logout()
      }
    ];
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
