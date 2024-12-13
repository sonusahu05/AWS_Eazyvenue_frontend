import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  constructor(private http: HttpClient) { }

  getBanner(query): Observable<any> {
    return this.http.get(USER_API+"banner"+query);
  }

  getBannerDetails(id): Observable<any> {
    return this.http.get(USER_API+"banner/"+id);
  }

  addBanner(bannerdata): Observable<any> {
    return this.http.post(USER_API + 'banner', bannerdata );
  }

  updateBanner(id, bannerdata) {
    return this.http.put(USER_API + 'banner/'+id, bannerdata);
  }


  getbannerList(query): Observable<any> {
         return this.http.get(USER_API+"banner"+query);
       }

  getBannerLists(){
  return this.http.get<any[]>(USER_API+'/banner');

  }
  deleteBanner(desId:string){
    return this.http.delete(USER_API + 'banner/'+desId);
  }  
}
  