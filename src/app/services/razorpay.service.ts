import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private authtoken: string;
  private httpOptions;
  constructor(private http: HttpClient, private token: TokenStorageService) {
    this.authtoken = this.token.getToken();
    this.httpOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
        .set('Authorization', `Bearer ${this.authtoken}`)
    };
  }
  createVendorOrder(data:any) {
    return this.http.post<any>(API_URL+ "vendororder",data,this.httpOptions)
  }
  handleVendorPayment(rzp_response: any) {
    return this.http.post<any>(API_URL+ "vendororder/verifyPayment",rzp_response,this.httpOptions)
  }
}
