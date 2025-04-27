import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  exportPortfolioPdf(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/portfolio/${portfolioId}/pdf`, {
      responseType: 'blob'
    });
  }

  exportPortfolioExcel(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/portfolio/${portfolioId}/excel`, {
      responseType: 'blob'
    });
  }

  exportTradesPdf(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trades/${portfolioId}/pdf`, {
      responseType: 'blob'
    });
  }

  exportTradesExcel(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trades/${portfolioId}/excel`, {
      responseType: 'blob'
    });
  }

  exportRiskReportPdf(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/risk/${portfolioId}/pdf`, {
      responseType: 'blob'
    });
  }

  exportRiskReportExcel(portfolioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/risk/${portfolioId}/excel`, {
      responseType: 'blob'
    });
  }

  downloadAndSaveFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
