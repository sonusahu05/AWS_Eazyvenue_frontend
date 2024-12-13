import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  uploadVenueCsv(vendorData) {
    return this.http.post<any>(API_URL + '/uploadCSV', vendorData, this.httpOptions);
  }
  getVendorList(query): Observable<any> {
    return this.http.get<any>(API_URL + query, this.httpOptions);
  }
  getVendorListUser(query): Observable<any>{
    console.log(query);
    
    return this.http.get<any>(API_URL + '/vendorList' + query, this.httpOptions);
  }
  getVendorById(id): Observable<any>{
    return this.http.get<any>(API_URL + '/byId?id=' + id, this.httpOptions);
  }
  getVendorByMetaUrl(metaUrl,query): Observable<any>{
    return this.http.get<any>(API_URL + '/getVendorByMetaUrl?metaUrl=' + metaUrl+query, this.httpOptions);
  }
  getVendorServices(category): Observable<any>{
    return this.http.get<any>(API_URL+'/vendorServices?category='+category,this.httpOptions);
  }
  getCityByName(cityname):Observable<any>{
    return this.http.get<any>(API_URL+'/getCityByName?cityname='+cityname,this.httpWithoutAuthOptions);
  }
  getSubareaByName(subareaname):Observable<any>{
    return this.http.get<any>(API_URL+'/getSubareaByName?subareaname='+subareaname,this.httpWithoutAuthOptions);
  }
  getVendorsForCompare(query):Observable<any>{
    return this.http.get<any>(API_URL+"/vendorsForCompare"+query, this.httpWithoutAuthOptions)
  }
  getMinMaxPricingForVendor(query):Observable<any>{
    return this.http.get<any>(API_URL+"/minMaxVendorPrice"+query,this.httpWithoutAuthOptions);
  }
}
