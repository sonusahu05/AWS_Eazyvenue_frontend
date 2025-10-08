import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from '../../../services/token-storage.service';
import { switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Venue } from 'src/app/shared/models/venue.model';

declare var google: any;
const API_URL = environment.apiUrl + 'venue';
@Injectable({
    providedIn: 'root',
})
export class VenueService {
    // private baseUrl = 'http://localhost:3006/api';// adjust if needed
    private baseUrl = environment.apiUrl;// adjust if needed
getVenueByName(name: string): Observable<any> {
//   return this.http.get(`${this.baseUrl}/api/aisearch/name/${encodeURIComponent(name)}`);
    return this.http.get(`${this.baseUrl}aisearch/name/${encodeURIComponent(name)}`);
}


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
     * Upload menu PDF for a venue
     * @param venueId The ID of the venue
     * @param file The PDF file to upload
     */
    // uploadMenuPDF(venueId: string, file: File): Observable<any> {
    //     const formData = new FormData();
    //     formData.append('menuPDF', file);

    //     const headers = new HttpHeaders({
    //         'Authorization': `Bearer ${this.authtoken}`
    //     });

    //     return this.http.post(`${API_URL}/uploadMenuPDF/${venueId}`, formData, {
    //         headers
    //     });
    // }

    // /**
    //  * Get menu PDF URL for a venue
    //  * @param venueId The ID of the venue
    //  */
    // getMenuPDFUrl(venueId: string): Observable<any> {
    //     return this.http.get(`${API_URL}/${venueId}`, this.httpOptions)
    //         .pipe(
    //             switchMap((venue: any) => {
    //                 if (venue.menuPDF && venue.menuPDF.path) {
    //                     return of(`${environment.apiUrl}${venue.menuPDF.path}`);
    //                 }
    //                 return of(null);
    //             })
    //         );
    // }

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

    getGoogleReviews(placeName: string, cityName: string): Observable<any> {
    return new Observable(observer => {
        if (!isPlatformBrowser(this.platformId)) {
            observer.next({ result: { reviews: [], rating: 0 } });
            observer.complete();
            return;
        }

        // Ensure Google Maps is loaded
        this.loadGoogleMapsScript().then(() => {
            const service = new google.maps.places.PlacesService(document.createElement('div'));

            // Search for the place
            const request = {
                query: `${placeName} ${cityName}`,
                fields: ['place_id', 'name', 'rating', 'user_ratings_total']
            };

            service.findPlaceFromQuery(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const place = results[0];

                    // Get detailed information including reviews
                    const detailsRequest = {
                        placeId: place.place_id,
                        fields: ['reviews', 'rating', 'user_ratings_total']
                    };

                    service.getDetails(detailsRequest, (placeDetails, detailsStatus) => {
                        if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                            observer.next({
                                result: {
                                    reviews: placeDetails.reviews || [],
                                    rating: placeDetails.rating || 0,
                                    user_ratings_total: placeDetails.user_ratings_total || 0
                                }
                            });
                        } else {
                            observer.next({ result: { reviews: [], rating: 0, user_ratings_total: 0 } });
                        }
                        observer.complete();
                    });
                } else {
                    observer.next({ result: { reviews: [], rating: 0, user_ratings_total: 0 } });
                    observer.complete();
                }
            });
        }).catch(error => {
            console.error('Error loading Google Maps:', error);
            observer.next({ result: { reviews: [], rating: 0, user_ratings_total: 0 } });
            observer.complete();
        });
    });
}

// Make sure this method exists in your service
private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!isPlatformBrowser(this.platformId)) {
            resolve();
            return;
        }

        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        // script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject('Failed to load Google Maps script');

        document.head.appendChild(script);
    });
}

// Update your addReview method
addReview(venueId: string, review: any): Observable<any> {
    const reviewPayload = {
        reviewtitle: review.reviewtitle,
        reviewrating: review.reviewrating,
        reviewdescription: review.reviewdescription,
        venueId: venueId
    };

    return this.http.post<any>(
        `${API_URL}/${venueId}/reviews`,
        reviewPayload,
        this.httpOptions
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


    // private loadGoogleMapsScript(): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         // Check if we're in the browser
    //         if (!isPlatformBrowser(this.platformId)) {
    //             resolve();
    //             return;
    //         }

    //         if (typeof google !== 'undefined' && google.maps) {
    //             resolve();
    //             return;
    //         }

    //         const script = document.createElement('script');
    //         script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=geometry,places`;
    //         script.async = true;
    //         script.defer = true;

    //         script.onload = () => resolve();
    //         script.onerror = () => reject('Failed to load Google Maps script');

    //         document.head.appendChild(script);
    //     });
    // }

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
