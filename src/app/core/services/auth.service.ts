import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://reqres.in/api';

  // Signals pentru starea utilizatorului (Angular v16-v21)
  currentUser = signal<{ email: string; token: string } | null>(null);
  isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    this.checkAutoLogin();
  }

  login(email: string, password: string, rememberMe: boolean): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(res => {
        const userData = { email, token: res.token };
        this.currentUser.set(userData);
        if (rememberMe) {
          localStorage.setItem('skypass_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('skypass_user', JSON.stringify(userData));
        }
      }),
      catchError(err => {
        const localUsers = JSON.parse(localStorage.getItem('skypass_registered_users') || '[]');
        const userExists = localUsers.find((u: any) => u.email === email && u.password === password);
        if (userExists) {
          const fakeToken = 'local_mock_token_' + new Date().getTime();
          const userData = { email, token: fakeToken };
          this.currentUser.set(userData);
          if (rememberMe) {
            localStorage.setItem('skypass_user', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('skypass_user', JSON.stringify(userData));
          }
          return of({ token: fakeToken });
        }
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string): Observable<{ id: number; token: string }> {
    return this.http.post<{ id: number; token: string }>(`${this.API_URL}/register`, { email, password }).pipe(
      tap(res => {
        const localUsers = JSON.parse(localStorage.getItem('skypass_registered_users') || '[]');
        if (!localUsers.find((u: any) => u.email === email)) {
          localUsers.push({ email, password });
          localStorage.setItem('skypass_registered_users', JSON.stringify(localUsers));
        }
      }),
      catchError(err => {
        const localUsers = JSON.parse(localStorage.getItem('skypass_registered_users') || '[]');
        if (localUsers.find((u: any) => u.email === email)) {
           return throwError(() => ({ error: { error: 'Acest email este deja înregistrat!' } }));
        }
        localUsers.push({ email, password });
        localStorage.setItem('skypass_registered_users', JSON.stringify(localUsers));
        return of({ id: 999, token: 'local_mock_token_register' });
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('skypass_user');
    sessionStorage.removeItem('skypass_user');
  }

  private checkAutoLogin(): void {
    const savedUser = localStorage.getItem('skypass_user') || sessionStorage.getItem('skypass_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.currentUser.set(userData);
      } catch (e) {
        localStorage.removeItem('skypass_user');
        sessionStorage.removeItem('skypass_user');
      }
    }
  }
}
