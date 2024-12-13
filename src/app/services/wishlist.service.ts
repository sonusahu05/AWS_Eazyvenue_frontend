import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    constructor(private http: HttpClient) { }

    getWishlist(query): Observable<any> {
        return this.http.get(USER_API + "wishlist" + query);
    }
    getWishlistWithoutAuth(query): Observable<any> {
        return this.http.get(USER_API + "wishlist/v1?" + query);
    }

    getWishlistDetails(id): Observable<any> {
        return this.http.get(USER_API + "wishlist/" + id);
    }

    updateWishlist(id, wishlistData): Observable<any> {
        return this.http.put(USER_API + 'wishlist/' + id, wishlistData);
    }

    deleteWishlist(id): Observable<any> {
        return this.http.delete(USER_API + 'wishlist/delete' + id);
    }

    addWishlist(wishlistData): Observable<any> {
        return this.http.post(USER_API + 'wishlist', wishlistData);
    }
}