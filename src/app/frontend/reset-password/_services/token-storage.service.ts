import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from "moment";

const TOKEN_KEY = 'auth-token';
const CUSTOMER_KEY = 'auth-customer';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor(private router: Router) { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
	console.log(token);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveCustomer(user: any): void {
	  console.log(user);
    window.sessionStorage.removeItem(CUSTOMER_KEY);
    window.sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
  }

  public getCustomer(): any {
    const user = window.sessionStorage.getItem(CUSTOMER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
  
  getAuthStatus(data: any) {
    const token = this.getToken() // get token from local storage
	console.log(token);
	console.log(data);
	console.log(data.token.access_token);
	const expiresAt = moment().add(data.token.expires_in,'second');
	console.log(expiresAt);
	localStorage.setItem('customer_access_token', data.token.access_token);
	localStorage.setItem('customer_refresh_token', data.token.refresh_token);
	localStorage.setItem('currentCustomerData', JSON.stringify(data.token.userdata));
    localStorage.setItem("customer_expires_at", JSON.stringify(expiresAt.valueOf()) );
	console.log(JSON.stringify(expiresAt.valueOf()));
 
  }
  
  public isLoggedIn() {
        return moment().isBefore(this.getExpiration());
    }
	
  isLoggedOut() {
       // localStorage.removeItem('currentUser');
        console.log(JSON.stringify(localStorage.getItem('customer_access_token')));
        localStorage.clear();
        //this.router.navigate(['admin/login']); 
        this.router.navigate(['login']); // go to login if not authenticated
       // return !this.isLoggedIn();
    }
	
	
	getExpiration() {
        const expiration = localStorage.getItem("customer_expires_at");
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }    

  
   
}