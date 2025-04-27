import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  providers: [MessageService]
})
export class AuditLogsComponent implements OnInit {
  auditLogs: any[] = [];
  selectedLog: any = null;
  users: User[] = [];
  
  loading: boolean = true;
  filterLoading: boolean = false;
  
  // For filtering
  selectedUser: User | null = null;
  selectedAction: string | null = null;
  dateRange: Date[] | null = null;
  actionTypes: any[] = [];
  
  // For pagination
  totalRecords: number = 0;
  rows: number = 15;
  page: number = 0;
  
  columns: any[] = [];
  
  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setupColumns();
    this.loadAuditLogs();
    this.loadUsers();
    this.setupActionTypes();
  }

  setupColumns() {
    this.columns = [
      { field: 'timestamp', header: 'Timestamp' },
      { field: 'username', header: 'User' },
      { field: 'action', header: 'Action' },
      { field: 'details', header: 'Details' },
      { field: 'ip', header: 'IP Address' }
    ];
  }

  setupActionTypes() {
    this.actionTypes = [
      { name: 'All Actions', value: null },
      { name: 'Login', value: 'LOGIN' },
      { name: 'Logout', value: 'LOGOUT' },
      { name: 'Create', value: 'CREATE' },
      { name: 'Update', value: 'UPDATE' },
      { name: 'Delete', value: 'DELETE' },
      { name: 'Export', value: 'EXPORT' },
      { name: 'Import', value: 'IMPORT' }
    ];
  }

  loadAuditLogs(event?: any) {
    this.loading = true;
    
    if (event) {
      this.page = event.first / event.rows;
      this.rows = event.rows;
    }
    
    this.adminService.getAuditLogs(this.page, this.rows).subscribe({
      next: (response) => {
        this.auditLogs = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load audit logs'
        });
        this.loading = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsers(0, 1000).subscribe({
      next: (response) => {
        this.users = response.content.map((user: User) => ({
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
      }
    });
  }

  applyFilters() {
    this.filterLoading = true;
    
    if (this.selectedUser) {
      this.adminService.getAuditLogsByUser(this.selectedUser.id!, this.page, this.rows).subscribe({
        next: (response) => {
          this.auditLogs = response.content;
          this.totalRecords = response.totalElements;
          this.filterLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to filter audit logs by user'
          });
          this.filterLoading = false;
        }
      });
    } else if (this.selectedAction) {
      this.adminService.getAuditLogsByAction(this.selectedAction, this.page, this.rows).subscribe({
        next: (response) => {
          this.auditLogs = response.content;
          this.totalRecords = response.totalElements;
          this.filterLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to filter audit logs by action'
          });
          this.filterLoading = false;
        }
      });
    } else {
      // If no filters are selected, load all logs
      this.loadAuditLogs();
      this.filterLoading = false;
    }
  }

  clearFilters() {
    this.selectedUser = null;
    this.selectedAction = null;
    this.dateRange = null;
    this.loadAuditLogs();
  }

  viewLogDetails(log: any) {
    this.selectedLog = log;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
  }
}
