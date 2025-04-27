import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { Organization } from '../../../core/models/organization.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  createOrgMode = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private messageService: MessageService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      organizationId: [null],
      organization: this.formBuilder.group({
        name: [''],
        description: ['']
      })
    });
  }

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organizationService.getOrganizations()
      .subscribe({
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

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  toggleCreateOrg() {
    this.createOrgMode = !this.createOrgMode;
    if (this.createOrgMode) {
      this.f['organizationId'].setValue(null);
      this.f['organizationId'].disable();
    } else {
      this.f['organizationId'].enable();
      this.f['organization'].get('name')?.setValue('');
      this.f['organization'].get('description')?.setValue('');
    }
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    const user = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      username: this.f['username'].value,
      password: this.f['password'].value,
      organizationId: this.createOrgMode ? null : this.f['organizationId'].value
    };

    // If creating a new organization
    if (this.createOrgMode) {
      const newOrg = {
        name: this.f['organization'].get('name')?.value,
        description: this.f['organization'].get('description')?.value
      };
      
      this.organizationService.createOrganization(newOrg)
        .subscribe({
          next: (org) => {
            user.organizationId = org.id;
            this.registerUser(user);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to create organization'
            });
            this.loading = false;
          }
        });
    } else {
      this.registerUser(user);
    }
  }

  registerUser(user: any) {
    this.authService.register(user)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful'
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Registration failed'
          });
          this.loading = false;
        }
      });
  }
}
