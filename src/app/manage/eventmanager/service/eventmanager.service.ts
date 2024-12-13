/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";
const API_URL = environment.apiUrl;
@Injectable(
  {
    providedIn: "root"
  }
)

export class EventplannerService {
  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };

  constructor(private http: HttpClient,) { }

  getEventplannerList(query): Observable<any> {
    return this.http.get<any>(environment.apiUrl+'eventplanner' + query);
  }
  updateEventplanner(id, userroledata): Observable<any> {
    return this.http.put(API_URL + 'eventplanner/'+id, userroledata);
  }
}
