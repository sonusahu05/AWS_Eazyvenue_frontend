import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly requestpassurl = environment.apiUrl + "user/request-pass";
  constructor(private http: HttpClient) { }

  getUserList(query): Observable<any> {
    return this.http.get(USER_API + "user" + query);
  }
  getUserCategory(query): Observable<any> {
    return this.http.get(USER_API + "user/usercategory" + query);
  }

  getUserDetails(id): Observable<any> {
    return this.http.get(USER_API + "user/" + id);
  }
  requestPassword(request: any) {
    return this.http.post(this.requestpassurl, request);
  }
  updateUser(id, userdata): Observable<any> {
    return this.http.put(USER_API + 'user/' + id, userdata);
  }

  addUser(userdata): Observable<any> {
    return this.http.post(USER_API + 'user', userdata);
  }

  addChildUser(userdata): Observable<any> {
    return this.http.post(USER_API + 'user/add-child', userdata);
  }

  getUser(id): Observable<any> {
    return this.http.get(USER_API + "user/" + id);
  }

}