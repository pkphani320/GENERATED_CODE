import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  assignRole(userId: number, roleId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
  }

  removeRole(userId: number, roleId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/roles/${roleId}`);
  }

  getUsersByOrganization(organizationId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/organization/${organizationId}`);
  }
}
