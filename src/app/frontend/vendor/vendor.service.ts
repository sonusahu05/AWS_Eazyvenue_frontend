import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl + 'vendor';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  authtoken: string;
  private httpOptions;
  private httpWithoutAuthOptions;
  constructor(private http: HttpClient, private token: TokenStorageService) {
    this.authtoken = this.token.getToken();
    this.httpOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
        .set('Authorization', `Bearer ${this.authtoken}`)
    };
    this.httpWithoutAuthOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
    };
  }
  getVendorList(query): Observable<any> {
    return this.http.get<any>(API_URL + query, this.httpOptions);
  }
}
