  /*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
  import { Injectable } from '@angular/core';
  import { Orderreview } from '../model/orderreview';
  import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { environment } from "./../../../../environments/environment";
  
  
  
  @Injectable(
    {
      providedIn: "root"
    }
  )
  
  export class OrderreviewService {
    
    private httpOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
    };
    
     readonly bpostedUrl = environment.apiUrl+"orderreview/add";
     readonly updateUrl = environment.apiUrl+"orderreview/update";
     readonly deleteUrl = environment.apiUrl+"orderreview/delete";
     readonly cmsUrl = environment.apiUrl+"orderreview";
  
     constructor(private http:HttpClient,) { }     
  


    getorderreviewList(query): Observable <any> {      
      return this.http.get<any>(environment.apiUrl+'orderreview?'+query);      
     }

    getOrderreviewLists(){
     // console.log(environment.apiUrl+'/booking');
     return this.http.get<any[]>(environment.apiUrl+'orderreview');
     
    }  

    getContentDetails(query): Observable<any> {
      return this.http.get(this.cmsUrl+query);
    }

    getOrderreview(id: string) {
      return this.http.get<any>(`${environment.apiUrl+'orderreview'}/${id}`);
    }
  
    addOrderreview(request:Orderreview){
      return this.http.post<any>(this.bpostedUrl, request, this.httpOptions);      
    }
    
	  editOrderreview(orderreview, id: string) {
      return this.http.put<any>(
        `${this.updateUrl}/${id}`,
        orderreview,
        this.httpOptions
      );
    }
  
  
    deleteOrderreview(desId:string){
      return this.http.delete(this.deleteUrl + `/${desId}`);
    }  
   
  

  }
  