/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { Productreview } from '../model/productreview';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";
const USER_API = environment.apiUrl;


@Injectable(
  {
    providedIn: "root"
  }
)

export class ProductreviewService {

  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };

  readonly bpostedUrl = environment.apiUrl + "productreview/add";
  readonly updateUrl = environment.apiUrl + "productreview/update";
  readonly deleteUrl = environment.apiUrl + "productreview/delete";
  readonly cmsUrl = environment.apiUrl + "productreview";

  constructor(private http: HttpClient,) { }



  getproductreviewList(query): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'productreview?' + query);
  }

  getProductreviewLists() {
    // console.log(environment.apiUrl+'/booking');
    return this.http.get<any[]>(environment.apiUrl + 'productreview');

  }

  getContentDetails(query): Observable<any> {
    return this.http.get(this.cmsUrl + query);
  }

  getProductreview(id: string) {
    return this.http.get<any>(`${environment.apiUrl + 'productreview'}/${id}`);
  }

  addProductreview(request: Productreview) {
    return this.http.post<any>(this.bpostedUrl, request, this.httpOptions);
  }

  editProductreview(productreview, id: string) {
    return this.http.put<any>(
      `${this.updateUrl}/${id}`,
      productreview,
      this.httpOptions
    );
  }

  updateUser(id, data): Observable<any> {
    return this.http.put(USER_API + 'productreview/' + id, data);
  }
  deleteProductreview(desId: string) {
    return this.http.delete(this.deleteUrl + `/${desId}`);
  }



}
