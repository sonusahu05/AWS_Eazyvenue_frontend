import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient) { }

  getRoleList(query): Observable<any> {
    return this.http.get(API_URL+'userrole/?'+query);
  }

  updateRole(id, userroledata): Observable<any> {
    return this.http.put(API_URL + 'userrole/'+id, userroledata);
  }

  getRoleDetails(id): Observable<any> {
    return this.http.get(API_URL+"userrole/"+id);
  }

  searchRoleDetails(querystring): Observable<any> {
    return this.http.get(API_URL+'userrole/?'+querystring);
  }

  addRole(roledata): Observable<any> {
    return this.http.post(API_URL + 'userrole', roledata );
  }
}
