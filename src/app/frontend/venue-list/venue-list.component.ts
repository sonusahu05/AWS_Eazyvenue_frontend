import { Component, OnInit, ViewChild, HostListener, Renderer2 } from '@angular/core';
// import data from '../../../assets/demo/data/navigation.json';
import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
// import listingblock from '../../../assets/demo/data/listing.json';
import { BannerService } from 'src/app/services/banner.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { environment } from 'src/environments/environment';
import { FilterService, LazyLoadEvent, SelectItemGroup } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { maxYearFunction } from 'src/app/_helpers/utility';
import { UserService } from 'src/app/services/user.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { CustomValidators } from 'ng2-validation';
import { RoleService } from 'src/app/services/role.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WishlistService } from 'src/app/services/wishlist.service';
import { PhotoService } from 'src/app/demo/service/photoservice';
import { SubareaService } from 'src/app/services/subarea.service';
import { CountryService } from "../../demo/service/countryservice";
import { CityService } from 'src/app/manage/city/service/city.service';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { take, filter, elementAt } from 'rxjs/operators';
import { NgxOtpInputComponent, NgxOtpInputConfig } from 'ngx-otp-input';
import { Meta, Title } from '@angular/platform-browser';

interface City {
    name: string,
    code: string
}
interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}
@Component({
    selector: 'app-venue-list',
    templateUrl: './venue-list.component.html',
    styleUrls: ['./venue-list.component.scss'],
    providers: [BannerService, MessageService, ConfirmationService, CountryService]

})
export class VenueListComponent implements OnInit {
    // selectedIndex = 0;
    // showPrev(i : number){
    //     if(this.selectedIndex > 0) {
    //         this.selectedIndex =  i - 1;
    //     }
    // }
    // showNext(i : number){
    //     if(this.selectedIndex < this.venueImages?.length - 1) {
    //         this.selectedIndex =  i + 1;
    //     }
    // }
    homeSearch: boolean = false;

    showHomeSearch() {
        this.homeSearch = true;
    }
    showoccasionerror = false;
    showvenuecityerror = false;
    venuecityname: any;
    numberPopup: boolean = false;
    mobileForm: FormGroup;
    mobileNumber: any;
    submitted: boolean = false;
    otpPopup: boolean = false;
    otpthankyouPopup: boolean;
    regthankyouPopup: boolean;
    val1: number;
    val2: number = 3;
    val3: number = 5;
    val4: number = 5;
    val5: number;
    msg: string;
    products: Product[];
    // images: any[] | undefined;
    vendorSelection: boolean | undefined;
    public oldUser: any = {};
    public userFirstName: string = '';
    public userLastName: string = '';
    firstNameError:boolean = false;
    lastNameError:boolean = false;

