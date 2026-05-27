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
      tap(response => {
        const userData = { email, token: response.token };
        this.currentUser.set(userData);

        if (rememberMe) {
          localStorage.setItem('skypass_user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('skypass_user');
        }
      }),
      catchError(err => {
        // Fallback local în caz de eșec de rețea, extensii securitate sau ad-blocker pe reqres.in
        if (email === 'eve.holt@reqres.in') {
          const fakeResponse = { token: 'local_mock_token_12345' };
          const userData = { email, token: fakeResponse.token };
          this.currentUser.set(userData);

          if (rememberMe) {
            localStorage.setItem('skypass_user', JSON.stringify(userData));
          } else {
            localStorage.removeItem('skypass_user');
          }
          return of(fakeResponse);
        }
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string): Observable<{ id: number; token: string }> {
    // În ReqRes register returnează ID și token
    return this.http.post<{ id: number; token: string }>(`${this.API_URL}/register`, { email, password });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('skypass_user');
  }

  private checkAutoLogin(): void {
    const savedUser = localStorage.getItem('skypass_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.currentUser.set(userData);
      } catch (e) {
        localStorage.removeItem('skypass_user');
      }
    }
  }
}
