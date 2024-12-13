import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) { }

  getCategoryList(query): Observable<any> {
    return this.http.get(API_URL+"category"+query);
  }

  getCategoryDetails(id): Observable<any> {
    return this.http.get(API_URL+"category/"+id);
  }

  updateCategory(id, categorydata): Observable<any> {
    return this.http.put(API_URL + 'category/'+id, categorydata );
  }

  addCategory(categorydata): Observable<any> {
    return this.http.post(API_URL + 'category', categorydata );
  }

  getAllCategory(querystring): Observable<any> {
    return this.http.get(API_URL + "category/all/?"+querystring);    
  }

  searchCategoryDetails(querystring): Observable<any> {
    return this.http.get(API_URL+'category/?'+querystring);
  }

}