    responsiveOptions: any[] = [
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
    ];
    listing: any[] = [
        {
            breakpoint: '1680px',
            numVisible: 4,
            numScroll: 4,
            margin: 20,
        },
        {
            breakpoint: '1460px',
            numVisible: 4,
            numScroll: 4,
        },
        {
            breakpoint: '1353px',
            numVisible: 3,
            numScroll: 3,
            margin: 20,
        },
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3,
            margin: 20,
        },
        {
            breakpoint: '992px',
            numVisible: 2,
            numScroll: 2,
            margin: 20,
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 2,
            numScroll: 2
        }
    ];
    carouselResponsiveOptions: any[] = [
        // {
        //     breakpoint: '1680px',
        //     numVisible: 10,
        //     numScroll: 10,
        //     margin: 20,
        // },
        // {
        //     breakpoint: '1460px',
        //     numVisible: 10,
        //     numScroll: 10,
        //     margin: 20,
        // },
        {
            breakpoint: '1353px',
            numVisible: 10,
            numScroll: 10,
            margin: 20,
        },
        {
            breakpoint: '1024px',
            numVisible: 8,
            numScroll: 8,
            margin: 20,
        },
        {
            breakpoint: '768px',
            numVisible: 5,
            numScroll: 5,
            margin: 20,
        },
        // {
        //     breakpoint: '560px',
        //     numVisible: 4,
        //     numScroll: 4,
        //     margin: 20,
        // }
    ];
    showOtpErrors: boolean = false;
    otpError = undefined;
    // @ViewChild('ngxotp') ngxotp: NgxOtpInputComponent;
    public config: NgxOtpInputConfig = {
        otpLength: 4,
        autofocus: true,
        pattern: /^\d+$/,
        autoblur: true,
        numericInputMode: true,
        classList: {
          inputBox: 'my-super-box-class',
          input: 'my-super-class',
          inputFilled: 'my-super-filled-class',
          inputDisabled: 'my-super-disable-class',
          inputSuccess: 'my-super-success-class',
          inputError: 'my-super-error-class',
        },
      };
    displayBasic: boolean | undefined;
    venueImages: any[] = [];
    public otp: string;
    public listingblock;
    public loading: boolean = true;
    public bannerList: any[] = [];
    public bannerImageList: any[] = [];
    public venueList: any[] = [];
    public totalRecords: 0;
    errorMessage = '';
    public pagination = [8, 10, 20, 50, 100, 1000, { showAll: 'All' }];
    public categoryMenuList: any[] = [];
    public parentCategoryId;
    public parentCategoryDetails;
    downloadFlg: boolean = false;
    pageSize = 10;
    currentpage = 2;
    first;
    private lazyLoadEvent: LazyLoadEvent;
    public selectedCategoryId: any[];
    public allVenueList: any[] = [];
    public userId;
    public loggedInUser;
    public isLoggedIn: boolean = false;
    public loginRegisterModal: boolean = false;
    public signUpForm: FormGroup;
    public loginForm: FormGroup;
    public forgotPassForm: FormGroup;
    public loginFormSubmitted: boolean = false;
    public birthYearRange;
    public birthYearDefaultDate;
    public birthMinValue: Date = new Date(environment.defaultDate);
    public birthMaxValue: Date = new Date(maxYearFunction());
    public staticPath;
    public selectedDate;
    public defaultDate;
    public id;
    public statusChanges;
    public successMessage;
    public showForgotPasswordDialog: boolean = false;
    public userType;
    public showMessage: boolean = false;
    public selectedGender: any = null;
    public userData;
    public isLoginFailed: boolean;
    public roles;
    public trainerRoleId;
    public permissions: any[] = [];
    public permissionArray: any[] = [];
    public userTypeListArray: any[] = [];
    public rolelist: any[] = [];
    public ipAddress;
    public minYear = environment.minYear;
    public showGenderError;
    public displayModal: boolean;
    public activeIndex: number = 0;
    public message;
    public wishlist: any[];
    public totalWishlistRecords;
    sliderimage: any;
    pagescroll: any;
    pageNumber = 1;
    direction;
    venuearraylist: any[] = [];
    tmpVenueList: any[] = [];
    searchkey;
    public finalVenueList: any[] = [];
    totalRecordFinalVenue: any;
    public rating = 3;
    public cities: City[];
    public filteredCountries: any[] = [];
    selectedCountries: any[];
    filtration: any[] | undefined;
    occasion: any;
    categoryiid: any;
    public selectedCity3: string;
    public selectedCountry: string;
    public countries: any[];
    public item: string;
    public date12: Date;
    public date13: Date;
    public rangeDates: Date;
    public es: any;
    public invalidDates: Array<Date>
    public menuFilter: Product[];
    public selectedProduct: Product;
    public filterCapacityArray: any[] = [];
    public venueCapacity;
    public selectedVenueCapacity;
    public selectedGuestName;
    statecode = '4008';
    subareaList: any;
    venuecapacity: any;
    scheduleOption: any;
    public capacity;
    public capacityCondition;
    public capacityId;
    public selectedVenueIds: any[] = [];
    public selectedSubareaIds: any[] = [];
    public cityList: any[] = [];
    public venueNameList: any[] = [];
    public selectedCities: any[] = [];
    public startDate;
    public endDate;
    public allFoodMenuPriceArray: any[] = [];
    public venueId;
    public urlMode;
    public displayTime;
    public showResendButton: boolean = false;
    public countDown: Subscription;
    public counter;
    public tick;
    public minDateValue: Date;
    public filterOccasion;
    public noVenueFlag: boolean = false;

    vendorList: any[];
    occasionList: any[];
    groupedMenuList: SelectItemGroup[] | undefined = [];
    searchItem;
    filteredGroups: any[] | undefined;

    //@ViewChild('paginator', { static: true }) paginator: Paginator
    @ViewChild('searchCalendar', { static: true }) datePicker;
    @ViewChild('searchCalendarMobileView', { static: true }) datePickerMobile;
    constructor(
        private filterService: FilterService,
        private photoService: PhotoService,
        private productService: ProductService,
        private BannerService: BannerService,
        private venueService: VenueService,
        private router: Router,
        private categoryService: CategoryService,
        private userService: UserService,
        private activeroute: ActivatedRoute,
        private tokenStorageService: TokenStorageService,
        private formBuilder: FormBuilder,
        private roleService: RoleService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private wishlistService: WishlistService,
        private subareaService: SubareaService,
        private cityService: CityService,
        private renderer: Renderer2,
        private meta: Meta,
        private title: Title,
    ) {
        // p-galleria.prototype.onTouchMove = () => { };
    }
    clearDatesAndClose() {
        // this.rangeDates = null; // or reset to initial value
        this.datePicker.hideOverlay();
      }
      closeDatesMobileView(){
        this.datePickerMobile.hideOverlay();
      }
    ngOnInit() {
        const canonicalLink = this.renderer.createElement('link');
        this.renderer.setAttribute(canonicalLink, 'rel', 'canonical');
        this.renderer.setAttribute(canonicalLink, 'href', window.location.href);
        this.renderer.appendChild(document.head, canonicalLink);
        this.minDateValue = new Date();
        this.filterCapacityArray = [
            {
                'id': 1, 'label': "50", condition: 'lte', value: 50, status: false
            },
            {
                'id': 2, 'label': "100", condition: 'lte', value: 100, status: false
            },
            {
                'id': 3, 'label': "200", condition: 'lte', value: 200, status: false
            },
            {
                'id': 4, 'label': "500", condition: 'lte', value: 500, status: false
            },
            {
                'id': 5, 'label': "1000", condition: 'lte', value: 1000, status: false
            },
            {
                'id': 6, 'label': "1500", condition: 'lte', value: 1500, status: false
            },
            {
                'id': 7, 'label': "2000", condition: 'lte', value: 2000, status: false
            },
        ]
        // this.photoService.getImages().then((images) => (this.images = images));
        this.productService.navigationMenu().then(menu => {
            this.menuFilter = menu;
        });
        this.productService.getProductsSmall().then(products => this.products = products);
        this.mobileForm = this.formBuilder.group({
            mobileNumber: [null, [Validators.required, Validators.pattern("[0-9 ]{10}"), Validators.minLength(10)]],
        })
        this.id = this.activeroute.snapshot.params.id;
        this.staticPath = environment.productUploadUrl;
        this.loggedInUser = this.tokenStorageService.getUser();
        let getToken = this.tokenStorageService.getToken();
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
        this.forgotPassForm = new FormGroup({
            email: new FormControl("", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}")])
        });
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
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
            userType: ['user']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
        this.defaultDate = new Date();
        let today = new Date();
        this.defaultDate.setDate(today.getDate() + environment.defaultDays);
        this.selectedDate = this.defaultDate;
        //this.onClickEventDate(this.selectedDate);
        this.first = (this.currentpage - 1) * this.pageSize;
        this.productService.getVenue().then(products => {
            this.products = products;
        });
        // this.getCategoryBySlug();
        //for uppder scrolling occasions
        this.getCategoryListNew();
        // this.getVendorBySlug();

        this.getSearchMenuList();


        // this.categoryService._categoryid.subscribe(cid => {
        //     // if (cid != null) {
        //     //     this.selectedCategoryId = cid;
        //     // }
        // })
        this.getSubareas();
        this.getCities();
        // this.getVenues();
        //this.getVenueList(this.selectedCategoryId);
        this.getVenueList();
        this.getAllVenueList();
        this.title.setTitle("Find the Right Banquet Halls Near You at EazyVenue.com")
        this.meta.addTag({name:"title",content:"Find the Right Banquet Halls Near You at EazyVenue.com"})
        this.meta.addTag({name:"description",content:"Discover Your Perfect Event Venue with EazyVenue.com, Explore exquisite banquet halls specially curated for weddings, parties, and corporate gatherings. Our diverse spaces ensure your events are unforgettable."})
        this.meta.addTag({name:"keywords",content:"banquet halls, Best banquet halls near me, wedding banquet halls,party halls, marriage halls near me"})
        this.meta.addTag({ name: 'robots', content: 'index, follow' });

    }
    getAllVenueList() {
        let query = "filterByDisable=false&filterByStatus=true&filterByAssured=true";
        // &filterByCategory=" + this.selectedCategoryId;
        this.venueService.getVenueListAllVenues().subscribe(
            data => {
                // console.log(data);

                //if (data.data.items.length > 0) {
                this.allVenueList = data.data.items;
                //}
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    getCategoryListNew(){
        this.venueService.getOccastionCategoryList().subscribe(
            data => {
                //if (data.data.items.length > 0) {
                    // this.categoryMenuList = data.data;
                this.categoryMenuList = data.data.filter( o => o.name !== "Couple Dates" && o.name !== "Castles")
                // console.log(this.categoryMenuList);

                // this.occasionList = data.data.items;
                // this.selectedCategoryId = this.categoryMenuList[0].id;
                let index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
                if (index != -1) {
                    this.categoryMenuList[index]['show'] = 'false';
                }
                if (this.isLoggedIn == true) {
                    //this.getWishlist();
                } else {
                    // this.getVenueList(this.lazyLoadEvent);
                    // this.getAllVenueList();
                }
                //}
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
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
    get h() {
        return this.mobileForm.controls;
    }
    private updateCurrentPage(currentPage: number): void {
        //setTimeout(() => this.paginator.changePage(currentPage));
    }
    showOfferDialog() {
        this.urlMode = "venue_list";
        if (this.selectedCategoryId == undefined) {
            this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select venue occasion.', life: 3000 });
            return;
        }
        if (this.selectedCities.length === 0 && this.selectedSubareaIds.length === 0 && this.selectedVenueIds.length === 0) {
            this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please enter city or area or venue.', life: 3000 });
            return;
        }
        if (this.capacity === undefined) {
            this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select guest count.', life: 3000 });
            return;
        }
        // if (this.startDate === undefined && this.endDate === undefined) {
        //     this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select date.', life: 3000 });
        //     return;
        // }
        if (this.isLoggedIn == false) {
            this.numberPopup = true;
            this.otpPopup = false;
            this.otpthankyouPopup = false;
            // this.ngxotp.clear();
            this.otp = undefined;
        } else {
            let selectedCities = JSON.stringify(this.selectedCities);
            let selectedSubareaIds = JSON.stringify(this.selectedSubareaIds);
            let selectedVenueIds = JSON.stringify(this.selectedVenueIds);

            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
            this.router.navigate(
                ['/banquet-halls'],
                {
                    queryParams: {
                        startDate: this.startDate, endDate: this.endDate, capacity: this.capacity, occasion: this.selectedCategoryId, city: selectedCities,
                        area: selectedSubareaIds, venue: selectedVenueIds
                    }
                }
            );
        }
    }
    showDialogotp() {
        this.otpPopup = true;
        this.numberPopup = false;
        this.otpthankyouPopup = false;
        if (this.countDown) {
            this.countDown?.unsubscribe();
        }

    }
    showDialogthankyou() {
        this.otpthankyouPopup = true;
        this.numberPopup = false;
        this.otpPopup = false;
    }
    toggleCanvas() {
    }
    toggleSearch() {
    }
    getVenues(){
        this.venueService.getVenueListAllVenues().subscribe(
            res => {
                this.venueNameList = res.data.items;
            },
            err =>{

            }
        )
    }
    getCities() {
        // let query = "?filterByDisable=false&filterByStatus=true";
        this.cityService.getcityList("list=true").subscribe(
            data => {
                // console.log(data);

                this.cityList = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    async getWishlist() {
        let query = "?filterByStatus=true&filterByCustomerId=" + this.userId;
        this.wishlistService.getWishlist(query).subscribe(
            data => {
                this.loading = false;
                this.wishlist = data.data.items;
                this.totalWishlistRecords = data.data.totalCount;
                // this.getVenueList(this.lazyLoadEvent);
                // this.getAllVenueList();
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }
    onScrollDown() {
        this.pageNumber++;
        this.direction = "down";
        //dialog show
        // console.log('show');

        this.getVenueList();
    }
    onClickCalendarClose() {
        this.datePicker.overlayVisible = false;
    }
    onClickCategory(category) {
        if (category != null) {
            this.occasion = category;
            this.searchItem = category;
            this.categoryService.categoryid(category.id);
            this.selectedCategoryId = category.id;
            this.categoryMenuList.map(x => x.show = 'false');
            var index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
            if (index != -1) {
                this.categoryMenuList[index]['show'] = 'active';
            }
        } else {
            this.selectedCategoryId = [];
            this.categoryMenuList.forEach(element => {
                element['show'] = 'false'
            })
        }
        if (this.selectedCategoryId == undefined) {
            this.selectedCategoryId = [];
        }
        this.finalVenueList = [];
        this.pageNumber = 1;
        this.getVenueList();
        // this.getAllVenueList();
    }

    onClickClear() {
        this.rangeDates = null;
        this.startDate = undefined;
        this.endDate = undefined;
        this.finalVenueList = [];
        this.pageNumber = 1;
        this.getVenueList();
    }
    onSelectDate(event) {
        this.startDate = this.rangeDates[0];
        this.endDate = this.rangeDates[1];
        if (this.endDate === null) {
            this.endDate = moment(this.startDate).format("YYYY-MM-DD");
        } else {
            this.datePicker.overlayVisible = false;
            this.endDate = moment(this.rangeDates[1]).format("YYYY-MM-DD");
        }
        this.startDate = moment(this.rangeDates[0]).format("YYYY-MM-DD");
        // this.finalVenueList = [];
        // this.pageNumber = 1;
        // this.getVenueList();
    }
    getVenueList() {
        // console.log(this.selectedCategoryId);
        // console.log(this.selectedCities);
        // console.log(this.capacityCondition);
        // console.log(this.capacity);
        // console.log(this.startDate);
        // console.log(this.endDate);


        let params = "";
        let rows = 10;
        let query = "filterByDisable=false&filterByStatus=true&filterByAssured=true";
        if (this.selectedCategoryId !== undefined) {
            query += "&filterByCategory=" + this.selectedCategoryId;
        }
        query += "&pageSize=" + rows + "&pageNumber=" + this.pageNumber + params;
        if ((this.capacityCondition != '' && this.capacity != '') && (this.capacityCondition != undefined && this.capacity != undefined)) {
            query += "&filterByGuestCondition=" + this.capacityCondition + "&filterByGuestCapacity=" + this.capacity;
        }
        // if (this.selectedVenueIds.length > 0) {
        //     query += "&filterByVenueIds=" + this.selectedVenueIds;
        // }
        if (this.selectedSubareaIds.length > 0) {
            query += "&filterBySubareaIds=" + this.selectedSubareaIds;
        }
        if (this.selectedCities.length > 0) {
            query += "&filterByCities=" + this.selectedCities;
        }
        if (this.startDate != null && this.endDate != null) {
            query += "&filterByStartDate=" + this.startDate + "&filterByEndDate=" + this.endDate;
        }
        this.venueList = [];
        this.venueList = Object.assign([], this.finalVenueList)
        // console.log(query);

        // this.finalVenueList = [];
        let newQuery = "?assured=true&disabled=false&pageSize=" + rows + "&pageNumber=" + this.pageNumber;
        if(this.selectedCategoryId !== undefined){
            newQuery += "&categoryId="+this.selectedCategoryId;
        }
        if(this.capacity !== undefined && this.capacity != ''){
            newQuery += "&guestCount=" + this.capacity;
        }
        this.selectedVenueIds.forEach(element => {
            newQuery += "&venueIds="+element;
        });
        this.selectedSubareaIds.forEach(element => {
            newQuery+= "&subareaid="+element;
        });
        this.selectedCities.forEach(element => {
            newQuery+= "&citycode="+element;
        });

        if(this.startDate != null){
            newQuery += "&startSearchDate="+this.startDate
        }
        if(this.endDate != null){
            newQuery += "&endSearchDate="+this.endDate
        }

        // console.log(newQuery);




        this.venueService.getVenueListForFilter(newQuery).subscribe(
        // this.venueService.getVenueListWithoutAuth(query).subscribe(
            data => {
                //if (data.data.items.length > 0) {
                this.loading = false;
                this.tmpVenueList = data.data.items;
                this.tmpVenueList.forEach(tElement => {
                    if (tElement.venueVideo !== '') {
                        tElement.venueImage.push({ video: tElement.venueVideo });
                    }
                })
                this.finalVenueList = [...this.venueList, ...this.tmpVenueList];
                this.totalRecords = data.data.totalCount;
                if (this.finalVenueList.length > 0) {
                    this.finalVenueList.forEach(element => {
                        this.allFoodMenuPriceArray = [];
                        if (element.foodMenuType) {
                            //element.foodMenuType.forEach(fElement => {
                            if (element.foodMenuType.jainFood !== undefined) {
                                if (element.foodMenuType.jainFood.length > 0) {
                                    element.foodMenuType.jainFood.forEach(jfElement => {
                                        if (jfElement.value > 0) {
                                            this.allFoodMenuPriceArray.push(jfElement.value);
                                        }
                                    });
                                }
                            }
                            if (element.foodMenuType.mixFood !== undefined) {
                                if (element.foodMenuType.mixFood.length > 0) {
                                    element.foodMenuType.mixFood.forEach(mfElement => {
                                        if (mfElement.value > 0) {
                                            this.allFoodMenuPriceArray.push(mfElement.value);
                                        }
                                    });
                                }
                            }
                            if (element.foodMenuType.non_veg !== undefined) {
                                if (element.foodMenuType.non_veg.length > 0) {
                                    element.foodMenuType.non_veg.forEach(nvElement => {
                                        if (nvElement.value > 0) {
                                            this.allFoodMenuPriceArray.push(nvElement.value);
                                        }
                                    });
                                }
                            }
                            if (element.foodMenuType.veg_food !== undefined) {
                                if (element.foodMenuType.veg_food.length > 0) {
                                    element.foodMenuType.veg_food.forEach(vElement => {
                                        if (vElement.value > 0) {
                                            this.allFoodMenuPriceArray.push(vElement.value);
                                        }
                                    });
                                }
                            }
                            // });
                        }
                        let minPrice = 0;
                        if (this.allFoodMenuPriceArray.length > 0) {
                            minPrice = Math.min(...this.allFoodMenuPriceArray)
                        }
                        element['minPrice'] = minPrice;
                    });
                    this.noVenueFlag = false;
                } else {
                    this.noVenueFlag = true;
                }
                this.totalRecordFinalVenue = this.finalVenueList.length;
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }
    onClickGuestCount(capacity, event) {
        if (capacity.id != undefined) {
            this.capacityId = capacity.id;
            this.capacity = capacity.value;
            this.capacityCondition = capacity.condition;
            this.filterCapacityArray.forEach(element => {
                let reportObj = { id: element.id, label: element.label, condition: element.condition, value: element.value, status: element.status };
                element.status = false;
                if (this.capacityId == element.id) {
                    const index = this.findIndexById(element.id, this.filterCapacityArray);
                    reportObj = { id: element.id, label: element.label, condition: element.condition, value: element.value, status: true };
                    this.filterCapacityArray[index] = reportObj;
                }
            })
        } else {
            this.capacity = capacity;
            this.capacityCondition = '';
            if (capacity > 500) {
                this.capacityCondition = "gte";
            } else {
                this.capacityCondition = "lte";
            }
        }
        if (this.capacity === '') {
            this.capacity = undefined;
        }
        // this.finalVenueList = [];
        // this.pageNumber = 1;
        // this.getVenueList();
    }
    findIndexById(id, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    getSearchMenuList() {

        this.venueService.getHomeMenuFilter().subscribe(res =>{
            this.groupedMenuList = res.data;
            // console.log(this.groupedMenuList);

        },err => {

        })

        // let vendorParentQuery = "?filterByDisable=false&filterByStatus=true&filterBySlug=Vendor";
        // this.categoryService.getCategoryWithoutAuthList(vendorParentQuery).subscribe(
        //     vendorParentData => {
        //         let vedorListQuery = "?filterByDisable=false&filterByStatus=true&filterByParent=" + vendorParentData.data.items[0]['id'] + "&sortBy=created_at&orderBy=1";
        //         this.categoryService.getCategoryWithoutAuthList(vedorListQuery).subscribe(
        //             vendorListData => {
        //                 let photoItem = vendorListData.data.items.filter(o => o.name === "Photographer");
        //                 this.groupedMenuList.push({ label: "Vendor", value: "Vendor", items: photoItem })
        //                 let occationParentQuery = "?filterByDisable=false&filterByStatus=true&filterBySlug=parent_category";
        //                 this.categoryService.getCategoryWithoutAuthList(occationParentQuery).subscribe(
        //                     occationParentData => {
        //                         let occasionListQuery = "?filterByDisable=false&filterByStatus=true&filterByParent=" + occationParentData.data.items[0]['id'] + "&sortBy=created_at&orderBy=1";
        //                         this.categoryService.getCategoryWithoutAuthList(occasionListQuery).subscribe(
        //                             occasionListData => {
        //                                 this.groupedMenuList.push({ label: "Occasion", value: "Occasion", items: occasionListData.data.items })
        //                                 console.log(this.groupedMenuList);

        //                             },
        //                             occasionListErr => {
        //                                 this.errorMessage = occasionListErr.error.message;
        //                             }
        //                         )
        //                     },
        //                     occasionParentErr => {
        //                         this.errorMessage = occasionParentErr.error.message;
        //                     }
        //                 )
        //             },
        //             vendorListErr => {
        //                 this.errorMessage = vendorListErr.error.message;
        //             }
        //         )
        //     },
        //     vendorParentErr => {
        //         this.errorMessage = vendorParentErr.error.message;
        //     }
        // )

    }
    filterGroupedSearch(event) {
        let query = event.query;
        let filteredGroups = [];

        for (let optgroup of this.groupedMenuList) {
            let filteredSubOptions = this.filterService.filter(optgroup.items, ['name'], query, "contains");
            if (filteredSubOptions && filteredSubOptions.length) {
                filteredGroups.push({
                    label: optgroup.label,
                    value: optgroup.value,
                    items: filteredSubOptions
                });
            }
        }

        this.filteredGroups = filteredGroups;
    }
    onClickGroupedSearch(category) {
        // console.log(category);
        // searchItem
        if (category != null) {
            this.vendorSelection = category.name === "Photographer";
            if (category.name === "Photographer" || category.name === "Decorater") {
                // this.router.navigateByUrl("vendor-list")


                this.router.navigateByUrl("/vendor/"+category.slug, { state: category })

                return;
            }
            this.occasion = category;
            this.categoryService.categoryid(category.id);
            this.selectedCategoryId = category.id;
            // this.groupedMenuList.forEach(element => {
            //     element.items.map((x:any) => x.show = 'false')
            // })
            // // this.categoryMenuList.map(x => x.show = 'false');
            // var index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
            // if (index != -1) {
            //     this.categoryMenuList[index]['show'] = 'active';
            // }
        } else {
            this.selectedCategoryId = [];
            this.categoryMenuList.forEach(element => {
                element['show'] = 'false'
            })
        }
        if (this.selectedCategoryId == undefined) {
            this.selectedCategoryId = [];
        }
        //removed avoid filter
        // this.finalVenueList = [];
        // this.pageNumber = 1;
        // this.getVenueList();

        // this.getAllVenueList();
    }

    // getCategoryBySlug() {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterBySlug=parent_category";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             if (data.data.items.length > 0) {
    //                 this.parentCategoryDetails = data.data.items[0];
    //                 let parentCategoryId = this.parentCategoryDetails['id'];
    //                 this.getCategoryList(parentCategoryId);
    //             }
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // getVendorBySlug() {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterBySlug=Vendor";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             console.log(data);

    //             if (data.data.items.length > 0) {
    //                 // this.parentCategoryDetails = data.data.items[0];
    //                 let parentCategoryId = data.data.items[0]['id'];
    //                 this.getVendorList(parentCategoryId);
    //             }
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // getVendorList(parentCategoryId: any) {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + parentCategoryId + "&sortBy=created_at&orderBy=1";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.categoryMenuList = data.data.items;
    //             // this.vendorList = data.data.items;
    //             // this.selectedCategoryId = this.categoryMenuList[0].id;
    //             let index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
    //             if (index != -1) {
    //                 this.categoryMenuList[index]['show'] = 'false';
    //             }
    //             if (this.isLoggedIn == true) {
    //                 //this.getWishlist();
    //             } else {
    //                 // this.getVenueList(this.lazyLoadEvent);
    //                 // this.getAllVenueList();
    //             }
    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // getCategoryList(parentCategoryId: any) {
    //     let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + parentCategoryId + "&sortBy=created_at&orderBy=1";
    //     this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.categoryMenuList = data.data.items;
    //             // this.occasionList = data.data.items;
    //             // this.selectedCategoryId = this.categoryMenuList[0].id;
    //             let index = this.categoryMenuList.findIndex(x => x.id === this.selectedCategoryId);
    //             if (index != -1) {
    //                 this.categoryMenuList[index]['show'] = 'false';
    //             }
    //             if (this.isLoggedIn == true) {
    //                 //this.getWishlist();
    //             } else {
    //                 // this.getVenueList(this.lazyLoadEvent);
    //                 // this.getAllVenueList();
    //             }
    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // getAllVenueList() {
    //     let query = "filterByDisable=false&filterByStatus=true&filterByAssured=true";
    //     // &filterByCategory=" + this.selectedCategoryId;
    //     this.venueService.getVenueListWithoutAuth(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.allVenueList = data.data.items;
    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    getVenueDetails(id) {
        // console.log(id);

        this.venueId = id;
        this.urlMode = "venue_details";
        if (this.isLoggedIn == false) {
            this.numberPopup = true;
            this.otpPopup = false;
            this.otpthankyouPopup = false;
        } else {
            this.router.navigateByUrl('/venue/' + id);
        }
    }
    getRoleDetails() {
        const querystring = "filterByroleId=" + this.userData.data.userdata.role;
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.trainerRoleId = data.data.items[0]['id'];
                this.permissions = data.data.items[0]['permissions'];
                this.tokenStorageService.saveUserPermissions(this.permissions);
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
                    this.tokenStorageService.saveRolelist(rolearray);
                }
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
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
        //this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
        //this.ipAddress = res.ip;
        this.authService.login(username, password, this.userType).subscribe(
            data => {
                this.userData = data;
                this.tokenStorageService.saveToken(this.userData.data.access_token);
                this.tokenStorageService.saveUser(this.userData.data);
                this.tokenStorageService.getAuthStatus(this.userData.data);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
                this.roles = this.tokenStorageService.getUser().roles;
                this.getRoleDetails();
                this.getRoleList();
                let currentUrl = '/';
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                this.router.navigate([currentUrl]);
                this.loginRegisterModal = false;
            },
            err => {
                this.errorMessage = 'Login failed: Please check your login credentials...! ';
                this.isLoginFailed = true;
            }
        );
        //});
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

        this.showResendButton = false;
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
          let length = c.value.length;
          this.showOtpErrors = false;
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
        this.showOtpErrors = false;
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
                this.tokenStorageService.saveToken(this.userData.data.access_token);
                this.tokenStorageService.saveUser(this.userData.data.userdata);
                //this.tokenStorageService.getAuthStatus(this.userData.data);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
                //this.roles = this.tokenStorageService.getUser().roles;
                // this.getRoleDetails();
                // this.getRoleList();
                this.mobileForm.reset();
                let selectedCities = JSON.stringify(this.selectedCities);
                let selectedSubareaIds = JSON.stringify(this.selectedSubareaIds);
                let selectedVenueIds = JSON.stringify(this.selectedVenueIds);
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                let currentUrl = "/";
                if (this.urlMode === 'venue_list') {
                    currentUrl = "/banquet-halls";
                    this.router.navigate(
                        [currentUrl],
                        {
                            queryParams: {
                                startDate: this.startDate, endDate: this.endDate, capacity: this.capacity, occasion: this.selectedCategoryId, city: selectedCities,
                                area: selectedSubareaIds, venue: selectedVenueIds
                            }
                        }
                    );
                    return;
                }
                if (this.urlMode === 'venue_details') {
                    currentUrl = '/venue/' + this.venueId;
                    this.router.navigate(
                        [currentUrl],
                    );
                    return;
                }
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
    resendOtp() {
        this.otp = "";
        this.showOtpErrors = false;
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
        this.numberPopup = true;
        this.otpPopup = false;
        // this.ngxotp.clear();
        this.otp = undefined;
        this.countDown?.unsubscribe();
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
        this.tokenStorageService.isLoggedOut();
        let currentUrl = '/';
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
        return false;
    }
    onClickShowForgotPasswordDialog() {
        this.showForgotPasswordDialog = true;
        this.loginRegisterModal = false;
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
    async onClickWishlist(venue) {
        if (this.isLoggedIn == false) {
            this.loginRegisterModal = true;
            return;
        } else {
            let venueId = venue.id;
            this.loginRegisterModal = false;
            if (venue.wishlist == false) {
                let wishlistObj = {
                    "customerId": this.userId,
                    "venueId": venueId,
                    "status": true,
                    "disable": venue.wishlist
                }
                this.wishlistService.addWishlist(wishlistObj).subscribe(res => {
                    this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Success', detail: 'Venue added to wishlist.', life: 3000 });
                }, err => {
                    this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.error, detail: 'System error, Please try again.', life: 6000 });
                });
            } else {
                let wishlistId = venue.wishlistId;
                let wishlistData = {
                    disable: true
                };
                this.wishlistService.updateWishlist(wishlistId, wishlistData).subscribe(res => {
                    this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Success', detail: 'Venue remove from wishlist.', life: 3000 });
                }, err => {
                    this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.error, detail: 'System error, Please try again.', life: 6000 });
                });
            }
            setTimeout(() => {
                let currentUrl = '/';
                this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                this.router.onSameUrlNavigation = 'reload';
                this.router.navigate([currentUrl]);
            }, 2000);
        }
    }
    open(event) {
        this.activeIndex = 0;
        this.displayBasic = true;
        let venueData = '';
        this.venueImages = [];
        venueData = this.finalVenueList.find(x => x.id == event);
        this.venueImages = venueData['venueImage'];
    }
    getSubareas() {
        var query = "?filterByDisable=false&filterByStatus=true";
        this.subareaService.getSubareaList(query).subscribe(
            data => {
                this.subareaList = data.data.items;
                this.subareaList.forEach(element => {
                    element['name'] = element.name;
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    search(event: AutoCompleteCompleteEvent) {
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
        for (let i = 0; i < this.subareaList.length; i++) {
            let subarea = this.subareaList[i];
            if (subarea.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                subarea.mode = "subarea";
                filtered.push(subarea);
            }
        }
        for (let i = 0; i < this.allVenueList.length; i++) {
            let venue = this.allVenueList[i];
            if (venue.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                venue.mode = "venue";
                filtered.push(venue);
            }
        }
        this.filtration = filtered;
    }
    filterCategory(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.categoryMenuList.length; i++) {

            let category = this.categoryMenuList[i];
            // console.log(category);
            if (category.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {

                filtered.push(category);
            }
        }
        this.filterOccasion = filtered;
    }
    onSelectSearch(event) {
        if (event.mode == 'venue') {
            this.selectedVenueIds.push(event.id);
        }
        if (event.mode == 'subarea') {
            this.selectedSubareaIds.push(event.id);
        }
        if (event.mode == 'city') {
            this.selectedCities.push(event.id);
        }
        // this.finalVenueList = [];
        // this.pageNumber = 1;
        // this.getVenueList();
    }
    onClearResetAllData(event) {
        if (event.mode === 'venue') {
            let index = this.findVenueIndexById(event.id, this.selectedVenueIds);
            if (index !== -1) {
                this.selectedVenueIds.splice(index, 1);
            }
        }
        if (event.mode === 'subarea') {
            let index = this.findVenueIndexById(event.id, this.selectedSubareaIds);
            if (index !== -1) {
                this.selectedSubareaIds.splice(index, 1);
            }
        }
        if (event.mode === 'city') {
            let index = this.findVenueIndexById(event.id, this.selectedCities);
            if (index !== -1) {
                this.selectedCities.splice(index, 1);
            }
        }
        // this.finalVenueList = [];
        // this.pageNumber = 1;
        // this.getVenueList();
    }
    findVenueIndexById(id, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i] === id) {
                index = i;
                break;
            }
        }
        return index;
    }
    onCapacitySelect(event) {
        if (event != undefined) {
            if (event.value.value > this.venueCapacity) {
            }
            this.selectedVenueCapacity = event.value.value | this.venuecapacity;
            this.selectedGuestName = event.value.label;
        }
    }
    onCategorySelect(event) {
        // this.categoryService.categoryid(event.value);
        this.occasion = event.value;
        if (this.occasion) {
            this.showoccasionerror = false;
        }
    }
    getCategoryid() {
        this.categoryService._categoryid.subscribe(cid => {
            var categoryid = this.categoryMenuList.find(x => x.id == cid);
            this.occasion = categoryid.id;
        })
    }
    onRangeDate() {
    }
    onChangevenue(event) {
        this.venuecityname = event.name;
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
    @HostListener('window:keyup.esc', ['$event']) w(e: KeyboardEvent) {
        this.displayBasic = false;
    }


    // showDialogoffer() {
    //     if (this.isLoggedIn == false) {
    //         this.numberPopup = true;
    //         this.otpPopup = false;
    //         this.otpthankyouPopup = false;
    //         this.ngxotp.clear();
    //         this.otp = undefined;
    //     }
    // }
    showDialogoffer() {
        this.otpPopup = true;
        this.homeSearch = false;
        this.otpthankyouPopup = false;
    }

    // onTouchEnd(e: TouchEvent) {
    //     let touchobj = e.changedTouches[0];

    //     if (this.isVertical) {
    //         this.changePageOnTouch(e, touchobj.pageY - (<{ x: number; y: number }>this.startPos).y);
    //     } else {
    //         this.changePageOnTouch(e, touchobj.pageX - (<{ x: number; y: number }>this.startPos).x);
    //     }
    // }

    // onTouchMove(e: TouchEvent) {
    //     if (e.cancelable) {
    //         e.preventDefault();
    //     }
    // }

    // onTouchStart(e: TouchEvent) {
    //     let touchobj = e.changedTouches[0];

    //     this.startPos = {
    //         x: touchobj.pageX,
    //         y: touchobj.pageY
    //     };
    // }
}
