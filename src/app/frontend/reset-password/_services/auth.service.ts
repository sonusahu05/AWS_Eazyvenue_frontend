import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from "./../../../../environments/environment";
import { Router } from '@angular/router';
import { map } from 'rxjs/operators'

const AUTH_API = environment.apiUrl;
//const AUTH_API = 'https://dev.wiseowlzz.com:3001/api/customerauth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private router: Router) { }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login(phone: string, password: string): Observable<any> {
   /* return this.http.post(AUTH_API + '/customerauth/login', {
      phone,
      password
    }, httpOptions);*/

 return this.http.post<any>(AUTH_API + '/customerauth/login', { phone, password }, httpOptions)
            .pipe(map(user => {
   			console.log(user);
                // store user details and jwt token in local storage to keep user logged in between page refreshes
              //  localStorage.setItem('currentUser', JSON.stringify(user));
               // this.currentUserSubject.next(user);
              this.loggedIn.next(true);
             // this.router.navigate(['/']);
                return user;
            }));
  }

  register(username: string, email: string, company: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + '/customerauth/sign-up', {
      username,
      email,
    company,
      password
    }, httpOptions);
  }
  
  logout() {
    this.loggedIn.next(false);
    this.router.navigate(['']);
  }
}
