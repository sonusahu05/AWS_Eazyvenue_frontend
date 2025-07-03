import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from './customer';

@Injectable()
export class CustomerService {
    constructor(private http: HttpClient) { }

    getCustomersLarge(): Observable<Customer[]> {
        return this.http.get<any>('assets/customers-large.json')
            .pipe(
                map(res => res.data as Customer[])
            );
    }

    // Legacy method for backward compatibility (can be removed later)
    getCustomersLargePromise() {
        return this.http.get<any>('assets/customers-large.json')
            .toPromise()
            .then(res => res.data as Customer[])
            .then(data => { return data; });
    }
}