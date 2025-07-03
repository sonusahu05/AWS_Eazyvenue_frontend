import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BannerService } from './banner.service';
import { SsrStateService } from './ssr-state.service';

export interface HomeData {
  banners: any[];
  venues?: any[];
  // Add other data types as needed
}

@Injectable({
  providedIn: 'root'
})
export class HomeDataResolver implements Resolve<HomeData> {
  
  constructor(
    private bannerService: BannerService,
    private ssrStateService: SsrStateService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HomeData> {
    // Check if we already have cached data in SSR state
    const cachedBanners = this.ssrStateService.getState('bannerList');
    
    if (cachedBanners && Array.isArray(cachedBanners)) {
      // If we have cached data, use it
      return of({
        banners: cachedBanners,
        venues: []
      });
    }

    // Otherwise, fetch the data
    const bannerRequest = this.bannerService.getbannerList('').pipe(
      map(response => {
        // Extract the items array from the response
        return response?.data?.items || response?.items || [];
      }),
      catchError(error => {
        console.error('Error fetching banners in resolver:', error);
        return of([]); // Return empty array on error
      })
    );

    // You can add more data requests here using forkJoin
    return forkJoin({
      banners: bannerRequest,
      // venues: this.venueService.getVenues().pipe(catchError(() => of([]))),
      // Add other data requests here
    }).pipe(
      map((data: any) => {
        // Cache the data for SSR state transfer
        this.ssrStateService.setState('bannerList', data.banners);
        
        return {
          banners: data.banners || [],
          venues: data.venues || []
        };
      }),
      catchError(error => {
        console.error('Error in HomeDataResolver:', error);
        // Return empty data structure on error
        return of({
          banners: [],
          venues: []
        });
      })
    );
  }
}
