  /*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
  import { environment } from 'src/environments/environment';
    
  @Injectable({providedIn: "root"})
    export class AddressService {
      
        private httpOptions = {
            headers: new HttpHeaders()
              .set("Content-Type", "application/json")
          };
      readonly bpostedUrl = environment.apiUrl+"contact-us/add";
    
      constructor(private http:HttpClient,) { }
  
      add(data){
        return this.http.post<any>(this.bpostedUrl, data, this.httpOptions);
      }
    //   getAddressList(query): Observable<any> {
    //     return this.http.get(environment.apiUrl+"attribute"+query);
    //   }
  
      getAddress(id: string) {
        return this.http.get<any>(`${environment.apiUrl+'attribute'}/${id}`);
      }
  }  