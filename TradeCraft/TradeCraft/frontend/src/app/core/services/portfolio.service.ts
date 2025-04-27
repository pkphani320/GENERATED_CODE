import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolios`;

  constructor(private http: HttpClient) {}

  getPortfolios(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getPortfolioById(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/${id}`);
  }

  createPortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.apiUrl, portfolio);
  }

  updatePortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.apiUrl}/${portfolio.id}`, portfolio);
  }

  deletePortfolio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPortfoliosByOrganization(organizationId: number): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.apiUrl}/organization/${organizationId}`);
  }

  getPortfolioPerformance(id: number, period: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/performance?period=${period}`);
  }

  getPortfolioHoldings(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/holdings`);
  }
}
