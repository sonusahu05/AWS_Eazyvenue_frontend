  /*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
  import { Injectable } from '@angular/core'; 
  import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
  import { Observable } from 'rxjs'; 
  import { environment } from "./../../../environments/environment";  
  
  @Injectable(
    {
      providedIn: "root"
    }
  )
  
  export class UserService {
    
    private httpOptions = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/json")
    };
    
    readonly updateUrl = environment.apiUrl+"user";
    readonly deleteUrl = environment.apiUrl+"user";
    readonly registeration = environment.apiUrl + "user/sign-up";
    readonly resetpassurl = environment.apiUrl + "user/reset-pass";
    readonly sendemailUrl = environment.apiUrl+"/utility/sendEmail";

  
    constructor(private http:HttpClient,) { }
  
  getUserLists(){
    return this.http.get<any[]>(environment.apiUrl+'user/list');
  }  

  getUser(id: string) {
    return this.http.get<any>(`${environment.apiUrl+'user'}/${id}`);
  }

  sendEmail(request:any){
    // console.log(request);
    return this.http.post<any>(this.sendemailUrl, request, this.httpOptions);

  }

  resetPassword(request:any){
    return this.http.post(this.resetpassurl,request);
  }
  
  addUser(request:any){
    return this.http.post(this.registeration,request);
  }
    
  editUser(user, id: string) {
    return this.http.put<any>(
      `${this.updateUrl}/${id}`,
      user,
      this.httpOptions
    );
  }
  
    deleteUser(desId:string){
      return this.http.delete(this.deleteUrl + `/${desId}`);
    }

  }
  