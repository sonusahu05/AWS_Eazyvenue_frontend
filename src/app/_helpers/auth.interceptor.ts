import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { TokenStorageService } from '../services/token-storage.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
const TOKEN_HEADER_KEY = 'Authorization';       // for Spring Boot back-end

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private token: TokenStorageService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only handle authentication in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    const token = this.token.getToken();
    if (token != null) {
      let headers = req.headers
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);
      //authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
      req = req.clone({ headers });

    }
    //return next.handle(authReq);
    return next.handle(req).pipe(tap(() => { },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          } else {
            this.token.isLoggedOut();
            if (this.router.url.includes('/manage')) {
              this.router.navigateByUrl("/manage/login");
            } else {
              this.router.navigateByUrl("/");
            }
          }
        }
      }));
  }
}
