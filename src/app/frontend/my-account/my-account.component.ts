import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
// import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'src/app/services/auth.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { TokenStorageService } from '../../services/token-storage.service';
import { RoleService } from 'src/app/services/role.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CountryService } from 'src/app/manage/country/service/country.service';
import { StateService } from 'src/app/manage/state/service/state.service';
import { CityService } from 'src/app/manage/city/service/city.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls: ['./my-account.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class MyAccountComponent implements OnInit {
    availableClasses: string[] = ["light", "normal-header"];
    currentClassIdx: number = 0;
    public categoryMenuList;
    public propertyTypeId;
    venuearray: any;
    imagearray: any = [];
    venuearraylist: any[] = []
    bodyClass: string;
    public parentCategoryDetails: any[] = [];
    items: MenuItem[];
    public foodTypesList: any[] = [];
    public item;
    id: any;
    errorMessage = '';
    public loggedInUser;
    public isLoggedIn: boolean = false;
    public bookingTab: boolean = false;
    public availabilityTab: boolean = false;
    public referAndEarnTab: boolean = false;
    public profileInfoTab: boolean = false;
    public userId;
    public profileDetails;
    foodTypeId;
    public parentCategoryId;
    constructor(
        private venueService: VenueService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private commonService: CommonService,
        private countryService: CountryService,
        private stateService: StateService,
        private cityService: CityService,
        private categoryService: CategoryService,
        private activeRoute: ActivatedRoute
    ) {
        this.bodyClass = this.availableClasses[this.currentClassIdx];
        this.changeBodyClass();
    }
    changeBodyClass() {
        // get html body element
        const bodyElement = document.body;

        if (bodyElement) {


            this.currentClassIdx = this.getNextClassIdx();
            const nextClass = this.availableClasses[this.currentClassIdx];
            const activeClass = this.availableClasses[this.getPrevClassIdx()];

            // remove existing class (needed if theme is being changed)
            bodyElement.classList.remove(activeClass);
            // add next theme class
            bodyElement.classList.add(nextClass);

            this.bodyClass = nextClass;
        }
    }

    getPrevClassIdx(): number {
        return this.currentClassIdx === 0
            ? this.availableClasses.length - 1
            : this.currentClassIdx - 1;
    }

    getNextClassIdx(): number {
        return this.currentClassIdx === this.availableClasses.length - 1
            ? 0
            : this.currentClassIdx + 1;
    }
    ngOnInit() {

        // this.getCategoryBySlug();
        this.getCategoryListNew();
        // this.venueService._venueid.subscribe(res => {
        //     this.venuearray = res;
        //     //this.getVenueDetailsById(this.venuearray);
        // })
        this.items = [
            {
                label: 'File',
                icon: 'pi pi-fw pi-file',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-fw pi-plus',
                        items: [
                            {
                                label: 'Bookmark',
                                icon: 'pi pi-fw pi-bookmark'
                            },
                            {
                                label: 'Video',
                                icon: 'pi pi-fw pi-video'
                            }
                        ]
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-fw pi-trash'
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-fw pi-external-link'
                    }
                ]
            },
            {
                label: 'Edit',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    {
                        label: 'Left',
                        icon: 'pi pi-fw pi-align-left'
                    },
                    {
                        label: 'Right',
                        icon: 'pi pi-fw pi-align-right'
                    },
                    {
                        label: 'Center',
                        icon: 'pi pi-fw pi-align-center'
                    },
                    {
                        label: 'Justify',
                        icon: 'pi pi-fw pi-align-justify'
                    }
                ]
            },
            {
                label: 'Users',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-fw pi-user-plus',

                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-fw pi-user-minus',
                    },
                    {
                        label: 'Search',
                        icon: 'pi pi-fw pi-users',
                        items: [
                            {
                                label: 'Filter',
                                icon: 'pi pi-fw pi-filter',
                                items: [
                                    {
                                        label: 'Print',
                                        icon: 'pi pi-fw pi-print'
                                    }
                                ]
                            },
                            {
                                icon: 'pi pi-fw pi-bars',
                                label: 'List'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Events',
                icon: 'pi pi-fw pi-calendar',
                items: [
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            {
                                label: 'Save',
                                icon: 'pi pi-fw pi-calendar-plus'
                            },
                            {
                                label: 'Delete',
                                icon: 'pi pi-fw pi-calendar-minus'
                            }
                        ]
                    },
                    {
                        label: 'Archieve',
                        icon: 'pi pi-fw pi-calendar-times',
                        items: [
                            {
                                label: 'Remove',
                                icon: 'pi pi-fw pi-calendar-minus'
                            }
                        ]
                    }
                ]
            }
        ]

        this.loggedInUser = this.tokenStorage.getUser();
        let getToken = this.tokenStorage.getToken();
        if (getToken) {
            this.isLoggedIn = true;
        }
        if (this.loggedInUser != undefined) {
            this.isLoggedIn = true;
            this.userId = this.loggedInUser.id;
        }
        if (this.isLoggedIn == false) {
            this.router.navigate(['/']);
        }
        this.activeRoute.queryParams.subscribe(params => {
            let mode = params['mode'];
            if (mode === 'send_enquires') {
                this.availabilityTab = true;
            }
            if (mode === 'bookings') {
                this.bookingTab = true;
            }
            if (mode === 'refer-and-earn') {
                this.referAndEarnTab = true;
            }
            if (mode === 'profile-info') {
                this.profileInfoTab = true;
            }
            console.log(mode);
        });
        this.getMyAccountDetails(this.userId);
    }
    getCategoryListNew(){
        this.venueService.getOccastionCategoryList().subscribe(
            data => {
                this.categoryMenuList = data.data.filter( o => o.name !== "Couple Dates")
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    // getCategoryList() {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + this.parentCategoryId + "&sortBy=created_at&orderBy=1";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.categoryMenuList = data.data.items;
    //             let count = 0;
    //             this.categoryMenuList.forEach(element => {
    //                 element['selected'] = false;

    //                 count++;
    //             });

    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }


    onTabClick(mode) {
        if (mode == "logout") {
            this.signOut();
        }


    }

    editProfile() {
        this.router.navigate(['/edit-my-profile/' + this.userId]);
    }
    getMyAccountDetails(userId) {
        this.userService.getUserDetails(userId).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.profileDetails = this.item;
                }

            }, err => {

            });

    }
    signOut() {
        window.sessionStorage.clear();
        this.tokenStorage.isLoggedOut();
        let currentUrl = '/';
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
        return false;
    }
    // getCategoryBySlug() {
    //     let query = "?filterByDisable=false&filterByStatus=true";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             if (data.data.items.length > 0) {
    //                 this.parentCategoryDetails = data.data.items;
    //                 this.parentCategoryDetails.forEach(element => {
    //                     if (element.slug == "parent_category") {
    //                         this.parentCategoryId = element['id'];
    //                         // this.getCategoryList();
    //                     }
    //                     if (element.slug == "property_type") {
    //                         this.propertyTypeId = element['id'];
    //                         // this.getPropertyTypes();
    //                     }
    //                     if (element.slug == "food") {
    //                         this.foodTypeId = element['id'];

    //                         // this.getFoodTypes();
    //                     }
    //                 });
    //                 this.getCategoryList();

    //             }
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
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
}





