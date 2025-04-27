import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './admin.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { OrgManagementComponent } from './org-management/org-management.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserManagementComponent },
      { path: 'organizations', component: OrgManagementComponent },
      { path: 'audit-logs', component: AuditLogsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    UserManagementComponent,
    OrgManagementComponent,
    AuditLogsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
