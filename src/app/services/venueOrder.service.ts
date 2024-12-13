import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';
const USER_API = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class VenueOrderService {
    private authtoken: string;
    private httpOptions;
    constructor(private http: HttpClient,private token: TokenStorageService) { 
        this.authtoken = this.token.getToken();
        this.httpOptions = {
          headers: new HttpHeaders()
            .set("Content-Type", "application/json")
            .set('Authorization', `Bearer ${this.authtoken}`)
        };
    }

    getVenueOrderList(query): Observable<any> {
        return this.http.get(USER_API + "venueorder" + query);
    }
    getVenueOrderListWithoutAuth(query): Observable<any> {
        return this.http.get(USER_API + "venueorder/v1?" + query);
    }

    getVenueOrderDetails(id): Observable<any> {
        return this.http.get(USER_API + "venueorder/" + id);
    }

    updateVenueOrder(id, venueorderData): Observable<any> {
        return this.http.put(USER_API + 'venueorder/' + id, venueorderData);
    }

    addVenueOrder(venueorderData): Observable<any> {
        return this.http.post(USER_API + 'venueorder', venueorderData,this.httpOptions);
    }

    getVenueOrder(id): Observable<any> {
        return this.http.get(USER_API + "venueorder/" + id);
    }
    handleVenuePayment(rzp_response: any) {
        return this.http.post<any>(USER_API+ "venueorder/verifyPayment",rzp_response,this.httpOptions)
      }

}
