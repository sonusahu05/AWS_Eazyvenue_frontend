// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class FrontendBannerService {
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) { }

//   getBanners(): Observable<any> {
//     return this.http.get(this.apiUrl + 'banner?status=true');
//   }

//   getBannerBySlug(slug: string): Observable<any> {
//     return this.http.get(this.apiUrl + 'banner?slug=' + slug);
//   }
// }