import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../ui/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const handledByCaller = error.status === 400 || error.status === 404 || error.status === 409;
      if (!handledByCaller) {
        toast.error(messageFor(error));
      }
      return throwError(() => error);
    }),
  );
};

function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Is the API running?';
  }
  const problem = error.error as { detail?: string; title?: string } | null;
  return problem?.detail ?? problem?.title ?? 'Something went wrong. Please try again.';
}
