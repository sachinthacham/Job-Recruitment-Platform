import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.error('Access denied:', error.error?.error?.message || error.message);
      }

      if (error.status === 0) {
        console.error('Network error — API may be unreachable');
      }

      if (error.status === 429) {
        console.error('Rate limited — too many requests');
      }

      return throwError(() => error);
    }),
  );
};
