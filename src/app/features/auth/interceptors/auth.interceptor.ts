import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth-service';
import { API_ENDPOINTS } from '../../../../api.constants';

let isRefreshing = false;

function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const accessTokenSignal = authService.accessToken;
  const accessToken = accessTokenSignal();

  const accessToken$ = toObservable(accessTokenSignal);

  let authReq = req;
  if (accessToken && !req.url.includes(API_ENDPOINTS.AUTH.REFRESH)) {
    authReq = addTokenToRequest(req, accessToken);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes(API_ENDPOINTS.AUTH.REFRESH)
      ) {
        return handle401Error(authReq, next, authService, accessToken$);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  accessToken$: Observable<string | null> //
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return accessToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((jwt) => {
        return next(addTokenToRequest(req, jwt));
      })
    );
  } else {
    isRefreshing = true;

    return authService.refreshSession().pipe(
      switchMap((authResponse) => {
        isRefreshing = false;

        const newAccessToken = authService.accessToken();

        if (newAccessToken) {
          return next(addTokenToRequest(req, newAccessToken));
        }

        return throwError(() => new Error('Nie udało się pobrać nowego tokenu po odświeżeniu.'));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        return throwError(() => refreshError);
      })
    );
  }
}
