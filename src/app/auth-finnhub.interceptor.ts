import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthFinnhubInterceptor implements HttpInterceptor {

  private readonly FINNHUB_HOST_NAME = "finnhub.io";

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isFinnhubHost(request)) {
      request = request.clone({
        setParams: {
          token: "bt9a4cv48v6sbe2ppnf0"
      }});
    }
    return next.handle(request);
  }

  private isFinnhubHost(request: HttpRequest<any>) {
    let url = new URL(request.url);
    return url.host === this.FINNHUB_HOST_NAME;
  }
}
