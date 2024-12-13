import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SubareaService {
  constructor(private http: HttpClient) { }

  getSubareaList(query): Observable<any> {
    return this.http.get(API_URL + "subarea?" + query);
  }
  // getSubareaWithoutAuthList(query): Observable<any> {
  //   return this.http.get(API_URL + "Subarea/v1" + query);
  // }

  getSubareaDetails(id): Observable<any> {
    return this.http.get(API_URL + "subarea/" + id);
  }

  updateSubarea(id, subareadata): Observable<any> {
    return this.http.put(API_URL + 'subarea/' + id, subareadata);
  }

  addSubarea(subareadata): Observable<any> {
    return this.http.post(API_URL + 'subarea', subareadata);
  }
}
