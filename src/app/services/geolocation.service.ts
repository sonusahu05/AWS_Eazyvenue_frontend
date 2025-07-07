import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  address?: string;
  subarea?: string;
}

export interface VenueWithDistance {
  distance?: number;
  distanceText?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private userLocation: UserLocation | null = null;
  private readonly LOCATION_CACHE_KEY = 'user_location_cache';
  private readonly CACHE_DURATION = 300000; // 5 minutes in milliseconds

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.loadCachedLocation();
  }

  /**
   * Get user's current location using browser's geolocation API
   */
  async getUserLocation(forceRefresh: boolean = false, bypassDeniedCheck: boolean = false): Promise<UserLocation> {
    // Return null/reject early if not in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Geolocation is not available during server-side rendering');
    }

    // Check if we have valid cached location and not forcing refresh
    if (!forceRefresh && this.userLocation && this.isLocationCacheValid()) {
      return this.userLocation;
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location services are not supported by your browser'));
        return;
      }

      // Only check denied flag if not bypassing (for manual enable attempts)
      if (!bypassDeniedCheck && this.wasLocationDenied()) {
        reject(new Error('Location access was previously denied. Please enable location in your browser settings.'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000 // 1 minute cache for getCurrentPosition
      };

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out. Please try again.'));
      }, options.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);

          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          this.userLocation = location;
          this.saveCachedLocation(location);
          this.clearLocationDeniedFlag();
          resolve(location);
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage = 'Unable to get your location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              if (bypassDeniedCheck) {
                // User manually clicked enable but still denied
                errorMessage = 'Location access denied. To enable location:\n\n1. Click the location icon (🔒 or 🌐) in your browser\'s address bar\n2. Select "Allow" for location\n3. Refresh this page\n\nOr go to your browser settings and allow location for this site.';
              } else {
                errorMessage = 'Location access denied. Please allow location access and try again.';
              }
              this.setLocationDeniedFlag();
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An error occurred while getting your location. Please try again.';
          }

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Check if geolocation is supported and available
   */
  isGeolocationSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return 'geolocation' in navigator;
  }

  /**
   * Check if location permission is likely granted (best effort)
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'unsupported';
    }

    if (!this.isGeolocationSupported()) {
      return 'unsupported';
    }

    // Check if permissions API is available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state as 'granted' | 'denied' | 'prompt';
      } catch (error) {
        console.log('Permissions API not fully supported:', error);
      }
    }

    // Fallback: check if we have cached location
    if (this.getCachedUserLocation()) {
      return 'granted';
    }

    // Check if location was previously denied
    if (this.wasLocationDenied()) {
      return 'denied';
    }

    return 'prompt';
  }

  /**
   * Save location to localStorage with timestamp
   */
  private saveCachedLocation(location: UserLocation): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      const cacheData = {
        ...location,
        timestamp: Date.now()
      };
      localStorage.setItem(this.LOCATION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.log('Could not save location to cache:', error);
    }
  }

  /**
   * Load location from localStorage
   */
  private loadCachedLocation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      const cached = localStorage.getItem(this.LOCATION_CACHE_KEY);
      if (cached) {
        const location = JSON.parse(cached) as UserLocation;
        if (this.isLocationCacheValid(location)) {
          this.userLocation = location;
        } else {
          // Remove expired cache
          localStorage.removeItem(this.LOCATION_CACHE_KEY);
        }
      }
    } catch (error) {
      console.log('Could not load cached location:', error);
      localStorage.removeItem(this.LOCATION_CACHE_KEY);
    }
  }

  /**
   * Check if cached location is still valid
   */
  private isLocationCacheValid(location?: UserLocation): boolean {
    const loc = location || this.userLocation;
    if (!loc || !loc.timestamp) return false;

    const now = Date.now();
    return (now - loc.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Set flag that location was denied
   */
  private setLocationDeniedFlag(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      localStorage.setItem('location_denied', 'true');
    } catch (error) {
      console.log('Could not set location denied flag:', error);
    }
  }

  /**
   * Clear location denied flag
   */
  private clearLocationDeniedFlag(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      localStorage.removeItem('location_denied');
    } catch (error) {
      console.log('Could not clear location denied flag:', error);
    }
  }

  /**
   * Check if location was previously denied
   */
  private wasLocationDenied(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    try {
      return localStorage.getItem('location_denied') === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance}km away`;
    }
  }

  addDistanceToVenues(venues: any[], userLocation: UserLocation): VenueWithDistance[] {
    return venues.map(venue => {
      if (venue.lat && venue.lng) {
        const distance = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          venue.lat,
          venue.lng
        );

        return {
          ...venue,
          distance: distance,
          distanceText: this.formatDistance(distance)
        };
      }

      return { ...venue, distance: Infinity, distanceText: 'Distance unknown' };
    });
  }

  filterVenuesByDistance(venues: VenueWithDistance[], maxDistance: number): VenueWithDistance[] {
    return venues.filter(venue => venue.distance !== undefined && venue.distance <= maxDistance);
  }

  sortVenuesByDistance(venues: VenueWithDistance[]): VenueWithDistance[] {
    return venues.sort((a, b) => {
      const distanceA = a.distance !== undefined ? a.distance : Infinity;
      const distanceB = b.distance !== undefined ? b.distance : Infinity;
      return distanceA - distanceB;
    });
  }

  getVenuesWithDistanceFilter(venues: any[], userLocation: UserLocation): {
    venues: VenueWithDistance[];
    radiusUsed: number;
    totalFound: number;
  } {
    const venuesWithDistance = this.addDistanceToVenues(venues, userLocation);
    const distanceRanges = [5, 10, 25, 50, 100];

    for (const radius of distanceRanges) {
      const filteredVenues = this.filterVenuesByDistance(venuesWithDistance, radius);

      if (filteredVenues.length >= 20 || radius === distanceRanges[distanceRanges.length - 1]) {
        return {
          venues: this.sortVenuesByDistance(filteredVenues),
          radiusUsed: radius,
          totalFound: filteredVenues.length
        };
      }
    }

    return {
      venues: this.sortVenuesByDistance(venuesWithDistance),
      radiusUsed: 0,
      totalFound: venuesWithDistance.length
    };
  }

  getCachedUserLocation(): UserLocation | null {
    return this.userLocation && this.isLocationCacheValid() ? this.userLocation : null;
  }

  clearCachedLocation(): void {
    this.userLocation = null;
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      localStorage.removeItem(this.LOCATION_CACHE_KEY);
      localStorage.removeItem('location_denied');
    } catch (error) {
      console.log('Could not clear location cache:', error);
    }
  }

  /**
   * Enhance location with address details using OpenStreetMap Nominatim API
   */
  async enhanceLocationWithAddress(location: UserLocation): Promise<UserLocation> {
    if (!isPlatformBrowser(this.platformId) || !location.lat || !location.lng) {
      return location;
    }

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1&zoom=16`;
      
      const headers = new HttpHeaders({
        'User-Agent': 'EazyVenue-App/1.0 (https://eazyvenue.com)'
      });

      const response: any = await this.http.get(nominatimUrl, { headers }).toPromise();
      
      if (response && response.address) {
        const address = response.address;
        
        return {
          ...location,
          city: address.city || address.town || address.village || address.municipality || '',
          subarea: address.suburb || address.neighbourhood || address.quarter || address.residential || '',
          state: address.state || address.state_district || address.county || '',
          country: address.country || 'India',
          postalCode: address.postcode || '',
          address: response.display_name || ''
        };
      }
    } catch (error) {
      console.warn('Failed to get address details from OpenStreetMap:', error);
    }

    return location;
  }

  /**
   * Get user location with enhanced address information
   */
  async getUserLocationWithAddress(forceRefresh: boolean = false, bypassDeniedCheck: boolean = false): Promise<UserLocation> {
    const location = await this.getUserLocation(forceRefresh, bypassDeniedCheck);
    return await this.enhanceLocationWithAddress(location);
  }
}