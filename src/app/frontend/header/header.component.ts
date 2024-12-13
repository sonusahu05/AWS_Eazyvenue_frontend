import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
// import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'src/app/services/auth.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { TokenStorageService } from '../../services/token-storage.service';
import { RoleService } from 'src/app/services/role.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from 'src/app/_helpers/utility';
import * as moment from 'moment';
import { map } from 'rxjs/internal/operators/map';
import { UserService } from 'src/app/services/user.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { CategoryService } from 'src/app/services/category.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { timer, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NgxOtpInputComponent, NgxOtpInputConfig } from 'ngx-otp-input';
import { CityService } from 'src/app/manage/city/service/city.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { HotMuhuratsComponent } from '../hot-muhrats/muhrats.component';
interface City {
    name: string;
    code: string;
}
interface Vendor {
    name: string;
    code: string;
}
@Component({
    selector: 'page-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [ConfirmationService, MessageService, HeaderComponent],
})
export class HeaderComponent implements OnInit, AfterViewInit {
    isNavbarFixed: boolean = false;
    venuecityname: any;
    subarealist: any;
    selectedCountries: any[];
    venuearraylist: any[] = [];
    tmpvenueList: any[] = [];
    searchkey;
    pagenumber = 1;
    totalrecordfinalve: any;
    filtration: any[];
    sampleData: string = '';
    public otp: string;
    products: Product[];
    sidebarVisible: boolean;
    loginRegisterModal: boolean;
    vendorForm: boolean;
    numberPopup: boolean;
    otpPopup: boolean;
    otpthankyouPopup: boolean;
    regthankyouPopup: boolean;
    cities: City[];
    occassion: any;
    selectedCity: City;
    vendorType: Vendor[];
    value2: number = 58151;
    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 12,
            numScroll: 12
        },
        {
            breakpoint: '768px',
            numVisible: 12,
            numScroll: 12
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    mobileNumber: any;
    showOtpErrors: boolean = false;
    @ViewChild('ngxotp') ngxotp: NgxOtpInputComponent;
    public config: NgxOtpInputConfig = {
        otpLength: 4,
        autofocus: true,
        classList: {
            inputBox: 'my-super-box-class',
            input: 'my-super-class',
            inputFilled: 'my-super-filled-class',
            inputDisabled: 'my-super-disable-class',
            inputSuccess: 'my-super-success-class',
            inputError: 'my-super-error-class',
        },
    };
    signUpForm: FormGroup;
    loginForm: FormGroup;
    forgotPassForm: FormGroup;
    mobileForm: FormGroup;
    submitted: boolean = false;
    loginFormSubmitted: boolean = false;
    genders;
    message;
    showMessage: boolean = false;
    selectedGender: any = null;
    userType;
    userData;
    isLoginFailed: boolean;
    isLoggedIn: boolean = false;
    roles;
    trainerRoleId;
    permissions: any[] = [];
    permissionArray: any[] = [];
    userTypeListArray: any[] = [];
    rolelist: any[] = [];
    errorMessage;;
    ipAddress;
    yearRange;
    minDateValue: Date;
    minYear = environment.minYear;
    showGenderError;
    venuecapacity: any;
    scheduleOption: any; public categoryMenuList: any[] = [];
    public totalRecords: 0;
    public venueList: any[] = [];
    public assuredVenueList: any[] = [];
    public finalvenueList: any[] = [];
    public capacity;
    public capacityCondition;
    public capacityId;
    public filteredCountries: any[] = [];
    public wishlist: any[];
    public totalWishlistRecords;
    public loading: boolean = true;
    public parentCategoryId;
    public parentCategoryDetails;
    public selectedCategoryId;
    public loggedInUser;
    public userId;
    public menus: any[] = [];
    public showMenus;
    public areas;
    public selectedArea;
    public activeIndex: number = 0;
    public birthYearRange;
    public birthYearDefaultDate;
    public birthMinValue: Date = new Date(environment.defaultDate);
    public birthMaxValue: Date = new Date(maxYearFunction());
    public statusChanges;
    public successMessage;
    public showForgotPasswordDialog: boolean = false;
    public displayTime;
    public showResendButton: boolean = false;
    public countDown: Subscription;
    public counter;
    public tick;
    public otpError = undefined;
    public cityList: any[] = [];
    public activeRoute: string;
    public oldUser: any = {};
    public userFirstName: string = '';
    public userLastName: string = '';
    firstNameError:boolean = false;
    lastNameError:boolean = false;
    hotDatesResponsiveOptions;
    hotDates: any[] = [];
    muhuratDialog:boolean = false;
    @ViewChild('hotDatesOP') hotDatesOP: OverlayPanel;

    constructor(
        private wishlistService: WishlistService,
        private productService: ProductService,
        private router: Router,
        private formBuilder: FormBuilder,
        private roleService: RoleService,
        private http: HttpClient,
        private cd: ChangeDetectorRef,
        private tokenStorage: TokenStorageService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private subareaService: SubareaService,
        private categoryService: CategoryService,
        private venueService: VenueService,
        private cityService: CityService,
        private activatedRoute: ActivatedRoute,
        private renderer: Renderer2, private el: ElementRef
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
              this.sidebarVisible = false; //hide sidebar
              const routeSegments = this.getRouteSegments(this.activatedRoute.snapshot);
              if (this.isVendorRoute(routeSegments)) {
                // console.log('vendor');
                this.activeRoute = 'vendor'
              } else if (routeSegments.length === 0 || this.isVenueRoute(routeSegments)) {
                // console.log('venue');
                this.activeRoute = 'venue'
              }
            }
          });
          this.hotDatesResponsiveOptions = [
            // {
            //     breakpoint: '1024px',
            //     numVisible: 1,
            //     numScroll: 1
            // },
            // {
            //     breakpoint: '768px',
            //     numVisible: 1,
            //     numScroll: 1
            // },
            // {
            //     breakpoint: '560px',
            //     numVisible: 1,
            //     numScroll: 1
            // }
            {
                breakpoint: '1024px',
                numVisible: 1,
                settings: {
                    slidesToShow: 2.25,
                    slidesToScroll: 1,
                },

            },
            {
                breakpoint: '768px',
                numVisible: 1,
                settings: {
                    slidesToShow: 2.25,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: '560px',
                numVisible: 1,
                settings: {
                    slidesToShow: 2.25,
                    slidesToScroll: 1,
                },
            }
        ]
        this.hotDates = [
            {
                id:"HOTDATES1",
                image:"https://api.eazyvenue.com/uploads/muhurat/JanFeb_Muhrat_Dates_2024-02.jpg",
            },

            {
                id:"HOTDATES3",
                image:"https://api.eazyvenue.com/uploads/muhurat/MarApr_Muhrat_Dates_2024-03.jpg",
            },
            {
                id:"HOTDATES4",
                image:"https://api.eazyvenue.com/uploads/muhurat/MayJune_Muhrat_Dates_2024-04.jpg",
            },
            {
                id:"HOTDATES2",
                image:"https://api.eazyvenue.com/uploads/muhurat/JulyAug_Muhrat_Dates_2024-05.jpg",
            },
            {
                id:"HOTDATES6",
                image:"https://api.eazyvenue.com/uploads/muhurat/SeptOct_Muhrat_Dates_2024-06.jpg",
            },
            {
                id:"HOTDATES5",
                image:"https://api.eazyvenue.com/uploads/muhurat/NovDec_Muhrat_Dates_2024-07.jpg",
            }

        ]
    }
    toggleMuhurat(){
        this.muhuratDialog = true;
    }

    isHotMuhuratsOpen: boolean = false;

    toggleHotMuhurats() {
      this.isHotMuhuratsOpen = !this.isHotMuhuratsOpen;
    }

    closeHotMuhurats() {
      this.isHotMuhuratsOpen = false;
    }

      getRouteSegments(route: any): string[] {
        const segments: string[] = [];
        while (route) {
          if (route.routeConfig && route.routeConfig.path) {
            segments.unshift(route.routeConfig.path);
          }
          route = route.firstChild;
        }
        return segments;
      }

      isVendorRoute(segments: string[]): boolean {
        return segments.some(segment => segment.includes('vendor'));
      }

      isVenueRoute(segments: string[]): boolean {
        return segments.some(segment => segment.includes('venue') || segment.includes('banquet'));
      }
    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe((event: NavigationEnd) => {
            if (event.urlAfterRedirects === '/banquet-halls' && event.url !== '/venue') {
                //for reload for navigation
              location.reload();
            }else{
                // console.log('not coming');
            }
          });
        this.cities = [
            { name: 'Mumbai', code: 'NY' },
            { name: 'Agra', code: 'RM' },
            { name: 'Rajsthan', code: 'LDN' },
            { name: 'Pune', code: 'IST' },
            { name: 'Hyderabad', code: 'PRS' }
        ];
        this.vendorType = [
            { name: 'Wedding Venues', code: 'NY' },
            { name: 'Wedding Caterers', code: 'RM' },
            { name: 'Bridal Makeup Artist', code: 'LDN' },
            { name: 'Wedding Photographer', code: 'IST' },
            { name: 'Planning & Decoration', code: 'PRS' }
        ];
        // this.productService.getVenue().then(products => {
        //     this.products = products;
        // });
        this.loggedInUser = this.tokenStorage.getUser();
        let getToken = this.tokenStorage.getToken();
        if (getToken != null) {
            this.isLoggedIn = true;
        }
        if (this.loggedInUser.userdata != undefined) {
            this.isLoggedIn = true;
            this.userId = this.loggedInUser.userdata.id;
        }
        if (this.isLoggedIn == true) {
            this.loginRegisterModal = false;
        }
        this.minDateValue = new Date();
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
        //this.getCategoryBySlug();
        this.categoryService._categoryid.subscribe(cid => {
            if (cid != null) {
                this.selectedCategoryId = cid;
            }
        })
        this.getSubareas();
        this.getCities();
        //this.getVenueList(this.selectedCategoryId);
        //this.getVenueList();
        this.signUpForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.pattern("([a-zA-Z',.-]+( [a-zA-Z',.-]+)*){2,30}")]],
            //lastName: ['', [Validators.required, Validators.pattern('[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]],
            confirmPassword: ['', Validators.required],
            //gender: ['', Validators.required],
            dob: ['',],
            mobileNumber: ['', [Validators.required, Validators.pattern("[0-9 ]{10}")]],
            role: ['user'],
            userType: ['user'],
            vendortype: ['', Validators.required]
        }, {
            validator: MustMatch('password', 'confirmPassword'),
        });
        this.mobileForm = this.formBuilder.group({
            mobileNumber: [null, [Validators.required, Validators.pattern("[0-9 ]{10}"), Validators.minLength(10)]],
        });
        this.forgotPassForm = new FormGroup({
            email: new FormControl("", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}")])
        });
        this.genders = [
            { id: '1', name: 'Male', code: 'Male' },
            { id: '2', name: 'Female', code: 'Female' },
            { id: '3', name: 'Other', code: 'Other' },
        ];
        this.selectedGender = this.genders[0];
        this.areas = [
            { name: 'Andheri', code: 'AN' },
            { name: 'Mahalaxmi', code: 'MH' },
            { name: 'Charni Rd', code: 'CR' },
            { name: 'Churchgate', code: 'CT' },
            { name: 'Dadar', code: 'CT' },
            { name: 'Bandra', code: 'BD' },
            { name: 'Borivali', code: 'BV' },
            { name: 'Dahisar', code: 'Di' },
            { name: 'Goregaon', code: 'GG' },
            { name: 'Grant Rd', code: 'GR' },
            { name: 'Jogeshwari', code: 'JS' },
            { name: 'Juhu', code: 'JH' },
            { name: 'Kandivali', code: 'KN' },
            { name: 'Mahim Jn', code: 'MJ' },
            { name: 'Mankhurd', code: 'MK' },
            { name: 'Matunga', code: 'MT' },
            { name: 'Matunga Road', code: 'MTR' },
        ];
        this.birthYearRange = this.minYear + ":" + maxYearFunction();
        this.birthMaxValue = new Date(moment(this.birthMaxValue.setFullYear(this.birthMaxValue.getFullYear() + 1)).format('YYYY-MM-DD'));
        this.birthYearDefaultDate = new Date(moment(this.birthMaxValue).subtract(1, "d").format('YYYY-MM-DD'));
        this.selectedArea = this.areas[0].name;
        // this.statusChanges = this.signUpForm.statusChanges.pipe(
        //   // map((v) => v + Date.now().toString())
        // );
        // if (this.statusChanges == "INVALID") {
        //   return;
        // }
    }
    ngAfterViewInit() {
        this.activatedRoute.queryParams.subscribe(params => {
            if (params['query'] && params['query'] === 'muhurata') {
                if (window.innerWidth <= 768) {
                    this.muhuratDialog = true;
                } else {
                    const hotMuhuratsLink = this.el.nativeElement.querySelector('.nav-link.border-end.hot-dates-link');
                    if (hotMuhuratsLink) {
                        hotMuhuratsLink.click();
                    }
                }
            }
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.signUpForm.controls;
    }
    get loginf() {
        return this.loginForm.controls;
    }
    get forgotPassValidation() {
        return this.forgotPassForm.controls;
    }
    get email() {
        return this.signUpForm.get('email');
    }
    get h() {
        return this.mobileForm.controls;
    }
    showDialogvendor() {
        this.router.navigateByUrl("/manage/login")
        // this.vendorForm = true;
    }
    showDialogoffer() {
        if (this.isLoggedIn == false) {
            this.numberPopup = true;
            this.otpPopup = false;
            this.otpthankyouPopup = false;
            // this.ngxotp.clear();
            this.otp = undefined;
        }
    }
    showDialogotp() {
        this.otpPopup = true;
        this.numberPopup = false;
        this.otpthankyouPopup = false;
    }
    showDialogthankyou() {
        this.otpthankyouPopup = true;
        this.numberPopup = false;
        this.otpPopup = false;
    }
    showDialogregthankyou() {
        this.regthankyouPopup = true;
        this.loginRegisterModal = false;
        this.vendorForm = false;
    }
    // getCategoryBySlug() {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterBySlug=parent_category";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             if (data.data.items.length > 0) {
    //                 this.parentCategoryDetails = data.data.items[0];
    //                 this.parentCategoryId = this.parentCategoryDetails['id'];
    //                 this.getCategoryList();
    //             }
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // getCategoryList() {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + this.parentCategoryId + "&sortBy=created_at&orderBy=1";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.categoryMenuList = data.data.items;
    //             // this.selectedCategoryId = this.categoryMenuList[0].id;
    //             let index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
    //             if (index != -1) {
    //                 this.categoryMenuList[index]['show'] = 'active';
    //             }
    //             if (this.isLoggedIn == true) {
    //                 //this.getWishlist();
    //             } else {
    //                 // this.getVenueList(this.lazyLoadEvent);
    //                 // this.getAssuredVenueList();
    //             }
    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // async getWishlist() {
    //     let query = "?filterByStatus=true&filterByCustomerId=" + this.userId;
    //     this.wishlistService.getWishlist(query).subscribe(
    //         data => {
    //             this.loading = false;
    //             this.wishlist = data.data.items;
    //             this.totalWishlistRecords = data.data.totalCount;
    //             // this.getVenueList(this.lazyLoadEvent);
    //             // this.getAssuredVenueList();
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         });
    // }
    // onClickCategory(category) {
    //     if (category != null) {
    //         this.occassion = category;
    //         this.categoryService.categoryid(category.id);
    //         this.selectedCategoryId = category.id;
    //         this.categoryMenuList.map(x => x.show = 'false');
    //         var index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
    //         this.categoryMenuList[index]['show'] = 'active';
    //     } else {
    //         this.selectedCategoryId = '';
    //         this.categoryMenuList.forEach(element => {
    //             element['show'] = 'false'
    //         })
    //     }
    //     this.finalvenueList = [];
    //     this.pagenumber = 1;
    //     this.getVenueList();
    //     // this.getAssuredVenueList();
    // }
    // getCategoryid() {
    //     this.categoryService._categoryid.subscribe(cid => {
    //         var categoryid = this.categoryMenuList.find(x => x.id == cid);
    //         this.occassion = categoryid.id;
    //     })
    // }
    onRangeDate() {
    }
    // onChangevenue(event) {
    //     this.venuecityname = event.name;
    // }
    onSearch() {
        // if (this.occassion == null) {
        //     this.showoccasionerror = true;
        // }
        // if(this.venuecityname == null){
        //     this.showvenuecityerror = true;
        // }
        this.numberPopup = true;
        // if (this.occassion != null) {
        //     this.showoccasionerror = false;
        // }
        // if (this.venuecityname != null) {
        //     this.showvenuecityerror = false;
        // }
        // this.router.navigate
    }
    filterCountry(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.cities.length; i++) {
            let country = this.cities[i];
            if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(country);
            }
        }
        this.filteredCountries = filtered;
    }
    onGenderSelect(gender, event) {
        this.selectedGender = '';
        if (event.isTrusted) {
            this.selectedGender = gender;
        }
    }
    // onKeyPress() {
    //   this.signUpForm.controls['email'].setValidators([Validators.required]);
    //   // this.signUpForm.statusChanges.pipe(
    //   //   map((v) => v + Date.now().toString())
    //   // );
    //   // if (this.signUpForm.invalid) {
    //   //   return;
    //   // }
    // }
    onClickShowForgotPasswordDialog() {
        this.showForgotPasswordDialog = true;
        this.loginRegisterModal = false;
    }
    onAreaChange(event) {
        if (event.value != null) {
            this.selectedArea = event.value.name;
        }
    }
    getRoleDetails() {
        const querystring = "filterByroleId=" + this.userData.data.userdata.role;
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.trainerRoleId = data.data.items[0]['id'];
                this.permissions = data.data.items[0]['permissions'];
                this.tokenStorage.saveUserPermissions(this.permissions);
                this.rolelist = data.data.items[0];
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    findIndexByIdArray(name, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].rolename === name) {
                index = i;
                break;
            }
        }
        return index;
    }
    search(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.cityList.length; i++) {
            let city = this.cityList[i];
            if (city.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                city.mode = "city";
                filtered.push(city);
            }
        }
        for (let i = 0; i < this.subarealist.length; i++) {
            let subarea = this.subarealist[i];
            if (subarea.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                subarea.mode = "subarea";
                filtered.push(subarea);
            }
        }
        // for (let i = 0; i < this.finalVenueList.length; i++) {
        //     let venue = this.finalVenueList[i];
        //     if (venue.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        //         venue.mode = "venue";
        //         filtered.push(venue);
        //     }
        // }
        this.filtration = filtered;
    }
    getSubareas() {
        var query = "?filterByDisable=false&filterByStatus=true";
        this.subareaService.getSubareaList(query).subscribe(
            data => {
                this.subarealist = data.data.items;
                this.subarealist.forEach(element => {
                    element['name'] = element.name + " ( " + element.cityname + ", " + element.statename + " ) ";
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    getCities() {
        let query = "?filterByDisable=false&filterByStatus=true";
        this.cityService.getcityList(query).subscribe(
            data => {
                this.cityList = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    getRoleList() {
        var querystring = "filterByDisable=false&filterByStatus=true";
        var rolearray = [];
        this.roleService.getRoleList(querystring).subscribe(
            data => {
                var rolelist = data.data.items;
                rolelist.forEach(element => {
                    rolearray.push({ "roleid": element.id, "rolename": element.user_role_name });
                });
                if (rolearray.length > 0) {
                    this.tokenStorage.saveRolelist(rolearray);
                }
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    onForgotPassSubmit() {
        this.submitted = true;
        if (this.forgotPassForm.valid) {
            this.userService.requestPassword(this.forgotPassForm.value).subscribe(res => {
                this.submitted = false;
                if (res['errors']) {
                    this.errorMessage = res['errors'];
                    this.successMessage = '';
                } else {
                    this.successMessage = res;
                    this.errorMessage = '';
                }
                this.showMessage = true;
            },
                err => {
                    this.successMessage = '';
                    this.showMessage = true;
                    this.errorMessage = err.error.data.errors;
                });
        }
    }
    onSubmit(): void {
        this.loginFormSubmitted = true;
        //stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        const username = this.loginForm.value.email;
        const password = this.loginForm.value.password;
        this.userType = 'user';
        this.authService.login(username, password, this.userType).subscribe(
            data => {
                this.userData = data;
                this.tokenStorage.saveToken(this.userData.data.access_token);
                this.tokenStorage.saveUser(this.userData.data);
                this.tokenStorage.getAuthStatus(this.userData.data);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
                this.roles = this.tokenStorage.getUser().roles;
                this.getRoleDetails();
                this.getRoleList();
                let currentUrl = '/';
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                this.router.navigate([currentUrl]);
                this.loginRegisterModal = false;
            },
            ((err) => {
                this.errorMessage = 'Please check your login credentials...! ';
                this.isLoginFailed = true;
                this.messageService.add({ key: 'usertoastmsg', severity: 'error', summary: this.errorMessage, detail: 'Login Failed', life: 6000 });
            })
        );
    }
    onSignupSubmit(): void {
        this.submitted = true;
        //stop here if form is invalid
        if (this.signUpForm.invalid) {
            return;
        }
        let userData = this.signUpForm.value;
        // if (this.selectedGender == null) {
        //   this.showGenderError = true;
        //   return;
        // }
        userData['gender'] = '';
        userData['role'] = 'user';
        userData['name'] = userData['name'].split(" ", 2);
        let firstName = userData['name'][0];
        let lastName = userData['name'][1];
        userData['firstName'] = firstName;
        userData['lastName'] = lastName;
        this.authService.signUp(userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'User Added', life: 3000 });
                this.signUpForm.reset();
                this.submitted = false;
                this.loginRegisterModal = false;
                setTimeout(() => {
                    this.loginRegisterModal = true;
                    this.activeIndex = Number(0);
                }, 2000);
            },
            ((err) => {
                this.showMessage = true;
                this.message = err.error.error;
                this.messageService.add({ key: 'usertoastmsg', severity: 'error', summary: err.error.error, detail: 'Add User Failed', life: 6000 });
            })
        );
    }
    onSubmitNumber(mode) {
        this.submitted = true;
        if (this.mobileForm.invalid) {
            return;
        }
        this.mobileNumber = this.mobileForm.value.mobileNumber;
        let data = {};
        data['mobileNumber'] = this.mobileNumber;
        this.authService.otpLogin(data).subscribe(
            (res:any) => {
                // console.log(res);

                if (mode !== 'resendOtp') {
                    this.otpPopup = true;
                }
                this.oldUser = {
                    userType: res.firstName === '' ? 'new' : 'old',
                    firstName: res.firstName,
                    lastName: res.lastName,
                }
                //this.mobileForm.reset();
                this.submitted = false;
                this.numberPopup = false;
                // this.ngxotp.clear();
                this.counter = 90;
                this.tick = 1000;
                this.otpTimer(this.counter, this.tick);

            },
            err => {
                this.messageService.add({ key: 'usertoastmsg', severity: 'error', summary: err.error.error, detail: err.error.error, life: 6000 });
            }
        );
    }
    otpArray:string[] = [];
    pastedEvent(event){
        const val = event.target.value;
        this.showOtpErrors = false;
        if(val.length === 4){
            this.otpArray = val.toString().split('');
            const txt1 = document.getElementById("txt1") as HTMLInputElement;
            const txt2 = document.getElementById("txt2") as HTMLInputElement;
            const txt3 = document.getElementById("txt3") as HTMLInputElement;
            const txt4 = document.getElementById("txt4") as HTMLInputElement;

            txt1.value = val.charAt(0) || ''
            txt2.value = val.charAt(1) || ''
            txt3.value = val.charAt(2) || ''
            txt4.value = val.charAt(3) || ''

            txt4.focus();
        }
    }
    move(e: any, p: any, c: any, n: any, i:any) {
        this.showOtpErrors = false;
          let length = c.value.length;
          let maxLength = 1;

          if (length === maxLength) {
            this.otpArray[i] = c.value;
            if (n !== '') {
              n.focus();
            }
          }

          if (e.key === 'Backspace') {
            this.otpArray[i] = '';
            if (p !== '') {
              p.focus();
            }
          }
      }

    onOtpChange(otp) {
        if (otp[0]) {
            this.otp = otp[0];
        }
        if (otp[1]) {
            this.otp += otp[1];
        }
        if (otp[2]) {
            this.otp += otp[2];
        }
        if (otp[3]) {
            this.otp += otp[3];
        }
        this.otpError = undefined;
    }
    validateFirstName(){
        if(this.userFirstName.length <= 3){
            this.firstNameError = true;
        }else{
            this.firstNameError = false;
        }
    }
    validateLastName(){
        if(this.userLastName.length <= 3){
            this.lastNameError = true;
        }else{
            this.lastNameError = false;
        }
    }
    otpSubmit() {
        this.otp = this.otpArray.join('')
        if(this.oldUser.userType === 'new'){
            if(this.userFirstName.length <= 3){
                this.firstNameError = true;
                return;
            }
            if(this.userLastName.length <= 3){
                this.lastNameError = true;
                return;
            }
        }
        if (this.otp == undefined || this.otp.length < 4) {
            this.showOtpErrors = true;
            return;
        }
        // console.log(this.otp);

        let data = {};
        data['mobileNumber'] = this.mobileNumber;
        data['firstName'] = this.userFirstName;
        data['lastName'] = this.userLastName;
        data['otp'] = this.otp;
        this.otpError = undefined;
        this.authService.verifyOtp(data).subscribe(
            data => {
                this.otpPopup = false;
                this.userData = data;
                this.tokenStorage.saveToken(this.userData.data.access_token);
                this.tokenStorage.saveUser(this.userData.data.userdata);
                //this.tokenStorage.getAuthStatus(this.userData.data);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
                //this.roles = this.tokenStorage.getUser().roles;
                // this.getRoleDetails();
                // this.getRoleList();
                this.mobileForm.reset();
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                let currentUrl = "/";
                this.router.navigate(
                    [currentUrl],
                );
            },
            (err) => {
                this.otpError = err.error.error;
                // this.messageService.add({ key: 'usertoastmsg', severity: 'error', summary: err.error.error, detail: err.error.error, life: 6000 });
            }
        );
        // if (this.otp === '4321' && this.mobileNumber) {
        //     this.otpPopup = false;
        //     this.router.navigate(['/venue-list']);
        // }
    }
    @HostListener('window:scroll', ['$event']) onScroll() {
        if (window.scrollY > 100) {
            this.isNavbarFixed = true;
        } else {
            this.isNavbarFixed = false;
        }
    }
    resendOtp() {
        this.otpError = undefined;
        this.showResendButton = false;
        this.onSubmitNumber('resendOtp');
        const txt1 = document.getElementById("txt1") as HTMLInputElement;
        const txt2 = document.getElementById("txt2") as HTMLInputElement;
        const txt3 = document.getElementById("txt3") as HTMLInputElement;
        const txt4 = document.getElementById("txt4") as HTMLInputElement;

        txt1.value = '';
        txt2.value = '';
        txt3.value = '';
        txt4.value = '';

        this.otp = '';
        this.otpArray = []

    }
    otpTimer(counter, tick) {
        this.countDown = timer(0, this.tick)
            .pipe(take(this.counter))
            .subscribe(() => {
                --this.counter;
                if (this.counter == 0) {
                    this.showResendButton = true;
                    this.countDown?.unsubscribe();
                }
            });
    }
    transform(value: number): string {
        const minutes: number = Math.floor(value / 60);
        return (
            ('00' + minutes).slice(-2) +
            ':' +
            ('00' + Math.floor(value - minutes * 60)).slice(-2)
        );
    }

    changeMobileNumber() {
        this.oldUser = {};
        this.numberPopup = true;
        this.otpPopup = false;
        // this.ngxotp.clear();
        this.otp = undefined;
        this.countDown?.unsubscribe();
        this.otpError = undefined;
        this.showResendButton = false;
        this.otpError = '';
        const txt1 = document.getElementById("txt1") as HTMLInputElement;
        const txt2 = document.getElementById("txt2") as HTMLInputElement;
        const txt3 = document.getElementById("txt3") as HTMLInputElement;
        const txt4 = document.getElementById("txt4") as HTMLInputElement;
        txt1.value = '';
        txt2.value = '';
        txt3.value = '';
        txt4.value = '';
        this.otpArray = []
    }
    showLoginRegisterDialog() {
        if (this.isLoggedIn == true) {
            this.loginRegisterModal = false;
        } else {
            this.loginRegisterModal = true;
        }
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
    toggleCanvas() {
    }
    toggleSearch() {
    }
    showMenu() {
        this.showMenus = true;
    }
    myProfile() {
        this.router.navigateByUrl("/my-profile");
    }
    getVenueList() {
        var params = "";
        var rows = 10;
        let query = "filterByDisable=false&filterByStatus=true&filterByCategory=" + this.selectedCategoryId;
        query += "&pageSize=" + rows + "&pageNumber=" + this.pagenumber + params;
        if (this.capacityCondition != '' && this.capacity != '') {
            query += "&filterByGuestCondition=" + this.capacityCondition + "&filterByGuestCapacity=" + this.capacity;
        }
        this.venueList = [];
        this.venueList = Object.assign([], this.finalvenueList)
        this.venueService.getVenueListWithoutAuth(query).subscribe(
            data => {
                //if (data.data.items.length > 0) {
                this.loading = false;
                this.tmpvenueList = data.data.items;
                this.finalvenueList = [...this.venueList, ...this.tmpvenueList];
                this.totalRecords = data.data.totalCount;
                this.totalrecordfinalve = this.finalvenueList.length
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }


    // showDialogotp() {
    //     this.otpPopup = true;
    //     this.numberPopup = false;
    //     this.otpthankyouPopup = false;
    // }
    // showDialogthankyou() {
    //     this.otpthankyouPopup = true;
    //     this.numberPopup = false;
    //     this.otpPopup = false;
    // }
}
