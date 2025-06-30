import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
    console.log('🚀 SERVICE: API URL:', environment.apiUrl + 'eventplanner');

    return this.http.post<any>(environment.apiUrl + 'eventplanner', enquiryData, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('🚀 SERVICE: API Response received:', response);
        }),
        catchError(error => {
          console.error('🚀 SERVICE: API Error occurred:', error);
          console.error('🚀 SERVICE: Error status:', error.status);
          console.error('🚀 SERVICE: Error message:', error.message);
          console.error('🚀 SERVICE: Error body:', error.error);
          return throwError(error);
        })
      );
  }

  // Updated method to support filtering by venue owner email
  getEnquiryList(queryParams?: string): Observable<any> {
    const url = queryParams ?
      environment.apiUrl + 'eventplanner' + queryParams :
      environment.apiUrl + 'eventplanner';

    console.log('📊 SERVICE: Fetching enquiry list from API...');
    console.log('📊 SERVICE: API URL:', url);

    return this.http.get<any>(url)
      .pipe(
        tap(response => {
          console.log('📊 SERVICE: Get enquiry list response:', response);
        }),
        catchError(error => {
          console.error('📊 SERVICE: Get enquiry list error:', error);
          return throwError(error);
        })
      );
  }

  updateEnquiry(id: string, data: any): Observable<any> {
    console.log('📝 SERVICE: Updating enquiry:', id, 'with data:', data);
    console.log('📝 SERVICE: API URL:', environment.apiUrl + 'eventplanner/' + id);

    return this.http.put<any>(environment.apiUrl + 'eventplanner/' + id, data, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('📝 SERVICE: Update enquiry response:', response);
        }),
        catchError(error => {
          console.error('📝 SERVICE: Update enquiry error:', error);
          return throwError(error);
        })
      );
  }

  getEnquiryById(id: string): Observable<any> {
    console.log('🔍 SERVICE: Fetching enquiry by ID:', id);
    console.log('🔍 SERVICE: API URL:', environment.apiUrl + 'eventplanner/' + id);

    return this.http.get<any>(environment.apiUrl + 'eventplanner/' + id)
      .pipe(
        tap(response => {
          console.log('🔍 SERVICE: Get enquiry by ID response:', response);
        }),
        catchError(error => {
          console.error('🔍 SERVICE: Get enquiry by ID error:', error);
          return throwError(error);
        })
      );
  }
}