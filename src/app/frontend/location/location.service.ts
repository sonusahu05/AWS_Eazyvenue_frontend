import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getLocationDataFromCordinates(latitude, longitude): Observable<any> {
    return this.http.get<any>(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
  }
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      // Check if we're in browser environment before accessing navigator
      if (!isPlatformBrowser(this.platformId)) {
        reject('Geolocation is not available during server-side rendering.');
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position) {
              let lat = position.coords.latitude;
              let lng = position.coords.longitude;
              this.getLocationDataFromCordinates(lat, lng).subscribe(res => {
                resolve(res)
              }, err => {
                reject(err)
              })
            }
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }
}
