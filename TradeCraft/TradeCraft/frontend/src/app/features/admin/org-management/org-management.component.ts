import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../../../core/services/organization.service';
import { UserService } from '../../../core/services/user.service';
import { Organization } from '../../../core/models/organization.model';
import { User } from '../../../core/models/user.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-org-management',
  templateUrl: './org-management.component.html',
  providers: [MessageService, ConfirmationService]
})
export class OrgManagementComponent implements OnInit {
  organizations: Organization[] = [];
  selectedOrganization: Organization | null = null;
  users: User[] = [];
  allUsers: User[] = [];
  availableUsers: User[] = [];
  
  organizationForm: FormGroup;
  
  organizationDialog: boolean = false;
  assignUserDialog: boolean = false;
  
  loading: boolean = true;
  usersLoading: boolean = false;
  submitting: boolean = false;
  
  // For pagination
  totalRecords: number = 0;
  rows: number = 10;
  page: number = 0;
  
  columns: any[] = [];
  userColumns: any[] = [];
  
  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.organizationForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      contactEmail: ['', Validators.email],
      contactPhone: [''],
      address: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.setupColumns();
    this.loadOrganizations();
  }

  setupColumns() {
    this.columns = [
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' },
      { field: 'contactEmail', header: 'Contact Email' },
      { field: 'active', header: 'Status' }
    ];
    
    this.userColumns = [
      { field: 'username', header: 'Username' },
      { field: 'fullName', header: 'Full Name' },
      { field: 'email', header: 'Email' },
      { field: 'roles', header: 'Roles' }
    ];
  }

  loadOrganizations(event?: any) {
    this.loading = true;
    
    if (event) {
      this.page = event.first / event.rows;
      this.rows = event.rows;
    }
    
    this.organizationService.getOrganizations(this.page, this.rows).subscribe({
      next: (response) => {
        this.organizations = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organizations'
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.organizationForm.reset({
      active: true
    });
    this.selectedOrganization = null;
    this.organizationDialog = true;
  }

  openEdit(organization: Organization) {
    this.selectedOrganization = { ...organization };
    this.organizationForm.patchValue(organization);
    this.organizationDialog = true;
  }

  confirmDelete(organization: Organization) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${organization.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteOrganization(organization);
      }
    });
  }

  deleteOrganization(organization: Organization) {
    this.organizationService.deleteOrganization(organization.id!).subscribe({
      next: () => {
        this.organizations = this.organizations.filter(o => o.id !== organization.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Organization deleted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete organization'
        });
      }
    });
  }

  saveOrganization() {
    if (this.organizationForm.invalid) {
      Object.keys(this.organizationForm.controls).forEach(key => {
        this.organizationForm.get(key)?.markAsDirty();
      });
      return;
    }
    
    this.submitting = true;
    const organization = this.organizationForm.value;
    
    if (organization.id) {
      // Update existing organization
      this.organizationService.updateOrganization(organization).subscribe({
        next: (updatedOrg) => {
          const index = this.organizations.findIndex(o => o.id === updatedOrg.id);
          if (index !== -1) {
            this.organizations[index] = updatedOrg;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Organization updated successfully'
          });
          
          this.organizationDialog = false;
          this.submitting = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update organization'
          });
          this.submitting = false;
        }
      });
    } else {
      // Create new organization
      this.organizationService.createOrganization(organization).subscribe({
        next: (newOrg) => {
          this.organizations.unshift(newOrg);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Organization created successfully'
          });
          
          this.organizationDialog = false;
          this.submitting = false;
          this.loadOrganizations(); // Reload to get correct pagination
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create organization'
          });
          this.submitting = false;
        }
      });
    }
  }

  viewUsers(organization: Organization) {
    this.selectedOrganization = organization;
    this.usersLoading = true;
    
    this.userService.getUsersByOrganization(organization.id!).subscribe({
      next: (response) => {
        this.users = response.map((user: User) => ({
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
        this.usersLoading = false;
        
        // Load all users for assignment
        this.loadAllUsers();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organization users'
        });
        this.usersLoading = false;
      }
    });
  }

  loadAllUsers() {
    this.userService.getUsers(0, 1000).subscribe({
      next: (response) => {
        this.allUsers = response.content.map((user: User) => ({
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
        
        // Filter out users already in the organization
        this.updateAvailableUsers();
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

  updateAvailableUsers() {
    const currentUserIds = this.users.map(u => u.id);
    this.availableUsers = this.allUsers.filter(u => !currentUserIds.includes(u.id));
  }

  openAssignUserDialog() {
    this.assignUserDialog = true;
  }

  assignUser(userId: number) {
    if (!this.selectedOrganization) return;
    
    this.organizationService.assignUserToOrganization(userId, this.selectedOrganization.id!).subscribe({
      next: () => {
        const user = this.availableUsers.find(u => u.id === userId);
        if (user) {
          this.users.push(user);
          this.updateAvailableUsers();
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User assigned to organization successfully'
        });
        
        this.assignUserDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to assign user to organization'
        });
      }
    });
  }

  confirmRemoveUser(user: User) {
    if (!this.selectedOrganization) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${user.username} from ${this.selectedOrganization.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.removeUser(user);
      }
    });
  }

  removeUser(user: User) {
    if (!this.selectedOrganization) return;
    
    this.organizationService.removeUserFromOrganization(user.id!, this.selectedOrganization.id!).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.allUsers.push(user);
        this.updateAvailableUsers();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User removed from organization successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove user from organization'
        });
      }
    });
  }
}
