import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PostAvailabilityService {
  constructor(private http: HttpClient) { }

  getPostAvailabilityList(query): Observable<any> {
    return this.http.get(USER_API + "postavailability" + query);
  }
  getPostAvailabilityListWithoutAuth(query): Observable<any> {
    return this.http.get(USER_API + "postavailability/v1?" + query);
  }

  getPostAvailabilityDetails(id): Observable<any> {
    return this.http.get(USER_API + "postavailability/" + id);
  }

  updatePostAvailability(id, postavailabilityData): Observable<any> {
    return this.http.put(USER_API + 'postavailability/' + id, postavailabilityData);
  }

  addPostAvailability(postavailabilityData): Observable<any> {
    return this.http.post(USER_API + 'postavailability', postavailabilityData);
  }
  // getPostavailability(): Observable<any> {
  //   return this.http.get(USER_API+"postavailability/");
  // }
  getPostAvailability(id): Observable<any> {
    return this.http.get(USER_API + "postavailability/" + id);
  }

}