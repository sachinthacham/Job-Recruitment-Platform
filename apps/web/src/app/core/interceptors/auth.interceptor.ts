import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Don't add token to auth endpoints (login, register, refresh, etc.)
  if (req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh') ||
      req.url.includes('/auth/forgot-password') ||
      req.url.includes('/auth/reset-password')) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isRefreshing) {
          isRefreshing = true;

          return authService.refreshToken().pipe(
            switchMap((tokens) => {
              isRefreshing = false;
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }

        return throwError(() => error);
      }),
    );
  }

  return next(req);
};
