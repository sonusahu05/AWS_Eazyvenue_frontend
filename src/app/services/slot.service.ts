import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class SlotService {
    constructor(private http: HttpClient) { }

    getSlotList(query): Observable<any> {
        return this.http.get(USER_API + "slot" + query);
    }
    getSlotListWithoutAuth(query): Observable<any> {
        return this.http.get(USER_API + "slot/v1" + query);
    }

    getSlotDetails(id): Observable<any> {
        return this.http.get(USER_API + "slot/" + id);
    }

    updateSlot(id, slotdata): Observable<any> {
        return this.http.put(USER_API + 'slot/' + id, slotdata);
    }

    addSlot(slotdata): Observable<any> {
        return this.http.post(USER_API + 'slot', slotdata);
    }
    // getSlot(): Observable<any> {
    //   return this.http.get(USER_API+"slot/");
    // }
    getSlot(id): Observable<any> {
        return this.http.get(USER_API + "slot/" + id);
    }

}
