import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import data from '../../../assets/demo/data/navigation.json';
import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
// import listingblock from '../../../assets/demo/data/listing.json';
import { BannerService } from 'src/app/services/banner.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { environment } from 'src/environments/environment';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { PrimeNGConfig } from 'primeng/api';
import { TokenStorageService } from 'src/app/services/token-storage.service';


interface City {
    name: string,
    code: string
}
@Component({
    selector: 'app-compare',
    templateUrl: './compare.component.html',
    styleUrls: ['./compare.component.css', '../navigation/navigation.component.css'],
    styles: [`
        :host ::ng-deep button {
            margin-right: .5em;
        }
    `],

})

export class compareVenue {
    foodtypeimage: any;
    venuearray: any;
    venueDataById: any;
    venueids: any[] = [];
    venuearraylist: any[] = []
    id: any;
    venueImage: any;
    foodtypedata: any;
    public parentCategoryDetails: any[] = [];
    public parentCategoryId;
    public propertyTypeId;
    foodTypeId;
    errorMessage = '';
    public foodTypesList: any[] = [];
    public categoryMenuList;
    public propertyTypesList: any[] = [];
    public selectedCategories: any[] = [];
    public selectedCategoriesNames: any[] = [];
    imagearray: any = [];
    // foodslugelement: any;
    // imagedata: any;
    // foodarray: any = [];
    propertytype: any;
    constructor(private primengConfig: PrimeNGConfig, private venueService: VenueService, private categoryService: CategoryService,
        private router: Router, private tokenStorageService: TokenStorageService
    ) { }

    ngOnInit() {
        this.getCategoryBySlug();

        this.primengConfig.ripple = true;

    }
    getCategoryList() {
        let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + this.parentCategoryId + "&sortBy=created_at&orderBy=1";
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            data => {
                //if (data.data.items.length > 0) {
                this.categoryMenuList = data.data.items;
                let count = 0;
                this.categoryMenuList.forEach(element => {
                    element['selected'] = false;

                    count++;
                });

                //}
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getCategoryBySlug() {
        let query = "?filterByDisable=false&filterByStatus=true";
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            data => {
                if (data.data.items.length > 0) {
                    this.parentCategoryDetails = data.data.items;
                    this.parentCategoryDetails.forEach(element => {
                        if (element.slug == "parent_category") {
                            this.parentCategoryId = element['id'];
                            // this.getCategoryList();
                        }
                        if (element.slug == "property_type") {
                            this.propertyTypeId = element['id'];
                            // this.getPropertyTypes();
                        }
                        if (element.slug == "food") {
                            this.foodTypeId = element['id'];

                            // this.getFoodTypes();
                        }
                    });
                    this.getCategoryList();
                    let tempVenueArrayList = this.tokenStorageService.getCompareVenues();

                    this.venuearraylist = tempVenueArrayList.map(venue => {
                        return {
                            ...venue,
                            isFreeParking: venue.amenities.some(amenity => amenity.title === 'Free Parking'),
                            isAirConditioned: venue.amenities.some(amenity => amenity.title === 'Air-conditioned'),
                            isDanceFloor: venue.amenities.some(amenity => amenity.title === 'Dance Floor'),
                            isVIPSection: venue.amenities.some(amenity => amenity.title === 'VIP Section'),
                            isPrivateParties: venue.amenities.some(amenity => amenity.title === 'Private Parties'),
                            isWaiterService: venue.amenities.some(amenity => amenity.title === 'Waiter Service'),
                        };
                    });
                    // this.venuearraylist = this.tokenStorageService.getCompareVenues();
                    // console.log(this.venuearraylist);
                    // this.venueService._venueid.subscribe(res => {
                    //     this.venuearray = res;
                    //     this.getVenueDetailsById(this.venuearray);
                    // })
                }
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    // getVenueDetailsById(venueids) {
    //     this.id = venueids;
    //     this.imagearray = [];
    //     let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + this.foodTypeId + "&sortBy=created_at&orderBy=1";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             this.foodTypesList = data.data.items;
    //             this.id.forEach(idevent => {
    //                 this.venueService.getVenueDetails(idevent[0]).subscribe(res => {
    //                     var foodarray = [];
    //                     setTimeout(() => {
    //                         if (res['foodType'].length > 0) {
    //                             var i = 0;
    //                             res['foodType'].forEach(foodelelement => {
    //                                 var foodtypeimage = this.foodTypesList.find(obj => obj.slug === foodelelement.slug);
    //                                 foodarray.push(foodtypeimage);
    //                                 i++;
    //                             })
    //                             res['foodImagesName'] = foodarray;
    //                             this.venuearraylist.push(res);
    //                         }
    //                     }, 250)
    //                 })
    //             })
    //         })
    // }
    onClickBookNow(id) {
        this.router.navigateByUrl('/venue/' + id);
    }
}

