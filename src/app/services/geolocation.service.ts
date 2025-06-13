import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  getLocationDetails(lat: number, lng: number): Observable<any> {
    // Using free OpenStreetMap Nominatim API for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

    return this.http.get(url).pipe(
      map((response: any) => {
        const address = response.address || {};
        return {
          city: address.city || address.town || address.village || address.state_district || '',
          subarea: address.suburb || address.neighbourhood || address.hamlet || address.residential || '',
          state: address.state || '',
          country: address.country || '',
          full_address: response.display_name || ''
        };
      }),
      catchError(error => {
        console.error('Error getting location details:', error);
        return of({
          city: '',
          subarea: '',
          state: '',
          country: '',
          full_address: ''
        });
      })
    );
  }

  // Alternative using ipapi.co (also free)
  getLocationByIP(): Observable<any> {
    return this.http.get('https://ipapi.co/json/').pipe(
      map((response: any) => ({
        city: response.city || '',
        subarea: response.region || '',
        state: response.region || '',
        country: response.country_name || '',
        latitude: response.latitude,
        longitude: response.longitude
      })),
      catchError(error => {
        console.error('Error getting IP location:', error);
        return of({
          city: '',
          subarea: '',
          state: '',
          country: ''
        });
      })
    );
  }
}