import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class EventPlannerService {
    constructor(private http: HttpClient) { }

    getEventPlannerList(query): Observable<any> {
        return this.http.get(USER_API + "eventplanner" + query);
    }
    getEventPlannerListWithoutAuth(query): Observable<any> {
        return this.http.get(USER_API + "eventplanner/v1?" + query);
    }

    getEventPlannerDetails(id): Observable<any> {
        return this.http.get(USER_API + "eventplanner/" + id);
    }

    updateEventPlanner(id, eventPlannerData): Observable<any> {
        return this.http.put(USER_API + 'eventplanner/' + id, eventPlannerData);
    }

    addEventPlanner(eventPlannerData): Observable<any> {
        return this.http.post(USER_API + 'eventplanner', eventPlannerData);
    }
    // getPostavailability(): Observable<any> {
    //   return this.http.get(USER_API+"eventplanner/");
    // }
    getEventPlanner(id): Observable<any> {
        return this.http.get(USER_API + "eventplanner/" + id);
    }

}