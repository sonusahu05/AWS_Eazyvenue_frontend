import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
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

  constructor() { }

  /**
   * Get user's current location using browser's geolocation API
   */
  async getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
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

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance}km away`;
    }
  }

  /**
   * Add distance information to venues array
   */
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

  /**
   * Filter venues by distance radius
   */
  filterVenuesByDistance(venues: VenueWithDistance[], maxDistance: number): VenueWithDistance[] {
    return venues.filter(venue => venue.distance !== undefined && venue.distance <= maxDistance);
  }

  /**
   * Sort venues by distance (nearest first)
   */
  sortVenuesByDistance(venues: VenueWithDistance[]): VenueWithDistance[] {
    return venues.sort((a, b) => {
      const distanceA = a.distance !== undefined ? a.distance : Infinity;
      const distanceB = b.distance !== undefined ? b.distance : Infinity;
      return distanceA - distanceB;
    });
  }

  /**
   * Get venues within different distance ranges with fallback logic
   */
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

    // Fallback: return all venues sorted by distance
    return {
      venues: this.sortVenuesByDistance(venuesWithDistance),
      radiusUsed: 0, // Indicates no filter applied
      totalFound: venuesWithDistance.length
    };
  }

  /**
   * Get cached user location
   */
  getCachedUserLocation(): UserLocation | null {
    return this.userLocation;
  }

  /**
   * Clear cached location
   */
  clearCachedLocation(): void {
    this.userLocation = null;
  }
}