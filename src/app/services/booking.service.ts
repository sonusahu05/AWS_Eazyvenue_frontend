import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingData {
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userContact: string;
  userEmail: string;
  details: {
    isBookedByAdmin: boolean;
    startFilterDate: string;
    endFilterDate: string;
    eventDuration?: string;
    occasion: string;
    weddingDecorType?: string;
    weddingDecorPrice?: number;
    foodMenuType?: string;
    foodMenuPrice?: number;
    foodMenuPlate?: string;
    guestCount: string;
    // Analytics tracking fields
    sendEnquiryClicked?: boolean;
    clickedOnReserved?: boolean;
    clickedOnBookNow?: boolean;
    madePayment?: boolean;
    // Additional booking details
    bookingType?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    totalAmount?: number;
    bookingNotes?: string;
  };
}

export interface BlockDatesData {
  venueId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}bookings`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Create a new booking
   */
  createBooking(bookingData: BookingData): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<BookingResponse>(`${this.apiUrl}/create`, bookingData, { headers });
  }

  /**
   * Create booking from frontend (no auth required, uses different data structure)
   */
  createBookingFromFrontend(frontendBookingData: any): Observable<BookingResponse> {
    // No auth headers needed for frontend booking endpoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<BookingResponse>(`${this.apiUrl}/create-from-frontend`, frontendBookingData, { headers });
  }

  /**
   * Get venue bookings for calendar view
   */
  getVenueBookings(venueId: string, params?: any): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    let queryParams = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.status) searchParams.append('status', params.status);
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<BookingResponse>(`${this.apiUrl}/venue/${venueId}${queryParams}`, { headers });
  }

  /**
   * Block dates for maintenance or other purposes
   */
  blockDates(blockData: BlockDatesData): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<BookingResponse>(`${this.apiUrl}/block-dates`, blockData, { headers });
  }

  /**
   * Update booking
   */
  updateBooking(bookingId: string, updateData: any): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<BookingResponse>(`${this.apiUrl}/${bookingId}`, updateData, { headers });
  }

  /**
   * Delete/Cancel booking
   */
  deleteBooking(bookingId: string): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    return this.http.delete<BookingResponse>(`${this.apiUrl}/${bookingId}`, { headers });
  }

  /**
   * Get all venues for admin (venue selection dropdown)
   */
  getVenuesForAdmin(): Observable<BookingResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<BookingResponse>(`${this.apiUrl}/admin/venues`, { headers });
  }

  /**
   * Get user bookings (for my-profile page)
   */
  getUserBookings(userId: string, params?: any): Observable<BookingResponse> {
    // No auth headers needed for user booking history
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.filterByStatus) searchParams.append('filterByStatus', params.filterByStatus);
      if (params.filterByDisable) searchParams.append('filterByDisable', params.filterByDisable);
      if (params.filterByOrderType) searchParams.append('filterByOrderType', params.filterByOrderType);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      queryParams = searchParams.toString() ? '?' + searchParams.toString() : '';
    }
    
    return this.http.get<BookingResponse>(`${this.apiUrl}/user/${userId}${queryParams}`, { headers });
  }

  /**
   * Check for booking conflicts for a venue on specific dates
   */
  checkBookingConflicts(params: {venueId: string, startDate: string, endDate: string}): Observable<BookingResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('venueId', params.venueId);
    searchParams.append('startDate', params.startDate);
    searchParams.append('endDate', params.endDate);
    
    const queryParams = searchParams.toString();
    
    // Using GET request to fetch venue bookings and check conflicts on frontend
    // This reuses the existing getVenueBookings endpoint with date filters
    return this.getVenueBookings(params.venueId, {
      startDate: params.startDate,
      endDate: params.endDate
    });
  }
}
