import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Product } from '../domain/product';

@Injectable()
export class ProductService {

    constructor(private http: HttpClient) { }
    getVenue() {
        return this.http.get<any>('assets/demo/data/venue.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProductsSmall() {
        return this.http.get<any>('assets/demo/data/products-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProducts() {
        return this.http.get<any>('assets/demo/data/products.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProductsMixed() {
        return this.http.get<any>('assets/demo/data/products-mixed.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProductsWithOrdersSmall() {
        return this.http.get<any>('assets/demo/data/products-orders-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }
    navigationMenu() {
        return this.http.get<any>('assets/demo/data/navigation.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }
}
