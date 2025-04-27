import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAuditLogs(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs?page=${page}&size=${size}`);
  }

  getAuditLogsByUser(userId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs/user/${userId}?page=${page}&size=${size}`);
  }

  getAuditLogsByAction(action: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs/action/${action}?page=${page}&size=${size}`);
  }

  getSystemStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getActiveUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active-users`);
  }

  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }
}
