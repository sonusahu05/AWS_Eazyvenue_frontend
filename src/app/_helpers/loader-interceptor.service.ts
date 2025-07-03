// loader-interceptor.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(
    private loaderService: LoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    // Only update loader state in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loaderService.isLoading.next(this.requests.length > 0);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't show loader during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    this.requests.push(req);

    //console.log("No of requests--->" + this.requests.length);

    this.loaderService.isLoading.next(true);
    return Observable.create(observer => {
      const subscription = next.handle(req)
        .subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.removeRequest(req);
              observer.next(event);
            }
          },
          err => {
            //console.log('error' + err);
            this.removeRequest(req);
            observer.error(err);
          },
          () => {
            this.removeRequest(req);
            observer.complete();
          });
      // remove request from queue when cancelled
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });
  }
}
