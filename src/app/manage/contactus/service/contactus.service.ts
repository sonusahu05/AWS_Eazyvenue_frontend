/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";



@Injectable(
  {
    providedIn: "root"
  }
)

export class ContactUsService {

  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };

  readonly contactUsUrl = environment.apiUrl + "contact-us";
  readonly updateUrl = environment.apiUrl+"contact-us/update";
  constructor(private http: HttpClient,) { }

  getContactUsList(query): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'contact-us'+ query);
  }
  deleteContactUs( id: string, contactUsData) {
    return this.http.put<any>(`${this.updateUrl}/${id}`, contactUsData, this.httpOptions);
  }
}
