import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface HotDatesData {
  date: string;
  bookingCount: number;
  enquiryCount: number;
  clickCount: number;
  heatIntensity: number; // 0-1 scale for visualization
}

export interface EngagementFunnelData {
  totalViews: number;
  dateFiltered: number;
  occasionSelected: number;
  enquirySent: number;
  clickedReserved: number;
  clickedBookNow: number;
  madePayment: number;
  conversionRates: {
    viewToEnquiry: number;
    enquiryToReserved: number;
    reservedToBooking: number;
    bookingToPayment: number;
  };
}

export interface LeadData {
  _id: string;
  userName?: string;
  userEmail?: string;
  userContact?: string;
  venueId: string;
  venueName: string;
  totalClicks: number;
  lastVisit: string;
  engagement: {
    timeSpentSeconds: number;
    qualityScore: number;
    actions: {
      sendEnquiryClicked: boolean;
      clickedOnReserved: boolean;
      clickedOnBookNow: boolean;
      madePayment: boolean;
      selectedOccasion?: string;
      startFilterDate?: string;
      endFilterDate?: string;
      guestCount?: string;
      foodMenuType?: string;
      weddingDecorType?: string;
    };
  };
  leadScore: number; // Calculated lead quality score
  leadStatus: 'hot' | 'warm' | 'cold';
}

export interface PopularDatesData {
  date: string;
  popularity: number;
  occasions: string[];
  averageGuestCount: number;
}

export interface VenueInsightsDashboard {
  venueId: string;
  venueName: string;
  hotDates: HotDatesData[];
  popularDates: PopularDatesData[];
  engagementFunnel: EngagementFunnelData;
  leads: LeadData[];
  totalStats: {
    totalViews: number;
    totalLeads: number;
    conversionRate: number;
    averageTimeSpent: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VenueAnalyticsService {
  private apiUrl = environment.apiUrl + 'analytics/geography';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Get venue clicks analytics from analytics.geography.venue_clicks collection
   */
  getVenueClicksAnalytics(venueId?: string, params?: any): Observable<any> {
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

    const endpoint = venueId 
      ? `${this.apiUrl}/venue-clicks/${venueId}${queryParams}`
      : `${this.apiUrl}/venue-clicks${queryParams}`;

    return this.http.get<any>(endpoint, { headers });
  }

  /**
   * Get aggregated analytics data from venue clicks collection
   */
  getVenueClicksAggregatedAnalytics(venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.groupBy) searchParams.append('groupBy', params.groupBy);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
      ? `${this.apiUrl}/venue-clicks-aggregated/${venueId}${queryParams}`
      : `${this.apiUrl}/venue-clicks-aggregated${queryParams}`;

    return this.http.get<any>(endpoint, { headers });
  }

  /**
   * Get hot dates analytics - shows which dates are trending for bookings
   */
  
// And update the getHotDatesAnalytics method:
getHotDatesAnalytics(venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
        const searchParams = new URLSearchParams();
        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
        ? `${this.apiUrl}/hot-dates/${venueId}${queryParams}`
        : `${this.apiUrl}/hot-dates${queryParams}`;

    console.log('🌐 Hot dates API endpoint:', endpoint);
    
    return this.http.get<any>(endpoint, { headers });
}

  /**
   * Get engagement funnel analytics
   */
  getEngagementFunnel(venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
      ? `${this.apiUrl}/engagement-funnel/${venueId}${queryParams}`
      : `${this.apiUrl}/engagement-funnel${queryParams}`;

    return this.http.get<any>(endpoint, { headers });
  }

  /**
   * Get leads with engagement data
   */
  getLeadsAnalytics(venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.leadStatus) searchParams.append('leadStatus', params.leadStatus);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.skip) searchParams.append('skip', params.skip.toString());
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
      ? `${this.apiUrl}/leads/${venueId}${queryParams}`
      : `${this.apiUrl}/leads${queryParams}`;

    return this.http.get<any>(endpoint, { headers });
  }

  /**
   * Get popular booking dates analytics
   */
  getPopularDatesAnalytics(venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.occasion) searchParams.append('occasion', params.occasion);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
      ? `${this.apiUrl}/popular-dates/${venueId}${queryParams}`
      : `${this.apiUrl}/popular-dates${queryParams}`;

    return this.http.get<any>(endpoint, { headers });
  }

  /**
   * Get comprehensive venue insights dashboard
   */
  getVenueInsightsDashboard(venueId: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    return this.http.get<any>(
      `${this.apiUrl}/venue-insights-dashboard/${venueId}${queryParams}`,
      { headers }
    );
  }

  /**
   * Get user engagement timeline for a specific lead
   */
  getUserEngagementTimeline(userId: string, venueId?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (venueId) {
      queryParams = `?venueId=${venueId}`;
    }

    return this.http.get<any>(
      `${this.apiUrl}/user-timeline/${userId}${queryParams}`,
      { headers }
    );
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(type: string, venueId?: string, params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          searchParams.append(key, params[key].toString());
        }
      });
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }

    const endpoint = venueId 
      ? `${this.apiUrl}/export/${type}/${venueId}${queryParams}`
      : `${this.apiUrl}/export/${type}${queryParams}`;

    return this.http.get(endpoint, { 
      headers,
      responseType: 'blob'
    });
  }
}