import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from '../../../services/token-storage.service';
import { switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
declare var google: any;
const API_URL = environment.apiUrl + 'venue';
@Injectable({
    providedIn: 'root',
})
export class VenueService {
    authtoken: string;
    private httpOptions;
    private httpWithoutAuthOptions;
    private googleMapsApiKey = environment.googleMapsApiKey;
    constructor(private http: HttpClient, private token: TokenStorageService, @Inject(PLATFORM_ID) private platformId: Object) {
        this.authtoken = this.token.getToken();
        this.httpOptions = {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${this.authtoken}`),
        };
        this.httpWithoutAuthOptions = {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        };
    }

    getvenueList(query): Observable<any> {
        return this.http.get<any>(API_URL + query, this.httpOptions);
    }
    getvenue(id: string) {
        return this.http.get<any>(`${API_URL}/${id}`, this.httpOptions);
    }
    addVenue(venuedata) {
        return this.http.post<any>(API_URL, venuedata, this.httpOptions);
    }
    updateVenueStatus(venueId: string, statusData: any): Observable<any> {
        return this.http.put(`${API_URL}/${venueId}/status`, statusData, this.httpOptions);
    }

    /**
     * Get venues pending approval
     */
    getPendingApprovalVenues(): Observable<any> {
        const query = '?filterByPendingApproval=true&filterByDisable=false&sortBy=createdAt&orderBy=DESC';
        return this.getVenueListForFilter(query);
    }

    /**
     * Send notification to venue owner about status change
     */
    sendVenueStatusNotification(notificationData: any): Observable<any> {
        return this.http.post(
            environment.apiUrl + 'notification/venue-status',
            notificationData,
            this.httpOptions
        );
    }

    /**
     * Get venue statistics for dashboard
     */
    getVenueStatistics(): Observable<any> {
        return this.http.get(API_URL + '/statistics', this.httpOptions);
    }

    uploadVenueCsv(venuedata) {
        return this.http.post<any>(
            API_URL + '/uploadCSV',
            venuedata,
            this.httpOptions
        );
    }
    updateVenue(id, venuedata): Observable<any> {
        return this.http.put(API_URL + '/' + id, venuedata, this.httpOptions);
    }

    getVenueListWithoutAuth(query): Observable<any> {
        return this.http.get<any>(
            API_URL + '/v1?' + query,
            this.httpWithoutAuthOptions
        );
    }
    getVenueListAllVenues(): Observable<any> {
        return this.http.get<any>(
            API_URL + '/allVenues',
            this.httpWithoutAuthOptions
        );
    }

    filterDisabledVenues(venues: any[]): any[] {
        return venues.filter((venue) => !venue.disable);
    }
    getVenueListForFilter(query): Observable<any> {
        return this.http.get<any>(
            API_URL + '/venuesByFilter' + query,
            this.httpWithoutAuthOptions
        );
    }
    getMinMaxVenuePrice(query): Observable<any> {
        return this.http.get<any>(
            API_URL + '/minMaxVenuePrice' + query,
            this.httpWithoutAuthOptions
        );
    }
    getAmenitiesList(): Observable<any> {
        return this.http.get<any>(
            API_URL + '/amanetiesList',
            this.httpWithoutAuthOptions
        );
    }
    getHomeMenuFilter(): Observable<any> {
        return this.http.get<any>(
            API_URL + '/homeMenuList',
            this.httpWithoutAuthOptions
        );
    }
    getOccastionCategoryList(): Observable<any> {
        return this.http.get<any>(
            API_URL + '/occasionCategoryList',
            this.httpWithoutAuthOptions
        );
    }

    addReview(venueId: string, review: any): Observable<any> {
        return this.http.post<any>(
            `${API_URL}s/${venueId}/reviews`,
            review,
            this.httpOptions
        );
    }

    // Add to your venue service
getGoogleReviews(placeName: string, cityName: string): Observable<any> {
    const query = `${placeName} ${cityName}`;
    return this.http.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${this.googleMapsApiKey}`)
        .pipe(
            switchMap((response: any) => {
                if (response.candidates && response.candidates.length > 0) {
                    const placeId = response.candidates[0].place_id;
                    return this.http.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${this.googleMapsApiKey}`);
                }
                return of({ result: { reviews: [], rating: 0 } });
            })
        );
}

    getVenueDetails(id: string) {
        return this.http.get<any>(
            `${API_URL}/v1/${id}`,
            this.httpWithoutAuthOptions
        );
    }
    getVenueDetailsByMeta(metaUrl: string) {
        console.log(metaUrl);

        return this.http.get<any>(
            `${API_URL}/bymeta?filterByMetaUrl=${metaUrl}`,
            this.httpWithoutAuthOptions
        );
    }

    saveCustomAmount(requestData: { email: string; amount: number }): Observable<any> {
        return this.http.post<any>(
            environment.apiUrl + 'request-custom-amount',
            requestData,
            this.httpOptions
        );
    }

    private venueID = new BehaviorSubject('');
    _venueid = this.venueID.asObservable();
    passvenueID(val: any) {
        this.venueID.next(val);
    }
    getGeocodedLocation(address: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // Check if Google Maps is loaded
            if (typeof google === 'undefined' || !google.maps) {
                // Dynamically load Google Maps if not already loaded
                this.loadGoogleMapsScript().then(() => {
                    this.performGeocode(address, resolve, reject);
                }).catch(reject);
            } else {
                this.performGeocode(address, resolve, reject);
            }
        });
    }


    private loadGoogleMapsScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if we're in the browser
            if (!isPlatformBrowser(this.platformId)) {
                resolve();
                return;
            }
            
            if (typeof google !== 'undefined' && google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=geometry,places`;
            script.async = true;
            script.defer = true;

            script.onload = () => resolve();
            script.onerror = () => reject('Failed to load Google Maps script');

            document.head.appendChild(script);
        });
    }

    /**
     * Perform geocoding operation
     */
    private performGeocode(address: string, resolve: Function, reject: Function): void {
        if (!isPlatformBrowser(this.platformId)) {
            reject('Geocoding is not available in SSR');
            return;
        }
        
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                resolve({
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                    formattedAddress: results[0].formatted_address
                });
            } else {
                reject('Geocoding failed: ' + status);
            }
        });
    }

    /**
     * Generate Google Maps URL for sharing
     */
    generateMapsUrl(venueName: string, address: string): string {
        const encodedAddress = encodeURIComponent(address);
        const encodedVenueName = encodeURIComponent(venueName);
        return `https://www.google.com/maps/search/?api=1&query=${encodedVenueName}+${encodedAddress}`;
    }

    /**
     * Generate WhatsApp share message with venue details and map link
     */
    generateWhatsAppMessage(venueDetails: any, mapUrl: string): string {
        const message = `🏛️ *${venueDetails.name}*\n\n` +
            `📍 Location: Near ${venueDetails.subarea}, ${venueDetails.cityname}, ${venueDetails.statename}\n` +
            `💰 Starting Price: ₹${venueDetails.minVenuePrice || 'Contact for pricing'}\n` +
            `👥 Capacity: ${venueDetails.capacity} people\n` +
            `⭐ Rating: ${venueDetails.googleRating}/5\n\n` +
            `📱 Book now at: https://eazyvenue.com\n` +
            `🗺️ View on Maps: ${mapUrl}`;

        return encodeURIComponent(message);
    }

    /**
     * Open WhatsApp with pre-filled message
     */
    shareOnWhatsApp(venueDetails: any, mapUrl: string): void {
        const message = this.generateWhatsAppMessage(venueDetails, mapUrl);
        const whatsappUrl = `https://wa.me/?text=${message}`;
        if (isPlatformBrowser(this.platformId)) {
            window.open(whatsappUrl, '_blank');
        }
    }

    /**
     * Get competition analysis for a venue
     */
    getCompetitionAnalysis(venueId: string, params: any): Observable<any> {
        const queryParams = new URLSearchParams(params).toString();
        return this.http.get<any>(
            `${API_URL}/competition/${venueId}?${queryParams}`,
            this.httpOptions
        );
    }
}
