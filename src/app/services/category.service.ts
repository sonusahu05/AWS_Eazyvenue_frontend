import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) { }

  getCategoryList(query): Observable<any> {
    return this.http.get(API_URL + "category" + query);
  }
  getHomeCategoryList(): Observable<any> {
    return this.http.get(API_URL + "category/categoriesForHome");
  }
  getCategoryWithoutAuthList(query): Observable<any> {
    return this.http.get(API_URL + "category/v1" + query);
  }
  getCategoryByName(name): Observable<any> {
    return this.http.get(API_URL + "category/categoryByName?name=" + name);
  }

  getCategoryDetails(id): Observable<any> {
    return this.http.get(API_URL + "category/" + id);
  }

  updateCategory(id, categorydata): Observable<any> {
    return this.http.put(API_URL + 'category/' + id, categorydata);
  }

  addCategory(categorydata): Observable<any> {
    return this.http.post(API_URL + 'category', categorydata);
  }

  getAllCategory(querystring): Observable<any> {
    return this.http.get(API_URL + "category/all/?" + querystring);
  }
  getAllDecendants(querystring): Observable<any> {
    return this.http.get(API_URL + "category/descendants/?" + querystring);
  }

  searchCategoryDetails(querystring): Observable<any> {
    return this.http.get(API_URL + 'category/?' + querystring);
  }

  private categoryId = new BehaviorSubject('');
  _categoryid = this.categoryId.asObservable();

  categoryid(val: any) {
    this.categoryId.next(val);
  }


}
