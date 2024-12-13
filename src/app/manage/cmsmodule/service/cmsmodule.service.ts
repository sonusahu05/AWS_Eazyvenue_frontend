/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { Cmsmodule } from '../model/cmsmodule';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";
import { TokenStorageService } from '../../../services/token-storage.service';
const API_URL = environment.apiUrl + 'cmsmodule';
@Injectable(
  {
    providedIn: "root"
  }
)
export class CmsmoduleService {
  authtoken: string;
  private httpOptions;
  constructor(private http: HttpClient, private token: TokenStorageService) { 
    this.authtoken = this.token.getToken();
    this.httpOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
        .set('Authorization', `Bearer ${this.authtoken}`)
    };
  }
  getcmsmoduleList(query): Observable<any> {
    return this.http.get<any>(API_URL + query, this.httpOptions);
  }
  getCmsmodule(id: string) {
    return this.http.get<any>(`${API_URL}/${id}`, this.httpOptions);
  }
  addCmsmodule(cmsmodule) {
    console.log(this.httpOptions);
    return this.http.post<any>(API_URL, cmsmodule, this.httpOptions);
  }
  editCmsmodule(cmsmodule, id: string): Observable<any> {
    return this.http.put(API_URL + '/'+id, cmsmodule, this.httpOptions );
  }
  // getcmsmoduleList(query): Observable<any> {
  //   return this.http.get(API_URL+"cmsmodule"+query);
  //  }

  // getcmsmoduleList(): Observable<any> {
  //   return this.http.get<any>(API_URL, this.httpOptions);
  // }

  // getCmsmoduleLists() {
  //   // console.log(API_URL+'/booking');
  //   return this.http.get<any[]>(API_URL + 'cmsmodule');

  // }

  getContentDetails(query): Observable<any> {
    return this.http.get(API_URL + query);
  }

  // getCmsmodule(id: string) {
  //   return this.http.get<any>(`${API_URL + 'cmsmodule'}/${id}`);
  // }

  // addCmsmodule(request: Cmsmodule) {
  //   return this.http.post<any>(API_URL, request, this.httpOptions);
  // }

  // editCmsmodule(cmsmodule, id: string) {
  //   return this.http.put<any>(API_URL+id, cmsmodule, this.httpOptions);
  // }
}
