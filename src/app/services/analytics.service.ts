import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

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
    subarea?: string;
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
    quarter?: string;
    residential?: string;
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

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

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
                      '';
          
          // Extract subarea with multiple fallbacks
          const subarea = address.suburb ||
                         address.neighbourhood ||
                         address.quarter ||
                         address.residential ||
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
            subarea: subarea.trim(),
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
          subarea: '',
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
          subarea: '',
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
    // If location coordinates are provided but city/state/country/subarea are missing, perform reverse geocoding
    if (data.location && data.location.lat && data.location.lng && 
        (!data.location.city || !data.location.state || !data.location.country || !data.location.subarea)) {
      
      return this.reverseGeocode(data.location.lat, data.location.lng).pipe(
        map(geocodeResult => {
          // Update location data with geocoded information
          data.location = {
            ...data.location,
            city: data.location.city || geocodeResult.city,
            subarea: data.location.subarea || geocodeResult.subarea,
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

  /**
   * Get overview analytics stats (Admin only)
   */
  getOverviewStats(params?: any): Observable<AnalyticsResponse> {
    console.log('📊 ANALYTICS: Getting overview stats with params:', params);
    
    const roleCheck = this.checkUserRole();
    console.log('📊 ANALYTICS: Role check result:', roleCheck);
    
    if (!roleCheck.hasAdminAccess) {
      console.warn('📊 ANALYTICS: User does not have admin access. Current role:', roleCheck.userRole);
    }
    
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    const url = `${this.apiUrl}/stats/overview${queryParams}`;
    console.log('📊 ANALYTICS: Making request to:', url);
    console.log('📊 ANALYTICS: Headers:', headers.keys());
    
    return this.http.get<AnalyticsResponse>(url, { headers }).pipe(
      catchError(error => {
        console.error('📊 ANALYTICS: Overview stats error:', error);
        console.error('📊 ANALYTICS: Error status:', error.status);
        console.error('📊 ANALYTICS: Error message:', error.message);
        console.error('📊 ANALYTICS: Error details:', error.error);
        
        if (error.status === 403) {
          console.error('📊 ANALYTICS: 403 Unauthorized - Check user role and token');
          console.error('📊 ANALYTICS: Current user role:', roleCheck.userRole);
          console.error('📊 ANALYTICS: Required role: admin');
        }
        
        return throwError(error);
      })
    );
  }

  /**
   * Get popular venues (Admin only)
   */
  getPopularVenues(params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/popular-venues${queryParams}`,
      { headers }
    );
  }

  /**
   * Get device analytics (Admin only)
   */
  getDeviceAnalytics(params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/device-analytics${queryParams}`,
      { headers }
    );
  }

  /**
   * Get venue insights (Admin only)
   */
  getVenueInsights(venueId: string, params?: any): Observable<AnalyticsResponse> {
    console.log('📊 ANALYTICS: Getting venue insights for:', venueId, 'with params:', params);
    
    const roleCheck = this.checkUserRole();
    if (!roleCheck.hasAdminAccess) {
      console.warn('📊 ANALYTICS: User does not have admin access for venue insights. Current role:', roleCheck.userRole);
    }
    
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    const url = `${this.apiUrl}/venue-insights/${venueId}${queryParams}`;
    console.log('📊 ANALYTICS: Making venue insights request to:', url);
    
    return this.http.get<AnalyticsResponse>(url, { headers }).pipe(
      catchError(error => {
        console.error('📊 ANALYTICS: Venue insights error:', error);
        if (error.status === 403) {
          console.error('📊 ANALYTICS: 403 Unauthorized for venue insights - Check user role and token');
        }
        return throwError(error);
      })
    );
  }

  /**
   * Get venue clicks history (Admin only)
   */
  getVenueClicks(venueId: string, params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.skip) searchParams.append('skip', params.skip.toString());
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/venue-clicks/${venueId}${queryParams}`,
      { headers }
    );
  }

  /**
   * Update venue insights (Admin only)
   */
  updateVenueInsights(venueId: string): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<AnalyticsResponse>(
      `${this.apiUrl}/update-venue-insights/${venueId}`,
      {},
      { headers }
    );
  }

  /**
   * Get geographic distribution for a venue (Admin only)
   */
  getGeographicDistribution(venueId: string, params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/geographic-distribution/${venueId}${queryParams}`,
      { headers }
    );
  }

  /**
   * Get timeline analytics
   */
  getTimelineAnalytics(params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/timeline${queryParams}`,
      { headers }
    );
  }

  /**
   * Get top subareas analytics
   */
  getTopSubareas(params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/top-subareas${queryParams}`,
      { headers }
    );
  }

  /**
   * Get user click details for a venue
   */
  getUserClickDetails(venueId: string, params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/user-clicks/${venueId}${queryParams}`,
      { headers }
    );
  }

  /**
   * Check if user has admin access
   */
  checkUserRole(): { hasAdminAccess: boolean, userRole: string, userEmail: string } {
    const userData = this.tokenStorage.getUser();
    console.log('👤 ANALYTICS: User data:', userData);
    
    // Check both possible role fields based on JWT payload structure
    const role = userData?.role || userData?.userdata?.role;
    const rolename = userData?.rolename || userData?.userdata?.rolename;
    const email = userData?.email || userData?.userdata?.email;
    
    // Admin check - check both 'admin' role and 'rolename'
    const hasAdminAccess = role === 'admin' || rolename === 'admin';
    
    console.log('👤 ANALYTICS: User role check:', {
      hasAdminAccess,
      role,
      rolename,
      email,
      fullUserData: userData
    });
    
    return { 
      hasAdminAccess, 
      userRole: role || rolename || 'unknown', 
      userEmail: email || 'unknown' 
    };
  }

  /**
   * Get authentication headers for admin API calls
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    console.log('🔐 ANALYTICS: Getting auth token:', token ? 'Token found' : 'No token found');
    
    if (!token) {
      console.error('🔐 ANALYTICS: No authentication token available');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Check if user has venue owner access (not admin but has venue access)
   */
  checkVenueOwnerAccess(): { isVenueOwner: boolean, venueName: string, userRole: string } {
    const userData = this.tokenStorage.getUser();
    
    const role = userData?.role || userData?.userdata?.role;
    const rolename = userData?.rolename || userData?.userdata?.rolename;
    const venueName = userData?.name || userData?.userdata?.name;
    
    // Venue owner is someone who is not admin but has a venue name
    const isVenueOwner = (role !== 'admin' && rolename !== 'admin') && venueName;
    
    return { 
      isVenueOwner: !!isVenueOwner, 
      venueName: venueName || '', 
      userRole: role || rolename || 'unknown' 
    };
  }

  /**
   * Get venue-specific timeline analytics
   */
  getVenueTimelineAnalytics(venueId: string, params?: any): Observable<AnalyticsResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/stats/venue-timeline/${venueId}${queryParams}`,
      { headers }
    );
  }
}
