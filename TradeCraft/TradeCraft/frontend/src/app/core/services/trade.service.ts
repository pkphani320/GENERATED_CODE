import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trade } from '../models/trade.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private apiUrl = `${environment.apiUrl}/trades`;

  constructor(private http: HttpClient) {}

  getTrades(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getTradeById(id: number): Observable<Trade> {
    return this.http.get<Trade>(`${this.apiUrl}/${id}`);
  }

  createTrade(trade: Trade): Observable<Trade> {
    return this.http.post<Trade>(this.apiUrl, trade);
  }

  updateTrade(trade: Trade): Observable<Trade> {
    return this.http.put<Trade>(`${this.apiUrl}/${trade.id}`, trade);
  }

  deleteTrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTradesByPortfolio(portfolioId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/${portfolioId}?page=${page}&size=${size}`);
  }

  getTradesByUser(userId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}?page=${page}&size=${size}`);
  }

  executeTrade(id: number): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/${id}/execute`, {});
  }

  settleTrade(id: number): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/${id}/settle`, {});
  }

  cancelTrade(id: number): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
