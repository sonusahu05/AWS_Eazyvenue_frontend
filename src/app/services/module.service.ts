import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  constructor(private http: HttpClient) { }

  getLevelwiseModuleList(level): Observable<any> {
    return this.http.get(API_URL+'module/level/'+level);
  }

//   updateUserrole(id, userroledata): Observable<any> {
//     return this.http.put(API_URL + 'userrole/'+id, userroledata);
//   }

  getModules(): Observable<any> {
    return this.http.get(API_URL+"module");
  }
  getModuleDetails(moduleid): Observable<any> {
    return this.http.get(API_URL+"module/"+moduleid);
  }

//   searchRoleDetails(querystring): Observable<any> {
//     return this.http.get(API_URL+'userrole/?'+querystring);
//   }

//   addRole(roledata): Observable<any> {
//     return this.http.post(API_URL + 'role', roledata );
//   }
}
