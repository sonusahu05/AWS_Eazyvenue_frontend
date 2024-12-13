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

export class StateService {

  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };
  constructor(private http: HttpClient,) { }
  getstateList(query): Observable<any> {
    return this.http.get(environment.apiUrl + "statelist?" + query);
  }  
  getcountrystateList(countrycode): Observable<any> {
    return this.http.get(environment.apiUrl + "statelist/getCountryStates/"+countrycode);
  }  
  getstate(id: string) {
    return this.http.get<any>(`${environment.apiUrl + 'statelist'}/${id}`);
  }
  addstate(request) {
    return this.http.post<any>(environment.apiUrl+"statelist/add", request, this.httpOptions);
  }
  editstate(state, id: string) {
    return this.http.put<any>(`${environment.apiUrl+"statelist/update"}/${id}`,state,this.httpOptions);
  }
  deletestate(desId: string) {
    return this.http.delete(environment.apiUrl+"statelist/delete" + `/${desId}`);
  }

}
