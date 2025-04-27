import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { User } from '../../../core/models/user.model';
import { Organization } from '../../../core/models/organization.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  providers: [MessageService, ConfirmationService]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  organizations: Organization[] = [];
  roles: any[] = [
    { name: 'Admin', value: 'ADMIN' },
    { name: 'Trader', value: 'TRADER' },
    { name: 'Viewer', value: 'VIEWER' }
  ];
  
  userForm: FormGroup;
  changePasswordForm: FormGroup;
  
  userDialog: boolean = false;
  passwordDialog: boolean = false;
  
  loading: boolean = true;
  submitting: boolean = false;
  
  // For pagination
  totalRecords: number = 0;
  rows: number = 10;
  page: number = 0;
  
  columns: any[] = [];
  
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      organizationId: [null],
      roles: [[], Validators.required]
    });
    
    this.changePasswordForm = this.fb.group({
      id: [null],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit() {
    this.setupColumns();
    this.loadUsers();
    this.loadOrganizations();
  }

  setupColumns() {
    this.columns = [
      { field: 'username', header: 'Username' },
      { field: 'fullName', header: 'Full Name' },
      { field: 'email', header: 'Email' },
      { field: 'roles', header: 'Roles' },
      { field: 'organizationName', header: 'Organization' }
    ];
  }

  loadUsers(event?: any) {
    this.loading = true;
    
    if (event) {
      this.page = event.first / event.rows;
      this.rows = event.rows;
    }
    
    this.userService.getUsers(this.page, this.rows).subscribe({
      next: (response) => {
        this.users = response.content.map((user: User) => ({
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  loadOrganizations() {
    this.organizationService.getOrganizations().subscribe({
      next: (response) => {
        this.organizations = response.content;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organizations'
        });
      }
    });
  }

  openNew() {
    this.userForm.reset({
      roles: []
    });
    this.selectedUser = null;
    this.userDialog = true;
  }

  openEdit(user: User) {
    this.userService.getUserById(user.id!).subscribe({
      next: (userDetails) => {
        this.selectedUser = userDetails;
        this.userForm.patchValue({
          ...userDetails,
          password: '' // Don't show password
        });
        this.userDialog = true;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details'
        });
      }
    });
  }

  openPasswordDialog(user: User) {
    this.changePasswordForm.reset({
      id: user.id
    });
    this.passwordDialog = true;
  }

  confirmDelete(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.username}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user);
      }
    });
  }

  deleteUser(user: User) {
    this.userService.deleteUser(user.id!).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user'
        });
      }
    });
  }

  saveUser() {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsDirty();
      });
      return;
    }
    
    this.submitting = true;
    const user = this.userForm.value;
    
    if (user.id) {
      // Update existing user
      this.userService.updateUser(user).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = {
              ...updatedUser,
              fullName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim()
            };
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully'
          });
          
          this.userDialog = false;
          this.submitting = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update user'
          });
          this.submitting = false;
        }
      });
    } else {
      // Create new user
      this.userService.createUser(user).subscribe({
        next: (newUser) => {
          this.users.unshift({
            ...newUser,
            fullName: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim()
          });
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User created successfully'
          });
          
          this.userDialog = false;
          this.submitting = false;
          this.loadUsers(); // Reload to get correct pagination
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create user'
          });
          this.submitting = false;
        }
      });
    }
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      Object.keys(this.changePasswordForm.controls).forEach(key => {
        this.changePasswordForm.get(key)?.markAsDirty();
      });
      return;
    }
    
    this.submitting = true;
    const { id, currentPassword, newPassword } = this.changePasswordForm.value;
    
    this.userService.changePassword(id, currentPassword, newPassword).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully'
        });
        
        this.passwordDialog = false;
        this.submitting = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to change password'
        });
        this.submitting = false;
      }
    });
  }

  getOrganizationName(organizationId: number): string {
    const organization = this.organizations.find(org => org.id === organizationId);
    return organization ? organization.name : 'None';
  }
}
