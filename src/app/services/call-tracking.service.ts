import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallTrackingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Track call events - accepts both string and object parameters
  trackCall(data: string | any, userPhone?: string): Observable<any> {
    if (typeof data === 'string') {
      return this.http.post(`${this.apiUrl}/call-tracking`, {
        venueId: data,
        userPhone,
        timestamp: new Date().toISOString()
      });
    } else {
      return this.http.post(`${this.apiUrl}/call-tracking`, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get call analytics
  getCallAnalytics(venueId?: string): Observable<any> {
    const url = venueId 
      ? `${this.apiUrl}/call-tracking/analytics/${venueId}`
      : `${this.apiUrl}/call-tracking/analytics`;
    return this.http.get(url);
  }

  // Get call logs
  getCallLogs(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/call-tracking/logs`, { params: filters });
  }

  // Get call tracking with filters (for the list component)
  getCallTrackingWithFilters(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/call-tracking/filtered`, { params: filters });
  }

  // Update call status
  updateCallStatus(callId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/call-tracking/${callId}`, { status });
  }
}
