// Alternative approach - use the public tracking endpoint for basic analytics
// and implement venue-owner filtering on existing data

import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { VenueService } from '../manage/venue/service/venue.service';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class VenueOwnerAnalyticsService {
  
  constructor(
    private venueService: VenueService,
    private analyticsService: AnalyticsService
  ) { }
  
  /**
   * Get analytics for venues owned by current user
   */
  getVenueOwnerAnalytics(userEmail: string): Observable<any> {
    // 1. Get user's venues
    const venuesQuery = '?admin=true&pageSize=1000&pageNumber=1&filterByDisable=false';
    
    return this.venueService.getVenueListForFilter(venuesQuery).pipe(
      map(venueData => {
        const allVenues = venueData.data.items || [];
        
        // Filter venues by user email
        const userVenues = allVenues.filter(venue => {
          if (!venue.email) return false;
          return venue.email.trim().toLowerCase() === userEmail.toLowerCase();
        });
        
        // Return basic analytics data structure
        return {
          totalVenues: userVenues.length,
          venueList: userVenues.map(venue => ({
            id: venue.id || venue._id,
            name: venue.name,
            email: venue.email,
            status: venue.status,
            disable: venue.disable,
            // Add more fields as needed
          }))
        };
      })
    );
  }
}
