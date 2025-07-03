import { Injectable, Inject, Optional } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(@Optional() @Inject('REQUEST_ORIGIN') private origin: string) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Handle relative URLs during SSR
    if (req.url.startsWith('/') || req.url.startsWith('./')) {
      const serverReq = req.clone({
        url: `${this.origin || 'https://api.eazyvenue.com'}${req.url}`
      });
      
      // Add timeout for SSR requests
      return next.handle(serverReq).pipe(
        timeout(8000), // 8 second timeout
        catchError((error) => {
          console.warn('SSR HTTP request failed:', error);
          // Return empty response for failed requests during SSR
          return of(null as any);
        })
      );
    }

    // For absolute URLs, proceed normally with timeout
    return next.handle(req).pipe(
      timeout(8000),
      catchError((error) => {
        console.warn('HTTP request failed:', error);
        return of(null as any);
      })
    );
  }
}
