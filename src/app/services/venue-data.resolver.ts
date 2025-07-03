import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VenueService } from '../manage/venue/service/venue.service';
import { SsrStateService } from './ssr-state.service';

export interface VenueData {
  venues: any[];
  categories: any[];
  totalCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VenueDataResolver implements Resolve<VenueData> {
  
  constructor(
    private venueService: VenueService,
    private ssrStateService: SsrStateService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VenueData> {
    // Check if we already have cached data in SSR state
    const cachedVenues = this.ssrStateService.getState('venueList');
    const cachedCategories = this.ssrStateService.getState('categoryList');
    
    if (cachedVenues && Array.isArray(cachedVenues)) {
      // If we have cached data, use it
      return of({
        venues: cachedVenues,
        categories: Array.isArray(cachedCategories) ? cachedCategories : []
      });
    }

    // If we need to implement venue fetching, we would do it here
    // For now, return empty data to avoid errors
    return of({
      venues: [],
      categories: []
    }).pipe(
      map((data: VenueData) => {
        // Cache the data for SSR state transfer
        this.ssrStateService.setState('venueList', data.venues);
        this.ssrStateService.setState('categoryList', data.categories);
        
        return data;
      }),
      catchError(error => {
        console.error('Error in VenueDataResolver:', error);
        // Return empty data structure on error
        return of({
          venues: [],
          categories: []
        });
      })
    );
  }
}
