/*
* Copyright (c) Akveo 2019. All Rights Reserved.
* Licensed under the Single Application / Multi Application License.
* See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: "root" })
export class ShoppingCartService {
    private httpOptions = {
        headers: new HttpHeaders()
            .set("Content-Type", "application/json")
    };

    readonly bpostedUrl = environment.apiUrl + "shopping-cart";

    constructor(private http: HttpClient,) { }

    add(data) {
        return this.http.post<any>(this.bpostedUrl, data, this.httpOptions);
    }
    getShoppingCartList(query: string) {
        return this.http.get<any>(`${environment.apiUrl + 'shopping-cart?'}` + query);
    }
    update(id, userdata): Observable<any> {
        return this.http.put(environment.apiUrl + 'shopping-cart/' + id, userdata);
    }

}  