import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const profileStr = localStorage.getItem('stamp-me-demo-profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile && profile.email) {
          const authReq = request.clone({
            headers: request.headers.set('X-User-Email', profile.email)
          });
          return next.handle(authReq);
        }
      } catch (e) {
        console.error('Error parsing profile from localStorage', e);
      }
    }
    return next.handle(request);
  }
}
