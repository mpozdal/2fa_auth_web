import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../api.constants';
import { AuthResponse, LoginCredentials } from '../models/auth.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  public readonly accessToken = signal<string | null>(null);
  private readonly userId = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  public readonly isLoggedIn = computed(() => !!this.accessToken());

  public login(loginCredentials: LoginCredentials): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, loginCredentials, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response: HttpResponse<AuthResponse>) => {
          const authResponse = response.body as AuthResponse;

          this.accessToken.set(authResponse.value.token);
          this.userId.set(authResponse.value.userId);

          return authResponse;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  public refreshSession(): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response: AuthResponse) => {
          if (response.isSuccess && response.value.token) {
            this.accessToken.set(response.value.token);
            this.userId.set(response.value.userId);
          } else {
            this.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
          }
        })
      );
  }

  public logout(): Observable<any> {
    const userId = this.userId();
    return this.httpClient
      .post(API_ENDPOINTS.AUTH.LOGOUT, { userId }, { observe: 'response' })
      .pipe(
        tap(() => {
          this.accessToken.set(null);
          this.userId.set(null);
        })
      );
  }

  public verify2FA(code: string): Observable<AuthResponse> {
    const userId = this.userId();
    return this.httpClient
      .post<AuthResponse>(
        API_ENDPOINTS.AUTH.TWOFA_VERIFY,
        { userId, code },
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map((response: HttpResponse<AuthResponse>) => {
          const authResponse = response.body as AuthResponse;
          this.accessToken.set(authResponse.value.token);

          return authResponse;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }
}
