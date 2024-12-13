import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const AUTH_API = environment.apiUrl + 'auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient) {

    }

    login(email: string, password: string, type: string): Observable<any> {
        return this.http.post(AUTH_API + 'login', {
            email,
            password,
            type
        });
    }
    loginclient(email: string, password: string, type: string): Observable<any> {
        return this.http.post(AUTH_API + 'login', {
            email,
            password,
            type
        });
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(AUTH_API + 'sign-up', {
            username,
            email,
            password
        });
    }

    signUp(userData): Observable<any> {
        return this.http.post(AUTH_API + 'sign-up', userData);
    }

    otpLogin(data) {
        return this.http.post(AUTH_API + 'sendOtp', data);
    }
    verifyOtp(data) {
        return this.http.post(AUTH_API + 'verifyOtp', data);
    }
}
