import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '../services/toaster.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private toasterService: ToasterService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different error types
        if (error.status === 0) {
          // Network error
          this.toasterService.error('Network error. Please check your connection.', 'Connection Error');
        } else if (error.status >= 400 && error.status < 500) {
          // Client errors
          const errorMessage = error.error?.message || error.message || 'An error occurred';
          this.toasterService.error(errorMessage, `Error ${error.status}`);
        } else if (error.status >= 500) {
          // Server errors
          this.toasterService.error('Server error. Please try again later.', 'Server Error');
        }

        return throwError(() => error);
      })
    );
  }
}

