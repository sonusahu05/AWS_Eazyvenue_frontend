import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpClient) { }

  getCountryList(): Observable<any> {
    return this.http.get(USER_API+"country");
    
  }

  getStateList(country): Observable<any> {
    return this.http.get(USER_API+"states/"+country);
  }
  
  getCityList(state): Observable<any> {
    return this.http.get(USER_API+"city/"+state);
  }

  getCities(query): Observable<any> {
    return this.http.get(USER_API + "citylist" + query);
  }
  getCurrencyList(): Observable<any> {
    return this.http.get(USER_API+"currency"); 
  }
}
