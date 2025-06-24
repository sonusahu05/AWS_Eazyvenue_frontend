import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "./../../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class EnquiryService {
  private httpOptions = {
    headers: new HttpHeaders()
      .set("Content-Type", "application/json")
  };

  constructor(private http: HttpClient) { }

  // Auto create enquiry when user views venue details
  createEnquiry(enquiryData: any): Observable<any> {
    console.log('🚀 SERVICE: Sending enquiry data to API:', enquiryData);
    return this.http.post(environment.apiUrl + 'enquiry', enquiryData, this.httpOptions);
  }

  getEnquiryList(): Observable<any> {
    console.log('📊 SERVICE: Fetching enquiry list from API...');
    return this.http.get<any>(environment.apiUrl + 'enquiry');
  }

  updateEnquiry(id: string, data: any): Observable<any> {
    return this.http.put(environment.apiUrl + 'enquiry/' + id, data, this.httpOptions);
  }

  getEnquiryById(id: string): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'enquiry/' + id);
  }
}