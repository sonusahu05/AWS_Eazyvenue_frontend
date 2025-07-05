import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface VenueClickData {
  venueId: string;
  venueName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userContact?: string;
  sessionId: string;
  location?: {
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  device?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    isMobile?: boolean;
  };
  engagement?: {
    timeSpentSeconds?: number;
    scrollDepthPercent?: number;
    submittedEnquiry?: boolean;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    neighbourhood?: string;
    state?: string;
    country?: string;
    postcode?: string;
    state_district?: string;
    county?: string;
    region?: string;
    country_code?: string;
  };
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl + 'analytics/geography';

  constructor(private http: HttpClient) { }

  /**
   * Track venue click/view
   */
  trackVenueClick(data: VenueClickData): Observable<AnalyticsResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AnalyticsResponse>(
      `${this.apiUrl}/track-venue-click`,
      data,
      { headers }
    );
  }

  /**
   * Generate a unique session ID for the user's session
   */
  generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get device information
   */
  getDeviceInfo(): { userAgent: string; platform: string; browser: string; isMobile: boolean } {
    const userAgent = navigator.userAgent;
    
    // Detect if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Detect platform
    let platform = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      platform = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
    else if (userAgent.indexOf('Internet Explorer') > -1) browser = 'Internet Explorer';

    return { userAgent, platform, browser, isMobile };
  }

  /**
   * Get session ID from localStorage or create new one
   */
  getSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Check if analytics service is healthy
   */
  checkHealth(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}/health`);
  }

  /**
   * Get location details from coordinates using OpenStreetMap Nominatim API
   */
  reverseGeocode(lat: number, lng: number): Observable<any> {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`;
    
    const headers = new HttpHeaders({
      'User-Agent': 'EazyVenue-Analytics/1.0 (https://eazyvenue.com)' // Required by Nominatim API
    });

    console.log('Attempting reverse geocoding for coordinates:', lat, lng);

    return this.http.get<NominatimResponse>(nominatimUrl, { headers }).pipe(
      map(response => {
        console.log('Nominatim API response:', response);
        
        if (response && response.address) {
          const address = response.address;
          
          // Extract city with multiple fallbacks
          const city = address.city || 
                      address.town || 
                      address.village || 
                      address.municipality ||
                      address.suburb ||
                      address.neighbourhood ||
                      '';
          
          // Extract state with fallbacks
          const state = address.state || 
                       address.state_district || 
                       address.county ||
                       address.region ||
                       '';
          
          // Extract country
          const country = address.country || 'India';
          
          // Extract pincode
          const pincode = address.postcode || '';
          
          const result = {
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            pincode: pincode.trim()
          };
          
          console.log('Parsed location data:', result);
          return result;
        }
        
        console.warn('No address data in Nominatim response');
        return {
          city: '',
          state: '',
          country: 'India',
          pincode: ''
        };
      }),
      catchError(error => {
        console.error('Reverse geocoding failed:', error);
        // Return default values if geocoding fails
        return of({
          city: '',
          state: '',
          country: 'India',
          pincode: ''
        });
      })
    );
  }

  /**
   * Enhanced venue click tracking with reverse geocoding
   */
  trackVenueClickWithGeocode(data: VenueClickData): Observable<AnalyticsResponse> {
    // If location coordinates are provided but city/state/country are missing, perform reverse geocoding
    if (data.location && data.location.lat && data.location.lng && 
        (!data.location.city || !data.location.state || !data.location.country)) {
      
      return this.reverseGeocode(data.location.lat, data.location.lng).pipe(
        map(geocodeResult => {
          // Update location data with geocoded information
          data.location = {
            ...data.location,
            city: data.location.city || geocodeResult.city,
            state: data.location.state || geocodeResult.state,
            country: data.location.country || geocodeResult.country,
            pincode: data.location.pincode || geocodeResult.pincode
          };
          return data;
        }),
        // Switch to the tracking observable
        switchMap(updatedData => this.trackVenueClick(updatedData))
      );
    } else {
      // If no coordinates or location data is already complete, use regular tracking
      return this.trackVenueClick(data);
    }
  }
}
