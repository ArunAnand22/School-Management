import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '../services/toaster.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different error types
      if (error.status === 0) {
        // Network error
        toasterService.error('Network error. Please check your connection.', 'Connection Error');
      } else if (error.status >= 400 && error.status < 500) {
        // Client errors
        const errorMessage = error.error?.message || error.message || 'An error occurred';
        toasterService.error(errorMessage, `Error ${error.status}`);
      } else if (error.status >= 500) {
        // Server errors
        toasterService.error('Server error. Please try again later.', 'Server Error');
      }

      return throwError(() => error);
    })
  );
};

