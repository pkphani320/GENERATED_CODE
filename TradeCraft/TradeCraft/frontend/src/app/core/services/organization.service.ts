import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getOrganizations(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  createOrganization(organization: Organization): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  updateOrganization(organization: Organization): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${organization.id}`, organization);
  }

  deleteOrganization(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignUserToOrganization(userId: number, organizationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${organizationId}/users/${userId}`, {});
  }

  removeUserFromOrganization(userId: number, organizationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${organizationId}/users/${userId}`);
  }
}
