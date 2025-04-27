import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private apiUrl = `${environment.apiUrl}/risk`;

  constructor(private http: HttpClient) {}

  getPortfolioRisk(portfolioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}`);
  }

  getValueAtRisk(portfolioId: number, confidenceLevel: number = 95): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}/var?confidenceLevel=${confidenceLevel}`);
  }

  getSectorExposure(portfolioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}/sector-exposure`);
  }

  getConcentrationRisk(portfolioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}/concentration`);
  }

  getMarketRisk(portfolioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}/market-risk`);
  }

  getLiquidityRisk(portfolioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}/liquidity-risk`);
  }

  getOrganizationRisk(organizationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organization/${organizationId}`);
  }
}
