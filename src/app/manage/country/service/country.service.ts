/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
//import { Countrylocation } from '../model/countrylocation';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";

@Injectable(
  {
    providedIn: "root"
  }
)
export class CountryService {
  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };
  constructor(private http: HttpClient,) { }
  getcountryList(query): Observable<any> {
    return this.http.get(environment.apiUrl + "countrylist?" + query);
  }  
  getCountry(id: string) {
    return this.http.get<any>(`${environment.apiUrl + 'countrylist'}/${id}`);
  }
  addCountry(request) {
    return this.http.post<any>(environment.apiUrl+"countrylist/add", request, this.httpOptions);
  }
  editCountry(country, id: string) {
    return this.http.put<any>(
      `${environment.apiUrl+"countrylist/update"}/${id}`,
      country,
      this.httpOptions
    );
  }
  deleteCountry(desId: string) {
    return this.http.delete(environment.apiUrl+"countrylist/delete" + `/${desId}`);
  }
}
