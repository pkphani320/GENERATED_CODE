import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => this.setUserData(response)),
        map(response => response.user)
      );
  }

  register(user: User): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, user)
      .pipe(
        tap(response => this.setUserData(response)),
        map(response => response.user)
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  private setUserData(response: AuthResponse): void {
    const { user, accessToken } = response;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', accessToken);
    this.currentUserSubject.next(user);
    this.autoLogout();
  }

  autoLogout(): void {
    const expirationDuration = 3600 * 1000; // 1 hour
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.roles?.includes(role) || false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
