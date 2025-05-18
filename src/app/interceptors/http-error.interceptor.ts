import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../Services/ui.service';

export const httpErrorInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const uiService = inject(UiService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error.message || 'Invalid request';
            break;
          case 401:
            errorMessage = 'Unauthorized access';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error';
            break;
          default:
            errorMessage = 'Something went wrong';
        }
      }

      uiService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};