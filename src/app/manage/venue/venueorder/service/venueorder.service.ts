/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../../environments/environment";
import { TokenStorageService } from '../../../../services/token-storage.service';
const API_URL = environment.apiUrl + 'venueorder';
@Injectable(
  {
    providedIn: "root"
  }
)
export class VenueorderService {
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

  getVenueorderList(query): Observable<any> {
    return this.http.get<any>(API_URL + query, this.httpOptions);
  }
  getVenueorder(id: string) {
    return this.http.get(API_URL + "/" + id,  this.httpOptions);
  }
  updateVenueorder(id: string, venuedata) {
    return this.http.put(API_URL + '/' + id, venuedata, this.httpOptions);
  }
}
