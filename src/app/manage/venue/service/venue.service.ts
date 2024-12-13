/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from '../../../services/token-storage.service';
const API_URL = environment.apiUrl + 'venue';
@Injectable({
    providedIn: 'root',
})
export class VenueService {
    authtoken: string;
    private httpOptions;
    private httpWithoutAuthOptions;
    constructor(private http: HttpClient, private token: TokenStorageService) {
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

    private venueID = new BehaviorSubject('');
    _venueid = this.venueID.asObservable();
    passvenueID(val: any) {
        this.venueID.next(val);
    }
}
