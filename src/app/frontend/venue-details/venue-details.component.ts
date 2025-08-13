import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    Renderer2,
    Inject,
    PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
// import data from '../../../assets/demo/data/navigation.json';
import { EnquiryService } from '../../manage/eventmanager/service/eventmanager.service';
import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
// import listingblock from '../../../assets/demo/data/listing.json';
import { VendorService } from 'src/app/services/vendor.service';
import { BannerService } from 'src/app/services/banner.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { environment } from 'src/environments/environment';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { CategoryService } from 'src/app/services/category.service';
import * as moment from 'moment';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { PostAvailabilityService } from 'src/app/services/postAvailability.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { VenueOrderService } from 'src/app/services/venueOrder.service';
import { HttpClient } from '@angular/common/http';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators,
    FormControl,
} from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { RoleService } from 'src/app/services/role.service';
import { AuthService } from 'src/app/services/auth.service';
import { maxYearFunction } from 'src/app/_helpers/utility';
import { UserService } from 'src/app/services/user.service';
import { SlotService } from 'src/app/services/slot.service';
import { CityService } from 'src/app/manage/city/service/city.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { RazorpayService } from 'src/app/services/razorpay.service';
import { AnalyticsService } from '../../services/analytics.service';
import { GeolocationService, UserLocation, VenueWithDistance } from '../../services/geolocation.service';
import { BookingService, BookingData } from '../../services/booking.service';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
declare var google: any;

declare var Razorpay;
interface CompareReview {
  text: string;
  rating: number;
  plateRating: string;
  capacity: number;
  reviewtitle?: string;
  reviewdescription?: string;
  reviewrating?: number;
  created_at?: string;
  author_name?: string;
}




interface City {
    name: string;
    code: string;
}
@Component({
    selector: 'app-venue-details',
    templateUrl: './venue-details.component.html',
    styleUrls: ['./venue-details.component.scss'],
    providers: [BannerService, ConfirmationService, MessageService],
    styles: [
        `
            .bg-light
                app-root
                app-frontend
                #front
                page-header
                .sigma_header
                .sigma_header-bottom
                .sigma_header-bottom-inner
                app-navigation
                .navigation-search-bar {
                display: none !important;
            }
        `,
    ],
})
export class VenueDetailsComponent implements OnInit, OnDestroy {
    
    // Review source & toggling states

    [x: string]: any;
    venueDetailSearch: boolean = false;
    responsiveOptions: any[] | undefined;
    //selectedReviewSource: string = 'eazyvenue';
  showReviewForm: boolean = false;
  showAllReviews: boolean = false;
  googleReviews: any[] = [];
  isLoadingGoogleReviews: boolean = false;
   expandedReviews: boolean[] = [];
   currentSlide: number = 0;
  reviewsPerSlide: number = 3;
  userPhotos: any[] = [];
  CompareReviews:any[]=[];
  newReview = {
    reviewtitle: '',
    reviewrating: 0,
    reviewdescription: ''
  };
    displayCustomAmountModal: boolean = false;
    reviewForm: FormGroup;

    showVenueDetailSearch() {
        this.venueDetailSearch = true;
    }
    visible: boolean;
    showGoogleReviews = false;
    combinedRating = 0;
    selectedCountries: any[];
    filteredCountries: any[];
    showDialog() {
        this.visible = true;
    }
    venueDetailfilter() {
        this.showVenueDetailFilter = true;
    }
    venueSendquery() {
        this.showVenuesendquery = true;
    }

    showVenueDetailFilter: boolean = false;
    showVenuesendquery:boolean = false;
    classToggled = false;
    availableClasses: string[] = ['light', 'normal-header'];
    currentClassIdx: number = 0;
    bodyClass: string;
  nearbyVendors: any[] = [];
  vendorCategories = [
    { name: "All", slug: "" },
    { name: "Photographer", slug: "photographer" },
    { name: "Decorator", slug: "decorator" },
    { name: "Caterer", slug: "caterer" },
    { name: "Videographer", slug: "videographer" },
    { name: "Mehendi Artist", slug: "mehendi-artist" },
    { name: "DJ", slug: "dj" },
    { name: "Makeup Artist", slug: "makeup-artist" }
  ];
  selectedVendorCategory: string = "";
  vendorPageNumber: number = 1;
  vendorRows: number = 10;
  vendorLoading: boolean = false;
    occasion: City[];
    cities: City[];
    selectedCity1: City;
    selectedOccasion1: City;
    val1: number;
    val2: number = 3;
    val3: number = 5;
    val4: number = 5;
    val5: number;
    msg: string;
    products: Product[];
    map: any;
    marker: any;
    venueCoordinates: { lat: number; lng: number } | null = null;
    mapLoaded = false;
    mapError = false;
    venueMapUrl = '';
    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 12,
            numScroll: 12,
        },
        {
            breakpoint: '768px',
            numVisible: 12,
            numScroll: 12,
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1,
        },
    ];

    public finalVenueList: any[] = [];
    public rangeDates: Date[] | undefined;
    public filterGuestArray: any[] = [];
    guestCountOptions = [
        { label: '0-100', value: '0-100', selected: false },
        { label: '100-200', value: '100-200', selected: false },
        { label: '200+', value: '200+', selected: false }
      ];
    public date12: Date;
    public date13: Date;
    public es: any;
    customAmountValue: number;
    public invalidDates: Array<Date>;
    public disabledDates: Array<Date> = [];
    public bookedDatesList: any[] = [];
    public venueImageNumVisible: number = 8;
    public listingblock;
    public loading: boolean = true;
    public bannerList: any[] = [];
    public bannerImageList: any[] = [];
    public venueList: any[] = [];
    public totalRecords: 0;
    errorMessage = '';
    public pagination = environment.pagination;
    downloadFlg: boolean = false;
    public id;
    public venueDetails;
    private lazyLoadEvent: LazyLoadEvent;
    public facilitiesArray: any[] = [];
    public cityName;
    public googleMapSource;
    public categoryList;
    public occasionArray: any[] = [];
    public yearRange = environment.yearRange;
    public minDateValue;
    public maxDateValue;
    public maxYear;
    public currentYear;
    public yearDiff;
    public selectedOccasion: any[] = [];
    public selectedOccasionNames: any[] = [];
    public postArr: any[] = [];
    public selectedDate;
    public availabilityList;
    public selectedSlots: any = [];
    public filterCapacityArray: any[] = [];
    public venueCapacity;
    public foodTypesList: any[] = [];
    public foodTypesListA: any[] = [];
    public vendorList: any[] = [];
    public selectedVendor: any[] = [];
    public selectedVendorNames: any[] = [];
    public decorArray: any[] = [];
    public featureArray: any[] = [];
    public foodMenuTypesList: any[] = [];
    public selectedFoodTypeId;
    public selectedDecor;
    public selectedDecorPrice: number = 0;
    public totalVenuePrice: number = 0;
    public totalFoodPrice: number = 0;
    public selectedFeature;
    public showSendEnquiries: boolean = true;
    public selectedVenueCapacity;
    public userId;
    public loggedInUser;
    public isLoggedIn: boolean = false;
    // public loginRegisterModal: boolean = false;

    public signUpForm: FormGroup;
    public loginForm: FormGroup;
    public forgotPassForm: FormGroup;
    public submitted: boolean = false;
    public loginFormSubmitted: boolean = false;
    public venuePrice;
    public selectedSlotsName;
    public selectedGuestName;
    public selectedFoodTypeName;
    public selectedFoodTypeSlug;
    public foodMenuTypeArray: any[] = [];
    public foodMenuTypes: any[] = [];
    public showFoodMenuTypesList: boolean = false;
    public selectedFoodMenuTypes: any[] = [];
    public birthYearRange;
    public birthYearDefaultDate;
    public birthMinValue: Date = new Date(environment.defaultDate);
    public birthMaxValue: Date = new Date(maxYearFunction());
    public showDecorImages: boolean = false;
    public decorImages: any[] = [];
    public url;
    public orderType = 'book_now';
    genders;
    message;
    showMessage: boolean = false;
    selectedGender: any = null;
    userType;
    userData;
    isLoginFailed: boolean;
    roles;
    trainerRoleId;
    permissions: any[] = [];
    permissionArray: any[] = [];
    userTypeListArray: any[] = [];
    rolelist: any[] = [];
    ipAddress;
    minYear = environment.minYear;
    showGenderError;
    displayModal: boolean;
    public defaultDate;
    public tmpVenueList: any[] = [];
    public activeIndex: number = 0;
    public fullUserDetails: any;
    staticPath;
    //totalPeopleBooked = Math.floor(Math.random() * 1000);
    totalPeopleBooked;
    currentViews;
    public multipleDaySelected: boolean = false;
    public statusChanges;
    public successMessage;
    public showForgotPasswordDialog: boolean = false;
    public selectedFoodType;
    public selectedFoodMenuType;
    public slotList: any[] = [];
    public allFoodMenuPriceArray: any[] = [];
    public selectedSlot;
    public capacity;
    public selectedStartDate;
    public selectedEndDate;
    public showAvailabilityMessage: boolean = false;
    public oldDecorPrice: number = 0;
    
    // Analytics tracking properties
    public sendEnquiryClicked: boolean = false;
    public clickedOnReserved: boolean = false;
    public clickedOnBookNow: boolean = false;
    public bookingPrice;
    public subareaList: any[] = [];
    public selectedVenueIds: any[] = [];
    public selectedSubareaIds: any[] = [];
    public cityList: any[] = [];
    public selectedCities: any[] = [];
    public venuecapacity: any;
    public filterCityIds: any;
    public filterSubareaIds;
    public selectedSubareaData: any[];
    public filterVenueIds: any[] = [];
    public selectedVenueList: any[] = [];
    public filterList: any[] = [];
    public selectedSort;
    public filterOccasion;
    public selectedSlotId;
    public filteredList: any;
    selectedFilter: any[];
    public startDate;
    public endDate;
    public filterCategoryId;
    public capacityCondition;
    public selectedCategories;
    public parentCategoryDetails;
    public parentCategoryId;
    public foodTypeId;
    public categoryMenuList: any[] = [];
    public selectedDecorName;
    public sOccasion;
    public metaUrl: string;
    isBookingSummary: boolean = false;
    isBookingenquerySummary: boolean = false;
    public numberPopup = false;
    public otpPopup = false;
    mobileForm: FormGroup;
    showOtpErrors: boolean = false;
    otpError = undefined;
    public otp: string;
    public oldUser: any = {};
    public userFirstName: string = '';
    public userLastName: string = '';
    firstNameError: boolean = false;
    lastNameError: boolean = false;
    mobileNumber: any;
    offerPaymentValue25_percent: number = 0;
    paymentAmount: any;
    similarVenues: any[] = [];
    private enquiryTimer: any;
    private hasCreatedEnquiry = false;
    userLocation: UserLocation | null = null;
    
    // Analytics tracking properties
    private pageLoadTime: number = 0;
    private maxScrollDepth: number = 0;
    private currentScrollDepth: number = 0;
    private qualityScore: number = 0;
    private trackingInterval: any;
    private scrollThrottleTimer: any;
    private boundBeforeUnloadHandler: any;
    
@ViewChild('similarVenuesContainer') similarVenuesContainer!: ElementRef;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('searchCalendar', { static: true }) datePicker;
    constructor(
        private http: HttpClient,
        private renderer: Renderer2,
        private productService: ProductService,
        private enquiryService: EnquiryService,
        private BannerService: BannerService,
        private venueService: VenueService,
        private categoryService: CategoryService,
        private sanitizer: DomSanitizer,
        private postAvailabilityService: PostAvailabilityService,
        private tokenStorageService: TokenStorageService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private venueOrderService: VenueOrderService,
        private vendorService: VendorService,
        private router: Router,
        private formBuilder: FormBuilder,
        private roleService: RoleService,
        private authService: AuthService,
        private el: ElementRef,
        private userService: UserService,
        private slotService: SlotService,
        private cityService: CityService,
        private subareaService: SubareaService,
        private activeRoute: ActivatedRoute,
        private title: Title,
        private meta: Meta,
        private razorpayService: RazorpayService,
        private analyticsService: AnalyticsService,
        private geolocationService: GeolocationService,
        private bookingService: BookingService,
        private fb: FormBuilder,
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.bodyClass = this.availableClasses[this.currentClassIdx];
        if (isPlatformBrowser(this.platformId)) {
            this.changeBodyClass();
        }
    }

    ngOnInit() {
        this.initReviewForm();

        // Browser-only code - wrapped in platform check
        if (isPlatformBrowser(this.platformId)) {
            const canonicalLink = this.renderer.createElement('link');
            this.renderer.setAttribute(canonicalLink, 'rel', 'canonical');
            this.renderer.setAttribute(canonicalLink, 'href', window.location.href);
            this.renderer.appendChild(this.document.head, canonicalLink);

            this.checkScreenSize();
            window.addEventListener('resize', () => {
                this.checkScreenSize();
            });

            this.renderer.addClass(this.document.body, 'body-dark');
                      
            // Initialize user location for analytics
            this.initializeUserLocation();
            
            // Initialize analytics tracking
            this.initializeAnalyticsTracking();
        }

        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 5,
            },
            {
                breakpoint: '768px',
                numVisible: 3,
            },
            {
                breakpoint: '560px',
                numVisible: 1,
            },
        ];
        this.filterGuestArray = [
            {
                id: 1,
                label: '50',
                condition: 'lte',
                value: 50,
                status: false,
            },
            {
                id: 2,
                label: '100',
                condition: 'lte',
                value: 100,
                status: false,
            },
            {
                id: 3,
                label: '200',
                condition: 'lte',
                value: 200,
                status: false,
            },
            {
                id: 4,
                label: '500',
                condition: 'lte',
                value: 500,
                status: false,
            },
            {
                id: 5,
                label: '1000',
                condition: 'lte',
                value: 1000,
                status: false,
            },
            {
                id: 6,
                label: '1500',
                condition: 'lte',
                value: 1500,
                status: false,
            },
            {
                id: 7,
                label: '2000',
                condition: 'gte',
                value: 2000,
                status: false,
            },
        ];
        this.occasion = [
            { name: 'Wedding', code: 'AN' },
            { name: 'Reception', code: 'MH' },
            { name: 'Ring Ceremony', code: 'CR' },
            { name: 'Anniversary', code: 'CT' },
            { name: 'Birthday Party', code: 'CT' },
            { name: 'Baby Shower', code: 'BD' },
            { name: 'Pool Party', code: 'BV' },
            { name: 'Corporate Events', code: 'Di' },
            { name: 'Corporate Events', code: 'GG' },
            { name: 'Couple Dates', code: 'GR' },
            { name: 'Get Together', code: 'JS' },
        ];
        this.cities = [
            { name: 'Price(low to high)', code: 'price-low-high' },
            { name: 'Price(high to low)', code: 'price-high-low' },
            { name: 'Ratings', code: 'ratings' },
            { name: 'Popularity', code: 'popularity' },
            // { name: 'Distance', code: 'distance' }
        ];
        this.CompareReviews = this.mockCompareReviews;
        if (this.activeRoute.snapshot.params.id) {
            this.id = this.activeRoute.snapshot.params.id;
        }
        if (this.activeRoute.snapshot.params.metaurl) {
            this.metaUrl = this.activeRoute.snapshot.params.metaurl;
        }
        this.staticPath = environment.productUploadUrl;
        this.loggedInUser = this.tokenStorageService.getUser();
        let getToken = this.tokenStorageService.getToken();
        // console.log(this.tokenStorageService.getUser());
        // console.log(this.tokenStorageService.getToken());

        if (getToken != null) {
            this.isLoggedIn = true;
        }

        if (
            this.loggedInUser != undefined &&
            Object.keys(this.loggedInUser).length != 0
        ) {
            this.isLoggedIn = true;
            this.userId = this.loggedInUser.userdata?.id || this.loggedInUser.id;
        }
        if (this.isLoggedIn == true) {
            // this.loginRegisterModal = false;
            this.numberPopup = false;
        }
        if (this.isLoggedIn && this.userId) {
            this.getUserDetails(this.userId);
        }
        this.mobileForm = this.formBuilder.group({
            mobileNumber: [
                null,
                [
                    Validators.required,
                    Validators.pattern('[0-9 ]{10}'),
                    Validators.minLength(10),
                ],
            ],
        });
        this.getUserDetails(this.loggedInUser.id);

        this.defaultDate = new Date();
        let today = new Date();
        //this.defaultDate.setDate(today.getDate() + environment.defaultDays);
        this.selectedDate = this.defaultDate;
        if (this.defaultDate !== undefined && this.defaultDate !== undefined) {
            this.rangeDates = [new Date(this.defaultDate)];
            this.rangeDates.push(new Date(this.defaultDate));
        }

        this.productService.getVenue().then((products) => {
            this.products = products;
        });
        this.featureArray = [
            {
                id: 1,
                label: 'Check Availability',
                selected: true,
                status: true,
            },
            {
                id: 2,
                label: 'Book Visit (Before Booking The Venue)',
                selected: false,
                status: false,
            },
            {
                id: 3,
                label: 'Book Now',
                selected: false,
                status: false,
            },
        ];
        this.selectedFeature = this.featureArray[0];
        this.filterCapacityArray = [
            {
                id: 1,
                label: '0-50',
                condition: 'lte',
                value: 50,
                status: false,
            },
            {
                id: 2,
                label: '0-100',
                condition: 'lte',
                value: 100,
                status: false,
            },
            {
                id: 3,
                label: '0-200',
                condition: 'lte',
                value: 200,
                status: false,
            },
            {
                id: 4,
                label: '0-500',
                condition: 'lte',
                value: 500,
                status: false,
            },
            {
                id: 5,
                label: '>500',
                condition: 'gte',
                value: 500,
                status: false,
            },
        ];
        this.genders = [
            { id: '1', name: 'Male', code: 'Male' },
            { id: '2', name: 'Female', code: 'Female' },
            { id: '3', name: 'Other', code: 'Other' },
        ];
        this.currentYear = new Date();
        this.currentYear = this.currentYear.getFullYear();
        this.yearDiff = environment.yearDiff;
        this.maxYear = moment({
            year: this.currentYear + this.yearDiff,
        }).format('YYYY');
        this.yearRange = this.currentYear + ':' + this.maxYear;
        this.birthYearRange = this.minYear + ':' + maxYearFunction();
        this.birthMaxValue = new Date(
            moment(
                this.birthMaxValue.setFullYear(
                    this.birthMaxValue.getFullYear() + 1
                )
            ).format('YYYY-MM-DD')
        );
        this.birthYearDefaultDate = new Date(
            moment(this.birthMaxValue).subtract(1, 'd').format('YYYY-MM-DD')
        );
        this.maxDateValue = new Date();
        this.minDateValue = new Date();
        this.maxDateValue.setFullYear(this.maxYear);
        this.activeRoute.queryParams.subscribe((params) => {
            this.startDate = params['startDate'];
            this.endDate = params['endDate'];
            this.selectedVenueCapacity = params['capacity'];
            if (params['venue'] !== undefined) {
                if (params['venue'].length > 0) {
                    //console.log('in venue');
                    this.filterVenueIds = JSON.parse(params['venue']);
                    this.selectedVenueIds = JSON.parse(params['venue']);
                } else {
                    this.filterVenueIds = params['venue'];
                    this.selectedVenueIds = [params['venue']];
                }
            } else {
                this.selectedVenueIds = [this.id];
            }
            if (this.selectedVenueIds.length === 0) {
                this.selectedVenueIds = [this.id];
            }
            if (params['city'] != undefined) {
                //console.log('in city');
                if (params['city'].length > 0) {
                    this.filterCityIds = JSON.parse(params['city']);
                    this.selectedCities = JSON.parse(params['city']);
                } else {
                    this.filterCityIds = [params['city']];
                    this.selectedCities = [params['city']];
                }
            }
            if (params['area'] != undefined) {
                //console.log('in area');
                if (params['area'].length > 0) {
                    this.filterSubareaIds = JSON.parse(params['area']);
                    this.selectedSubareaIds = JSON.parse(params['area']);
                } else {
                    this.filterSubareaIds = [params['area']];
                    this.selectedSubareaIds = [params['area']];
                }
            }
            this.filterCategoryId = params['occasion'];
            if (this.selectedVenueCapacity != null) {
                // this.venuecapacity = this.capacity;
                this.capacityCondition = 'lte';
                if (this.selectedVenueCapacity > 500) {
                    this.capacityCondition = 'lte';
                }
            }
            if (this.startDate !== undefined && this.endDate !== undefined) {
                this.selectedStartDate = moment(this.startDate).format(
                    'DD/MM/YYYY'
                );
                this.selectedEndDate = moment(this.endDate).format(
                    'DD/MM/YYYY'
                );
                this.rangeDates = [new Date(this.startDate)];
                this.rangeDates.push(new Date(this.endDate));
            }
        });
        this.updateReviewsPerSlide();

    // Listen for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.updateReviewsPerSlide();
      });
    }
        this.getVenueDetails();
        this.loadNearbyVendors();
    }
    get h() {
        return this.mobileForm.controls;
    }
getCarouselReviews() {
  // This method is probably still using the old logic
  // Change it to:
  if (this.selectedReviewSource === 'google') {
    return this.googleReviews || [];
  } else if (this.selectedReviewSource === 'Compare Reviews') {
    return this.CompareReviews || []; // Make sure this line exists
  } else {
    return this.venueDetails.reviews || [];
  }
}

  // Get total number of slides
  getTotalSlides(): number {
    const reviews = this.getCarouselReviews();
    return Math.ceil(reviews.length / this.reviewsPerSlide);
  }

  // Get reviews for current slide
  getCurrentSlideReviews() {
    const reviews = this.getCarouselReviews();
    const startIndex = this.currentSlide * this.reviewsPerSlide;
    const endIndex = startIndex + this.reviewsPerSlide;
    return reviews.slice(startIndex, endIndex);
  }

  // Navigate to next slide
  nextSlide() {
    const totalSlides = this.getTotalSlides();
    if (this.currentSlide < totalSlides - 1) {
      this.currentSlide++;
    }
  }

  // Navigate to previous slide
  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  

  // Go to specific slide
  goToSlide(slideIndex: number) {
    this.currentSlide = slideIndex;
  }

  // Check if previous button should be disabled
  isPreviousDisabled(): boolean {
    return this.currentSlide === 0;
  }

  // Check if next button should be disabled
  isNextDisabled(): boolean {
    return this.currentSlide >= this.getTotalSlides() - 1;
  }

  // Update reviews per slide based on screen size
  updateReviewsPerSlide() {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) {
        this.reviewsPerSlide = 1; // Mobile: 1 review per slide
      } else if (width < 1200) {
        this.reviewsPerSlide = 2; // Tablet: 2 reviews per slide
      } else {
        this.reviewsPerSlide = 3; // Desktop: 3 reviews per slide
      }

      // Reset to first slide when changing reviews per slide
      this.currentSlide = 0;
    }
  }

  // Override the toggleReviewSource method to reset carousel
//   toggleReviewSource(source: string) {
//     this.selectedReviewSource = source;
//     this.currentSlide = 0; // Reset to first slide when switching sources
//   }

    toggleExpandReview(index: number) {
    this.expandedReviews[index] = !this.expandedReviews[index];
  }

  // Check if review should show "Read more" button
  shouldShowReadMore(reviewText: string): boolean {
    return reviewText && reviewText.length > 150;
  }

  // Get truncated review text
  getTruncatedReviewText(reviewText: string): string {
    if (!reviewText) return '';
    return reviewText.length > 150 ? reviewText.substring(0, 150) + '...' : reviewText;
  }

  // Check if there are user photos available
  hasUserPhotos(): boolean {
    return this.userPhotos && this.userPhotos.length > 0;
  }

  // Get user photos from reviews
  getUserPhotos(): any[] {
    // This would extract photos from Google reviews if available
    const photos: any[] = [];

    if (this.selectedReviewSource === 'google' && this.googleReviews) {
      this.googleReviews.forEach(review => {
        if (review.profile_photo_url) {
          photos.push({
            url: review.profile_photo_url,
            alt: `Photo by ${review.author_name}`,
            reviewer: review.author_name
          });
        }
      });
    }

    return photos.slice(0, 6); // Limit to 6 photos
  }


// Fixed toggleReviewSource method
toggleReviewSource(source: string) {
  this.selectedReviewSource = source;
  this.currentSlide = 0; // Reset to first slide when switching sources
  
  // Reset showAllReviews when switching sources
  this.showAllReviews = false;
  console.log('CompareReviews available:', this.CompareReviews);
}

// Get truncated review text


// Check if there are user photos available




// Open photo modal
openPhotoModal(photo: any) {
  console.log('Opening photo modal for:', photo);
}

// Check if compare reviews should be shown
get shouldShowCompareReviews(): boolean {
  return this.selectedReviewSource === 'Compare Reviews';
}

// Enhanced mock compare reviews with proper structure
get mockCompareReviews(): CompareReview[] {
  return [
    {
      text: "eazy venue have better option",
      rating: 4.5,
      plateRating: "₹1200 per plate",
      capacity: 300,
      reviewtitle: "company 3",
      reviewdescription: "",
      reviewrating: 4.5,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      author_name: "company 3"
    },
    {
      text: "Eazy have better option",
      rating: 4.2,
      plateRating: "₹1500 per plate",
      capacity: 250,
      reviewtitle: "company 2",
      reviewdescription: "Great service and decoration. A bit pricey but worth it for special occasions.",
      reviewrating: 4.2,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      author_name: "company 2"
    },
    {
      text: "company 3",
      rating: 4.8,
      plateRating: "₹1000 per plate",
      capacity: 400,
      reviewtitle: "company 1",
      reviewdescription: "Convenient location and friendly staff. Highly recommended for large events.",
      reviewrating: 4.8,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      author_name: "company1"
    },
  ];
}

// Enhanced getDisplayedReviews with better handling for compare reviews
getDisplayedReviews() {
  let reviews = [];
  
  if (this.selectedReviewSource === 'google') {
    reviews = this.googleReviews || [];
  } else if (this.selectedReviewSource === 'Compare Reviews') {
     reviews = this.CompareReviews || []; 
  } else {
    reviews = this.venueDetails.reviews || [];
  }
   // Add these debug logs:
  console.log('getDisplayedReviews - Current source:', this.selectedReviewSource);
  console.log('getDisplayedReviews - Reviews found:', reviews);
  console.log('getDisplayedReviews - Reviews length:', reviews.length);

  // Handle sorting safely for all review types
  reviews = reviews.sort((a, b) => {
    const ratingA = a.reviewrating || a.rating || 0;
    const ratingB = b.reviewrating || b.rating || 0;
    const dateA = new Date(a.created_at || '').getTime() || 0;
    const dateB = new Date(b.created_at || '').getTime() || 0;

    // Sort by rating first (highest first)
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }

    // Then by date (newest first)
    return dateB - dateA;
  });

  return this.showAllReviews ? reviews : reviews.slice(0, 6);
}

// Get reviews count with better formatting
getReviewsCountText(): string {
  const count = this.getTotalReviewsCount();
  if (count === 0) return 'No reviews';
  if (count === 1) return '1 Review';
  return `${count} Reviews`;
}

// Enhanced getCurrentRating with compare reviews support
getCurrentRating(): number {
   if (this.selectedReviewSource === 'google') {
    return this.venueDetails.googleRating || 0;
  } else if (this.selectedReviewSource === 'Compare Reviews') {
    // Change this line:
    const compareReviews = this.CompareReviews; // Change from this.mockCompareReviews
    if (compareReviews && compareReviews.length > 0) {
      const totalRating = compareReviews.reduce((sum, review) => sum + review.rating, 0);
      return Math.round((totalRating / compareReviews.length) * 10) / 10;
    }
    return 0;
  } else {
    // EazyVenue reviews
    const eazyRating = this.venueDetails.eazyVenueRating || 0;
    const eazyReviewsCount = this.venueDetails.reviews?.length || 0;

    if (eazyReviewsCount === 0 && this.venueDetails.googleRating) {
      return this.venueDetails.googleRating;
    }

    return eazyRating;
  }
}

// Enhanced setInitialReviewSource with compare reviews consideration
setInitialReviewSource() {
  const eazyReviewsCount = this.venueDetails.reviews?.length || 0;
  const googleReviewsCount = this.googleReviews?.length || 0;
 const compareReviewsCount = this.CompareReviews?.length || 0;

  if (eazyReviewsCount <= 2 && googleReviewsCount > 0) {
    this.selectedReviewSource = 'google';
  } else if (eazyReviewsCount > 0) {
    this.selectedReviewSource = 'eazyvenue';
  } else if (googleReviewsCount > 0) {
    this.selectedReviewSource = 'google';
  } else if (compareReviewsCount > 0) {
    this.selectedReviewSource = 'Compare Reviews';
  } else {
    this.selectedReviewSource = 'eazyvenue'; // Default to EazyVenue for writing reviews
  }
}

// Enhanced loadGoogleReviews with better error handling
loadGoogleReviews() {
  if (!this.venueDetails.name || !this.venueDetails.cityname) {
    console.log('Venue name or city not available for Google reviews');
    return;
  }

  this.isLoadingGoogleReviews = true;

  this.venueService.getGoogleReviews(this.venueDetails.name, this.venueDetails.cityname)
    .subscribe({
      next: (response) => {
        console.log('Google reviews response:', response);

        if (response.result && response.result.reviews) {
          this.googleReviews = response.result.reviews.map(review => ({
            ...review,
            reviewtitle: this.generateReviewTitle(review.rating),
            reviewdescription: review.text || 'No review text available',
            reviewrating: review.rating,
            created_at: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
            author_name: review.author_name || 'Anonymous',
            profile_photo_url: review.profile_photo_url
          }));

          // Update Google rating if available
          if (response.result.rating) {
            this.venueDetails.googleRating = response.result.rating;
          }
        } else {
          this.googleReviews = [];
        }

        this.isLoadingGoogleReviews = false;
        this.setInitialReviewSource();
      },
      error: (error) => {
        console.error('Error loading Google reviews:', error);
        this.googleReviews = [];
        this.isLoadingGoogleReviews = false;
        this.setInitialReviewSource();
      }
    });
}

// Enhanced generateReviewTitle with more variety
generateReviewTitle(rating: number): string {
  const titles = {
    5: ['Outstanding Experience', 'Perfect Venue', 'Excellent Choice', 'Highly Recommended'],
    4: ['Great Experience', 'Very Good Venue', 'Good Choice', 'Recommended'],
    3: ['Average Experience', 'Decent Venue', 'Okay Choice', 'Fair Experience'],
    2: ['Below Average', 'Could Be Better', 'Not Impressed', 'Disappointing'],
    1: ['Poor Experience', 'Not Recommended', 'Very Disappointing', 'Avoid']
  };

  const ratingGroup = Math.floor(rating);
  const titleArray = titles[ratingGroup] || titles[3];
  return titleArray[Math.floor(Math.random() * titleArray.length)];
}

// Enhanced submitReview with better success handling
submitReview() {
  if (!this.newReview.reviewtitle || !this.newReview.reviewrating || !this.newReview.reviewdescription) {
    alert('Please fill all required fields');
    return;
  }

  const reviewData = {
    ...this.newReview,
    venueId: this.venueDetails.id,
    created_at: new Date().toISOString(),
    author_name: 'You' // You can get this from user service
  };

  this.venueService.addReview(this.venueDetails.id, reviewData).subscribe({
    next: (response) => {
      console.log('Review submitted successfully:', response);

      // Add the new review to the existing reviews
      if (!this.venueDetails.reviews) {
        this.venueDetails.reviews = [];
      }
      this.venueDetails.reviews.unshift(reviewData);

      // Update the EazyVenue rating
      this.updateEazyVenueRating();

      // Reset form and close it
      this.resetReviewForm();
      this.showReviewForm = false;

      // Switch to EazyVenue reviews to show the new review
      this.selectedReviewSource = 'eazyvenue';
      this.showAllReviews = false;

      // Show success message
      this.showSuccessMessage('Review submitted successfully!');
    },
    error: (error) => {
      console.error('Error submitting review:', error);
      this.showErrorMessage('Error submitting review. Please try again.');
    }
  });
}

// Show success message
showSuccessMessage(message: string) {
  alert(message); // Replace with proper toast notification
}

// Show error message
showErrorMessage(message: string) {
  alert(message); // Replace with proper toast notification
}

// Method to handle review card interactions
onReviewCardClick(review: any, index: number) {
  console.log('Review card clicked:', review);
}

// Method to get review statistics for the selected source
getReviewStatistics() {
  let reviews = [];
  
  if (this.selectedReviewSource === 'google') {
    reviews = this.googleReviews || [];
  } else if (this.selectedReviewSource === 'Compare Reviews') {
        reviews = this.CompareReviews || []; 
  } else {
    reviews = this.venueDetails.reviews || [];
  }

  const stats = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  };

  reviews.forEach(review => {
    const rating = Math.floor(review.reviewrating || review.rating || 0);
    if (stats[rating] !== undefined) {
      stats[rating]++;
    }
  });

  return stats;
}

// Method to get percentage for each rating
getRatingPercentage(rating: number): number {
  const stats = this.getReviewStatistics();
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  return total > 0 ? Math.round((stats[rating] / total) * 100) : 0;
}

// Toggle review form
toggleReviewForm() {
  this.showReviewForm = !this.showReviewForm;
  if (!this.showReviewForm) {
    this.resetReviewForm();
  }
}

// Reset review form
resetReviewForm() {
  this.newReview = {
    reviewtitle: '',
    reviewrating: 0,
    reviewdescription: ''
  };
}

// Update EazyVenue rating based on all reviews
updateEazyVenueRating() {
  if (this.venueDetails.reviews && this.venueDetails.reviews.length > 0) {
    const totalRating = this.venueDetails.reviews.reduce((sum, review) => sum + review.reviewrating, 0);
    this.venueDetails.eazyVenueRating = Math.round((totalRating / this.venueDetails.reviews.length) * 10) / 10;
  }
}

// Get total reviews count for selected source
getTotalReviewsCount(): number {
  if (this.selectedReviewSource === 'google') {
    return this.googleReviews?.length || 0;
  } else if (this.selectedReviewSource === 'Compare Reviews') {
    return this.CompareReviews?.length || 0;
  } else {
    return this.venueDetails.reviews?.length || 0;
  }
}

// Check if should show "Show all reviews" button
shouldShowAllReviewsButton(): boolean {
  const totalReviews = this.getTotalReviewsCount();
  return totalReviews > 3 && !this.showAllReviews;
}

// Helper method to get review text for display (handles both text and reviewdescription)
getReviewText(review: any): string {
  return review.reviewdescription || review.text || '';
}

// Helper method to get review rating for display (handles both rating and reviewrating)
getReviewRating(review: any): number {
  return review.reviewrating || review.rating || 0;
}

// Helper method to check if review is from compare reviews
isCompareReview(review: any): boolean {
  return this.selectedReviewSource === 'Compare Reviews';
}

    loadNearbyVendors(): void {
        if (this.vendorLoading) return;

        this.vendorLoading = true;

        // Build query parameters
        let query = `?pageSize=${this.vendorRows}&pageNumber=${this.vendorPageNumber}`;

        // Add category filter if selected
        if (this.selectedVendorCategory && this.selectedVendorCategory !== "") {
          query += `&category=${this.selectedVendorCategory}`;
        }

        // Add location filter based on current venue's location
        if (this.venueDetails && this.venueDetails.citycode) {
          query += `&citycode=${this.venueDetails.citycode}`;
        }

        if (this.venueDetails && this.venueDetails.subareacode) {
          query += `&subareacode=${this.venueDetails.subareacode}`;
        }

        // Add sorting - popular vendors first
        query += `&sort=popularity`;

        this.vendorService.getVendorListUser(query).subscribe(
          (response) => {
            if (this.vendorPageNumber === 1) {
              this.nearbyVendors = response.data || [];
            } else {
              this.nearbyVendors = [...this.nearbyVendors, ...(response.data || [])];
            }
            this.vendorLoading = false;
          },
          (error) => {
            console.error('Error loading nearby vendors:', error);
            this.vendorLoading = false;
            this.messageService.add({
              key: 'toastMsg',
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load nearby vendors.',
              life: 3000
            });
          }
        );
      }

      // Method to handle vendor category change
      onVendorCategoryChange(category: any): void {
        this.selectedVendorCategory = category.slug;
        this.vendorPageNumber = 1;
        this.nearbyVendors = [];
        this.loadNearbyVendors();
      }

      // Method to handle vendor card click
      getVendorDetails(vendorId: number): void {
        this.router.navigate(['/vendor/detail', vendorId]);
      }

      createSlug(input):string {
        return input.toLowerCase().replace(/ /g, '_');
      }

      // Method to handle contact vendor
      contactVendor(vendor: any, event: Event): void {
        event.stopPropagation();
        this.messageService.add({
          key: 'toastMsg',
          severity: 'info',
          summary: 'Contact',
          detail: `Contacting ${vendor.name}...`,
          life: 3000
        });
      }

      // TrackBy function for vendors
      trackByVendorId(index: number, vendor: any): number {
        return vendor.id;
      }

      // Method to handle scroll for loading more vendors
      onFrequentVendorsScroll(): void {
        const container = document.querySelector('.frequent-vendors-container') as HTMLElement;
        if (container) {
          const scrollLeft = container.scrollLeft;
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;

          // Load more when scrolled to 80% of the width
          if (scrollLeft + clientWidth >= scrollWidth * 0.8) {
            this.loadMoreVendors();
          }
        }
      }

      // Method to load more vendors on scroll
      private loadMoreVendors(): void {
        if (!this.vendorLoading && this.nearbyVendors.length >= this.vendorRows) {
          this.vendorPageNumber++;
          this.loadNearbyVendors();
        }
      }

      // Method to capitalize words (if not already present)
      private capitalizeWords(str: string): string {
        return str.replace(/\b\w/g, match => match.toUpperCase()).replace(/-/g, ' ');
      }

    /**
     * Track venue click for analytics
     */
    trackVenueClick(venue: any): void {
        try {
            // Get current engagement data
            const engagementData = this.getEngagementData();
            
            // Prepare analytics data matching backend schema
            const clickData = {
                venueId: venue._id || venue.id,
                venueName: venue.name || '',
                userId: this.userId || undefined,
                userName: this.getUserName(),
                userEmail: this.getUserEmail(),
                userContact: this.getUserContact(),
                sessionId: this.analyticsService.getSessionId(),
                location: this.getUserLocationData(),
                device: this.analyticsService.getDeviceInfo(),
                engagement: engagementData
            };

            console.log('Tracking venue click with engagement data:', clickData);

            // Track the venue click with enhanced geocoding
            this.analyticsService.trackVenueClickWithGeocode(clickData).subscribe({
                next: (response) => {
                    console.log('Venue click tracked successfully:', response);
                },
                error: (error) => {
                    console.error('Failed to track venue click:', error);
                }
            });
        } catch (error) {
            console.error('Error preparing venue click data:', error);
        }
    }

    /**
     * Get user name from logged in user data
     */
    private getUserName(): string {
        console.log('Getting user name - fullUserDetails:', this.fullUserDetails);
        console.log('Getting user name - loggedInUser:', this.loggedInUser);
        
        // Use fullUserDetails first, then fallback to loggedInUser
        if (this.fullUserDetails) {
            const fullName = `${this.fullUserDetails.firstName || ''} ${this.fullUserDetails.lastName || ''}`.trim();
            if (fullName) {
                console.log('User name from fullUserDetails (full name):', fullName);
                return fullName;
            }
            const name = this.fullUserDetails.name || this.fullUserDetails.username || '';
            console.log('User name from fullUserDetails (name/username):', name);
            return name;
        }
        
        // Check loggedInUser structure - it might have the data directly or in userdata
        if (this.loggedInUser) {
            // First check if user data is directly on loggedInUser
            if (this.loggedInUser.firstname || this.loggedInUser.lastname) {
                const fullName = `${this.loggedInUser.firstname || ''} ${this.loggedInUser.lastname || ''}`.trim();
                if (fullName) {
                    console.log('User name from loggedInUser (direct firstname/lastname):', fullName);
                    return fullName;
                }
            }
            
            // Check userdata property
            if (this.loggedInUser.userdata) {
                const userData = this.loggedInUser.userdata;
                const fullName = `${userData.firstName || userData.firstname || ''} ${userData.lastName || userData.lastname || ''}`.trim();
                if (fullName) {
                    console.log('User name from loggedInUser.userdata (full name):', fullName);
                    return fullName;
                }
                const name = userData.name || userData.username || '';
                console.log('User name from loggedInUser.userdata (name/username):', name);
                return name;
            }
        }
        
        console.log('User name not found, returning empty string');
        return '';
    }

    /**
     * Get user email from logged in user data
     */
    private getUserEmail(): string {
        console.log('Getting user email - fullUserDetails:', this.fullUserDetails);
        console.log('Getting user email - loggedInUser:', this.loggedInUser);
        
        // Use fullUserDetails first, then fallback to loggedInUser
        if (this.fullUserDetails && this.fullUserDetails.email) {
            console.log('User email from fullUserDetails:', this.fullUserDetails.email);
            return this.fullUserDetails.email;
        }
        
        // Check loggedInUser structure
        if (this.loggedInUser) {
            // First check if email is directly on loggedInUser
            if (this.loggedInUser.email) {
                console.log('User email from loggedInUser (direct):', this.loggedInUser.email);
                return this.loggedInUser.email;
            }
            
            // Check userdata property
            if (this.loggedInUser.userdata && this.loggedInUser.userdata.email) {
                const email = this.loggedInUser.userdata.email;
                console.log('User email from loggedInUser.userdata:', email);
                return email;
            }
        }
        
        console.log('User email not found, returning empty string');
        return '';
    }

    /**
     * Get user contact from logged in user data
     */
    private getUserContact(): string {
        console.log('Getting user contact - fullUserDetails:', this.fullUserDetails);
        console.log('Getting user contact - loggedInUser:', this.loggedInUser);
        
        // Use fullUserDetails first, then fallback to loggedInUser
        if (this.fullUserDetails) {
            const contact = this.fullUserDetails.mobile || 
                           this.fullUserDetails.phone || 
                           this.fullUserDetails.contact || 
                           this.fullUserDetails.mobileNumber || 
                           '';
            console.log('User contact from fullUserDetails:', contact);
            if (contact) return contact;
        }
        
        // Check loggedInUser structure
        if (this.loggedInUser) {
            // First check if contact fields are directly on loggedInUser
            const directContact = this.loggedInUser.mobile || 
                                 this.loggedInUser.phone || 
                                 this.loggedInUser.contact || 
                                 this.loggedInUser.mobileNumber ||
                                 this.loggedInUser.mobilenumber ||
                                 '';
            if (directContact) {
                console.log('User contact from loggedInUser (direct):', directContact);
                return directContact;
            }
            
            // Check userdata property
            if (this.loggedInUser.userdata) {
                const contact = this.loggedInUser.userdata.mobile || 
                               this.loggedInUser.userdata.phone || 
                               this.loggedInUser.userdata.contact ||
                               this.loggedInUser.userdata.mobileNumber ||
                               this.loggedInUser.userdata.mobilenumber ||
                               '';
                console.log('User contact from loggedInUser.userdata:', contact);
                return contact;
            }
        }
        
        console.log('User contact not found, returning empty string');
        return '';
    }

    /**
     * Initialize user location for analytics
     */
    private async initializeUserLocation(): Promise<void> {
        try {
            // Check if we have cached location first
            const cachedLocation = this.geolocationService.getCachedUserLocation();
            if (cachedLocation) {
                this.userLocation = cachedLocation;
                console.log('Using cached location for analytics:', this.userLocation);
                return;
            }

            // Try to get fresh location automatically (no prompts)
            await this.requestUserLocationAuto();
        } catch (error) {
            console.log('Could not initialize user location for analytics:', error);
            // Don't show error to user, just log it
        }
    }

    /**
     * Request user location automatically without prompting
     */
    private async requestUserLocationAuto(): Promise<void> {
        try {
            // Check permission status first
            const permissionStatus = await this.geolocationService.checkLocationPermission();
            
            if (permissionStatus === 'granted') {
                // Permission already granted, get location with address
                const location = await this.geolocationService.getUserLocationWithAddress(false, false);
                this.userLocation = location;
                console.log('Auto-retrieved user location for analytics:', this.userLocation);
            } else {
                console.log('Location permission not granted, analytics will use default location');
            }
        } catch (error) {
            console.log('Auto location request failed:', error);
            // Fail silently for analytics
        }
    }

    /**
     * Request user location manually (with user interaction)
     */
    public async requestUserLocationManual(): Promise<void> {
        try {
            console.log('Manual location request initiated...');
            const location = await this.geolocationService.getUserLocationWithAddress(true, true);
            this.userLocation = location;
            console.log('Manual location retrieved for analytics:', this.userLocation);
        } catch (error) {
            console.error('Manual location request failed:', error);
            // Could show user-friendly error message here if needed
        }
    }

    /**
     * Get user location data for analytics with OpenStreetMap supportqualityScore
     */
    private getUserLocationData(): any {
        if (this.userLocation) {
            const locationData = {
                lat: this.userLocation.lat,
                lng: this.userLocation.lng,
                // Use the enhanced address info from OpenStreetMap if available
                city: this.userLocation.city || undefined,
                subarea: this.userLocation.subarea || undefined,
                state: this.userLocation.state || undefined,
                country: this.userLocation.country || 'India',
                pincode: this.userLocation.postalCode || undefined
            };
            console.log('Returning location data:', locationData);
            return locationData;
        }
        
        // If venue details are available, use venue location as fallback
        if (this.venueDetails) {
            const venueLocationData = {
                city: this.venueDetails.cityname || undefined,
                subarea: this.venueDetails.subarea || undefined,
                state: this.venueDetails.statename || undefined,
                country: 'India',
                pincode: this.venueDetails.zipcode || undefined
            };
            console.log('Returning venue location data:', venueLocationData);
            return venueLocationData;
        }
        
        // Return basic India location if no specific location available
        const defaultLocation = {
            country: 'India'
        };
        console.log('Returning default location:', defaultLocation);
        return defaultLocation;
    }

    /**
     * Initialize analytics tracking for time and scroll
     */
    private initializeAnalyticsTracking(): void {
        // Record page load time
        this.pageLoadTime = Date.now();
        
        // Set up scroll tracking
        this.setupScrollTracking();
        
        // Set up periodic quality score updates (every 5 seconds)
        this.trackingInterval = setInterval(() => {
            this.updateQualityScore();
        }, 5000);
        
        // Set up beforeunload handler to send final analytics
        if (isPlatformBrowser(this.platformId)) {
            this.boundBeforeUnloadHandler = (event: BeforeUnloadEvent) => {
                this.sendFinalAnalytics();
            };
            window.addEventListener('beforeunload', this.boundBeforeUnloadHandler);
        }
        
        console.log('Analytics tracking initialized');
    }

    /**
     * Set up scroll depth tracking
     */
    private setupScrollTracking(): void {
        if (isPlatformBrowser(this.platformId)) {
            const trackScroll = () => {
                if (this.scrollThrottleTimer) {
                    clearTimeout(this.scrollThrottleTimer);
                }
                
                this.scrollThrottleTimer = setTimeout(() => {
                    this.calculateScrollDepth();
                }, 100); // Throttle scroll events
            };

            window.addEventListener('scroll', trackScroll, { passive: true });
            
            // Also track on resize
            window.addEventListener('resize', trackScroll, { passive: true });
        }
    }

    /**
     * Calculate current scroll depth percentage
     */
    private calculateScrollDepth(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate scroll percentage
        const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
        
        // Update current scroll depth
        this.currentScrollDepth = Math.min(scrollPercent, 100);
        
        // Update max scroll depth (only increases, never decreases)
        if (this.currentScrollDepth > this.maxScrollDepth) {
            this.maxScrollDepth = this.currentScrollDepth;
            console.log(`Max scroll depth updated: ${this.maxScrollDepth}%`);
        }
    }

    /**
     * Get time spent on page in seconds
     */
    private getTimeSpentSeconds(): number {
        if (this.pageLoadTime === 0) return 0;
        return Math.round((Date.now() - this.pageLoadTime) / 1000);
    }

    /**
     * Calculate quality score based on engagement metrics
     */
    private calculateQualityScore(): number {
        const timeSpentSeconds = this.getTimeSpentSeconds();
        const scrollDepthPercent = this.maxScrollDepth;
        const submittedEnquiry = this.hasCreatedEnquiry;

        // Calculate quality score components
        const timeScore = Math.min(timeSpentSeconds / 60, 1); // Max score at 1 minute
        const scrollScore = scrollDepthPercent / 100;
        const enquiryScore = submittedEnquiry ? 1 : 0;
        
        // Weighted quality score calculation
        const qualityScore = ((timeScore * 0.4) + (scrollScore * 0.3) + (enquiryScore * 0.3));
        
        return Math.round(qualityScore * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Update quality score and log metrics
     */
    private updateQualityScore(): void {
        this.qualityScore = this.calculateQualityScore();
        
        console.log('Analytics Update:', {
            timeSpent: this.getTimeSpentSeconds() + 's',
            maxScrollDepth: this.maxScrollDepth + '%',
            currentScrollDepth: this.currentScrollDepth + '%',
            hasEnquiry: this.hasCreatedEnquiry,
            qualityScore: this.qualityScore
        });
    }

    /**
     * Send analytics update when payment is completed
     */
    private sendPaymentAnalytics(): void {
        try {
            console.log('💰 ANALYTICS: Sending payment completion analytics...');
            
            // Track payment completion
            if (this.venueDetails) {
                // Update engagement data to include payment completion
                const paymentEngagementData = {
                    ...this.getEngagementData(),
                    actions: {
                        ...this.getEngagementData().actions,
                        madePayment: true // Override to true since payment was successful
                    }
                };
                
                // Prepare analytics data
                const clickData = {
                    venueId: this.venueDetails._id || this.venueDetails.id,
                    venueName: this.venueDetails.name || '',
                    userId: this.userId || undefined,
                    userName: this.getUserName(),
                    userEmail: this.getUserEmail(),
                    userContact: this.getUserContact(),
                    sessionId: this.analyticsService.getSessionId(),
                    location: this.getUserLocationData(),
                    device: this.analyticsService.getDeviceInfo(),
                    engagement: paymentEngagementData
                };

                console.log('💰 ANALYTICS: Payment completion data:', clickData);

                // Track the venue click with payment completion
                this.analyticsService.trackVenueClickWithGeocode(clickData).subscribe({
                    next: (response) => {
                        console.log('✅ ANALYTICS: Payment completion tracked successfully:', response);
                    },
                    error: (error) => {
                        console.error('❌ ANALYTICS: Failed to track payment completion:', error);
                    }
                });
            }
        } catch (error) {
            console.error('❌ ANALYTICS: Error sending payment analytics:', error);
        }
    }

    /**
     * Get current engagement data for analytics
     */
    private getEngagementData(): any {
        const engagementData = {
            timeSpentSeconds: this.getTimeSpentSeconds(),
            scrollDepthPercent: this.maxScrollDepth,
            submittedEnquiry: this.hasCreatedEnquiry,
            qualityScore: this.calculateQualityScore(),
            actions: {
                // Date filters
                startFilterDate: this.rangeDates && this.rangeDates[0] ? this.formatDateForAPI(this.rangeDates[0]) : null,
                endFilterDate: this.rangeDates && this.rangeDates[1] ? this.formatDateForAPI(this.rangeDates[1]) : null,
                
                // Event details
                eventDuration: this.getEventDurationFromSlot(),
                occasion: this.sOccasion?.name || (typeof this.selectedOccasion === 'string' ? this.selectedOccasion : null),
                guestCount: this.selectedVenueCapacity || null,
                
                // User interaction tracking
                sendEnquiryClicked: this.sendEnquiryClicked,
                clickedOnReserved: this.clickedOnReserved,
                clickedOnBookNow: this.clickedOnBookNow,
                madePayment: false, // Will be updated when payment is made
                
                // Wedding decor
                weddingDecorType: this.selectedDecor?.name || this.selectedDecor?.type || null,
                weddingDecorPrice: this.selectedDecorPrice || null,
                
                // Food menu details
                foodMenuType: this.getFoodMenuTypeNames(),
                foodMenuPrice: this.totalFoodPrice || null,
                foodMenuPlate: this.getFoodMenuPlate()
            }
        };
        
        console.log('📊 ANALYTICS: Current engagement data with actions:');
        console.log('   📊 Basic metrics:', {
            timeSpentSeconds: engagementData.timeSpentSeconds,
            scrollDepthPercent: engagementData.scrollDepthPercent,
            submittedEnquiry: engagementData.submittedEnquiry,
            qualityScore: engagementData.qualityScore
        });
        console.log('   📊 User actions:', engagementData.actions);
        console.log('   📊 Component state check:');
        console.log('      rangeDates:', this.rangeDates);
        console.log('      sOccasion:', this.sOccasion);
        console.log('      selectedOccasion:', this.selectedOccasion);
        console.log('      selectedVenueCapacity:', this.selectedVenueCapacity);
        console.log('      selectedFoodMenuTypes:', this.selectedFoodMenuTypes);
        console.log('      selectedDecor:', this.selectedDecor);
        console.log('      sendEnquiryClicked:', this.sendEnquiryClicked);
        console.log('      clickedOnReserved:', this.clickedOnReserved);
        console.log('      clickedOnBookNow:', this.clickedOnBookNow);
        
        return engagementData;
    }

    /**
     * Mark that user has submitted an enquiry (call this when enquiry is submitted)
     */
    public markEnquirySubmitted(): void {
        this.hasCreatedEnquiry = true;
        console.log('Enquiry submitted - updating quality score');
        this.updateQualityScore();
    }

    /**
     * Check if we have meaningful user interaction data to send
     */
    private hasUserInteractionData(): boolean {
        const hasDateSelection = this.rangeDates && this.rangeDates.length > 0;
        const hasOccasionSelection = this.sOccasion?.name || this.selectedOccasion;
        const hasGuestCount = this.selectedVenueCapacity;
        const hasFoodSelection = this.selectedFoodMenuTypes && this.selectedFoodMenuTypes.length > 0;
        const hasDecorSelection = this.selectedDecor;
        const hasUserActions = this.sendEnquiryClicked || this.clickedOnReserved || this.clickedOnBookNow;
        const hasMinimumTime = this.getTimeSpentSeconds() > 10; // At least 10 seconds spent
        
        // Return true if user has made meaningful selections or spent significant time
        return hasDateSelection || hasOccasionSelection || hasGuestCount || 
               hasFoodSelection || hasDecorSelection || hasUserActions || hasMinimumTime;
    }

    /**
     * Manually trigger analytics tracking with current data (for testing or manual calls)
     */
    public sendCurrentAnalytics(): void {
        if (!this.venueDetails) {
            console.warn('📊 MANUAL: Cannot send analytics - venue details not loaded');
            return;
        }
        
        if (!this.hasUserInteractionData()) {
            console.log('📊 MANUAL: Skipping analytics - no meaningful user interaction data yet');
            return;
        }
        
        console.log('📊 MANUAL: Sending current analytics data...');
        this.trackVenueClick(this.venueDetails);
    }

    /**
     * Get current analytics summary (for debugging)
     */
    public getAnalyticsSummary(): any {
        return {
            timeSpent: this.getTimeSpentSeconds(),
            maxScrollDepth: this.maxScrollDepth,
            currentScrollDepth: this.currentScrollDepth,
            hasSubmittedEnquiry: this.hasCreatedEnquiry,
            qualityScore: this.calculateQualityScore(),
            pageLoadTime: new Date(this.pageLoadTime).toISOString()
        };
    }

    /**
     * Send final analytics when user is leaving the page
     */
    private sendFinalAnalytics(): void {
        try {
            // Calculate final metrics
            const finalTimeSpent = this.getTimeSpentSeconds();
            const finalQualityScore = this.calculateQualityScore();
            
            console.log('📊 SENDING FINAL ANALYTICS:', {
                totalTimeSpent: finalTimeSpent + 's',
                maxScrollDepth: this.maxScrollDepth + '%',
                finalQualityScore: finalQualityScore,
                enquirySubmitted: this.hasCreatedEnquiry
            });

            // Only send analytics if venue details exist and we have meaningful data
            if (this.venueDetails && finalTimeSpent > 0) {
                // Send the final analytics via trackVenueClick with updated engagement data
                this.trackVenueClick(this.venueDetails);
                console.log('✅ Final analytics sent successfully');
            } else {
                console.log('⚠️ Skipping final analytics - insufficient data or no venue');
            }
        } catch (error) {
            console.error('❌ Error sending final analytics:', error);
        }
    }

    /**
     * Manual method to trigger final analytics (for testing)
     */
    public sendFinalAnalyticsManually(): void {
        console.log('🧪 MANUAL TRIGGER: Sending final analytics');
        this.sendFinalAnalytics();
    }

    /**
     * Test method to send analytics with sample data (for debugging)
     */
    public sendTestAnalytics(): void {
        console.log('🧪 TEST: Sending analytics with sample data...');
        
        // Set some test data
        this.rangeDates = [new Date(), new Date()];
        this.sOccasion = { name: 'Wedding', id: 'wedding-123' };
        this.selectedVenueCapacity = '100-200';
        this.selectedFoodMenuTypes = ['Veg Premium'];
        this.selectedDecor = { name: 'Premium', type: 'Premium' };
        this.selectedDecorPrice = 50000;
        this.totalFoodPrice = 25000;
        this.sendEnquiryClicked = true;
        
        console.log('🧪 TEST: Test data set, now sending analytics...');
        if (this.venueDetails) {
            this.trackVenueClick(this.venueDetails);
        }
    }

    /**
     * Test method to simulate payment completion analytics (for debugging)
     */
    public sendTestPaymentAnalytics(): void {
        console.log('🧪 TEST PAYMENT: Simulating payment completion analytics...');
        
        // Set payment completion data
        this.madePayment = true;
        this.clickedOnBookNow = true;
        this.rangeDates = [new Date(), new Date()];
        this.sOccasion = { name: 'Wedding', id: 'wedding-123' };
        this.selectedVenueCapacity = '100-200';
        this.selectedFoodMenuTypes = ['Veg Premium'];
        this.selectedDecor = { name: 'Premium', type: 'Premium' };
        this.selectedDecorPrice = 50000;
        this.totalFoodPrice = 25000;
        
        console.log('🧪 TEST PAYMENT: Payment data set, madePayment =', this.madePayment);
        
        if (this.venueDetails) {
            this.sendPaymentAnalytics();
        }
    }

    /**
     * Get user details from the API (similar to venue-list)
     */

    // Getter to calculate the average review rating
    get averageReviewRating(): number {
        const reviews = this.selectedReviewSource === 'google' ? this.googleReviews : this.venueDetails?.reviews || [];
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, curr) => acc + curr.reviewrating, 0);
        return parseFloat((sum / reviews.length).toFixed(1));
    }



    initReviewForm() {
        this.reviewForm = this.fb.group({
            reviewdescription: ['', Validators.required],
            reviewrating: [5, Validators.required],
            reviewtitle: ['', Validators.required],
        });
    }

    setRating(rating: number) {
        this.reviewForm.patchValue({ reviewrating: rating });
    }

    // Close modal without jQuery
    closeModal() {
        this.reviewPopup.nativeElement.style.display = 'none';
    }

    // Optional: Display all reviews
    getAllReviews() {
        return this.venueDetails.reviews || [];
    }

    checkScreenSize() {
        this.isMobile = window.innerWidth <= 768;
    }

getSimilarVenues(): void {
  if (!this.venueDetails?.id) return;

  const categoryId = this.venueDetails.categories?.[0]?.id;
  const cityCode = this.venueDetails.citycode;

  let query = `?assured=true&disabled=false&pageSize=10&pageNumber=1&excludeVenueId=${this.venueDetails.id}`;

  if (categoryId) {
    query += `&categoryId=${categoryId}`;
  }
  if (cityCode) {
    query += `&citycode=${cityCode}`;
  }

  this.venueService.getVenueListForFilter(query).subscribe({
    next: (data) => {
      if (data?.data?.items) {
        this.similarVenues = data.data.items.slice(0, 10).map(venue => ({
          id: venue.id,
          name: venue.name,
          subarea: venue.subarea,
          cityname: venue.cityname,
          venueImage: venue.venueImage,
          minPrice: this.calculateMinPrice(venue)
        }));
      }
    },
    error: (err) => {
      console.error('Error fetching similar venues:', err);
      this.similarVenues = [];
    }
  });
}

// Optimized helper methods
trackByVenueId(index: number, venue: any): any {
  return venue?.id || index;
}

getVenueImage(venue: any): string {
  return venue?.venueImage?.[0]?.image || this.staticPath + 'default-venue.jpg';
}



getVenueLocation(venue: any): string {
  if (venue.subarea && venue.cityname) {
    return `${venue.subarea}, ${venue.cityname}`;
  }
  return venue.cityname || venue.subarea || 'Location not available';
}

calculateMinPrice(venue: any): number {
  const priceArray: number[] = [];

  if (venue.foodMenuType) {
    const menuTypes = ['jainFood', 'mixFood', 'non_veg', 'veg_food'];

    menuTypes.forEach(type => {
      if (venue.foodMenuType[type]?.length) {
        venue.foodMenuType[type].forEach((item: any) => {
          if (item.value > 0) {
            priceArray.push(item.value);
          }
        });
      }
    });
  }

  return priceArray.length > 0 ? Math.min(...priceArray) : 0;
}

navigateToVenue(venueId: number): void {
  if (venueId) {
    this.router.navigate(['/venue-details', venueId]);
  }
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
            (res: any) => {
                // console.log(res);

                if (mode !== 'resendOtp') {
                    this.otpPopup = true;
                }
                this.oldUser = {
                    userType: res.firstName === '' ? 'new' : 'old',
                    firstName: res.firstName,
                    lastName: res.lastName,
                };
                //this.mobileForm.reset();
                this.submitted = false;
                this.numberPopup = false;
                // this.ngxotp.clear();
                this.counter = 90;
                this.tick = 1000;
                this.otpTimer(this.counter, this.tick);
            },
            (err) => {
                this.messageService.add({
                    key: 'usertoastmsg',
                    severity: 'error',
                    summary: err.error.error,
                    detail: err.error.error,
                    life: 6000,
                });
            }
        );
    }
    public counter;
    public tick;
    otpArray: string[] = [];
    public showResendButton: boolean = false;
    pastedEvent(event) {
        const val = event.target.value;
        this.showOtpErrors = false;
        if (val.length === 4) {
            this.otpArray = val.toString().split('');
            const txt1 = document.getElementById('txt1') as HTMLInputElement;
            const txt2 = document.getElementById('txt2') as HTMLInputElement;
            const txt3 = document.getElementById('txt3') as HTMLInputElement;
            const txt4 = document.getElementById('txt4') as HTMLInputElement;

            txt1.value = val.charAt(0) || '';
            txt2.value = val.charAt(1) || '';
            txt3.value = val.charAt(2) || '';
            txt4.value = val.charAt(3) || '';

            txt4.focus();
        }
    }
    move(e: any, p: any, c: any, n: any, i: any) {
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
    validateFirstName() {
        if (this.userFirstName.length <= 3) {
            this.firstNameError = true;
        } else {
            this.firstNameError = false;
        }
    }
    validateLastName() {
        if (this.userLastName.length <= 3) {
            this.lastNameError = true;
        } else {
            this.lastNameError = false;
        }
    }
    otpSubmit() {
        this.otp = this.otpArray.join('');
        if (this.oldUser.userType === 'new') {
            if (this.userFirstName.length <= 3) {
                this.firstNameError = true;
                return;
            }
            if (this.userLastName.length <= 3) {
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
            (data) => {
                this.otpPopup = false;
                this.userData = data;
                this.tokenStorageService.saveToken(
                    this.userData.data.access_token
                );
                this.tokenStorageService.saveUser(this.userData.data.userdata);
                //this.tokenStorageService.getAuthStatus(this.userData.data);
                this.isLoginFailed = false;
                this.isLoggedIn = true;
                //this.roles = this.tokenStorageService.getUser().roles;
                // this.getRoleDetails();
                // this.getRoleList();
                this.mobileForm.reset();
                let selectedCities = JSON.stringify(this.selectedCities);
                let selectedSubareaIds = JSON.stringify(
                    this.selectedSubareaIds
                );
                let selectedVenueIds = JSON.stringify(this.selectedVenueIds);
                window.location.reload();

            },
            (err) => {
                this.otpError = err.error.error;
                // this.messageService.add({ key: 'usertoastmsg', severity: 'error', summary: err.error.error, detail: err.error.error, life: 6000 });
            }
        );

    }
    resendOtp() {
        this.otp = '';
        this.showOtpErrors = false;
        this.otpError = undefined;
        this.showResendButton = false;
        this.onSubmitNumber('resendOtp');
        const txt1 = document.getElementById('txt1') as HTMLInputElement;
        const txt2 = document.getElementById('txt2') as HTMLInputElement;
        const txt3 = document.getElementById('txt3') as HTMLInputElement;
        const txt4 = document.getElementById('txt4') as HTMLInputElement;

        txt1.value = '';
        txt2.value = '';
        txt3.value = '';
        txt4.value = '';

        this.otp = '';
        this.otpArray = [];
    }
    public countDown: Subscription;
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
        const txt1 = document.getElementById('txt1') as HTMLInputElement;
        const txt2 = document.getElementById('txt2') as HTMLInputElement;
        const txt3 = document.getElementById('txt3') as HTMLInputElement;
        const txt4 = document.getElementById('txt4') as HTMLInputElement;
        txt1.value = '';
        txt2.value = '';
        txt3.value = '';
        txt4.value = '';
        this.otpArray = [];
    }

    get forgotPassValidation() {
        return this.forgotPassForm.controls;
    }
    public toggleField() {
        this.classToggled = !this.classToggled;
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
    // convenience getter for easy access to form fields
    get f() {
        return this.signUpForm.controls;
    }
    get loginf() {
        return this.loginForm.controls;
    }
    schedulevisit() {
        this.displayModal = true;
    }
    getSlots() {
        let query = '?filterByDisable=false&filterByStatus=true';
        this.slotService.getSlotListWithoutAuth(query).subscribe(
            (data) => {
                if (data.data.items.length > 0) {
                    this.slotList = data.data.items;
                }
            },
            (error) => {}
        );
    }

    async initializeMap(): Promise<void> {
        try {
            const address = `${this.venueDetails.subarea}, ${this.venueDetails.cityname}, ${this.venueDetails.statename}, India`;

            // Generate map URL for sharing
            this.venueMapUrl = this.venueService.generateMapsUrl(this.venueDetails.name, address);

            // Get coordinates
            const location = await this.venueService.getGeocodedLocation(address);
            this.venueCoordinates = { lat: location.lat, lng: location.lng };

            // Initialize map
            setTimeout(() => {
                this.createMap();
            }, 100);

        } catch (error) {
            console.error('Error initializing map:', error);
            this.mapError = true;
            // Fallback to basic map URL
            this.venueMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.venueDetails.cityname)}`;
        }
    }

    createMap(): void {
        const mapElement = document.getElementById('venue-map');
        if (!mapElement || !this.venueCoordinates) {
            return;
        }

        const mapOptions = {
            center: this.venueCoordinates,
            zoom: 15,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            fullscreenControl: true
        };

        this.map = new google.maps.Map(mapElement, mapOptions);

        // Add marker for venue
        this.marker = new google.maps.Marker({
            position: this.venueCoordinates,
            map: this.map,
            title: this.venueDetails.name,
            animation: google.maps.Animation.DROP
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 300px;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">${this.venueDetails.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #666;">
                        <strong>Location:</strong> Near ${this.venueDetails.subarea}<br>
                        ${this.venueDetails.cityname}, ${this.venueDetails.statename}
                    </p>
                    <p style="margin: 0 0 5px 0; color: #666;">
                        <strong>Capacity:</strong> ${this.venueDetails.capacity} people
                    </p>
                    <p style="margin: 0; color: #666;">
                        <strong>Rating:</strong> ⭐ ${this.venueDetails.googleRating}/5
                    </p>
                </div>
            `
        });

        // Open info window on marker click
        this.marker.addListener('click', () => {
            infoWindow.open(this.map, this.marker);
        });

        this.mapLoaded = true;
    }

    /**
     * Open venue location in Google Maps app/website
     */
    openInGoogleMaps(): void {
        if (this.venueMapUrl) {
            window.open(this.venueMapUrl, '_blank');
        }
    }

    /**
     * Share venue details on WhatsApp
     */
    shareVenueOnWhatsApp(): void {
        if (this.venueDetails) {
            this.venueService.shareOnWhatsApp(this.venueDetails, this.venueMapUrl);
        }
    }

    /**
     * Copy map link to clipboard
     */
    copyMapLink(): void {
        if (this.venueMapUrl) {
            navigator.clipboard.writeText(this.venueMapUrl).then(() => {
                // You can show a toast notification here
                alert('Map link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    }

    /**
     * Get directions to venue
     */
    getDirections(): void {
        if (this.venueCoordinates) {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${this.venueCoordinates.lat},${this.venueCoordinates.lng}`;
            window.open(directionsUrl, '_blank');
        }
    }

    // Add these methods to your component

getEazyRatingPercentage(rating: number): number {
    if (!this.venueDetails.reviews || this.venueDetails.reviews.length === 0) {
        return 0;
    }

    const ratingCount = this.venueDetails.reviews.filter(review =>
        Math.floor(review.reviewrating) === rating
    ).length;

    return Math.round((ratingCount / this.venueDetails.reviews.length) * 100);
}

loadMoreGoogleReviews(): void {
    // Implement pagination for Google reviews if needed
    console.log('Load more Google reviews');
}

    /**
     * Load all booked dates for the venue to highlight in calendar
     */
    loadVenueBookedDates() {
        if (!this.venueDetails || !this.venueDetails.id) {
            console.log('[DEBUG] No venue details available for loading booked dates');
            return;
        }

        // Only check bookings if user is logged in
        if (!this.isLoggedIn) {
            console.log('[DEBUG] User not logged in, skipping booking check');
            return;
        }

        console.log('[DEBUG] Loading all booked dates for venue:', this.venueDetails.id);
        
        // Get all bookings for this venue (no date filter for initial load)
        this.bookingService.getVenueBookings(this.venueDetails.id, {}).subscribe(
            (res: any) => {
                console.log('[DEBUG] All venue bookings response:', res);
                const bookingsArr = res && res.success && res.data && Array.isArray(res.data.bookings) ? res.data.bookings : [];
                
                if (bookingsArr.length > 0) {
                    this.bookedDatesList = bookingsArr;
                    this.disabledDates = [];
                    
                    // Convert all booked date ranges to individual disabled dates
                    bookingsArr.forEach(booking => {
                        if (booking.details && booking.details.startFilterDate && booking.details.endFilterDate) {
                            const startDate = this.parseDate(booking.details.startFilterDate);
                            const endDate = this.parseDate(booking.details.endFilterDate);
                            
                            if (startDate && endDate) {
                                // Add all dates between start and end to disabled dates
                                const dates = this.getDateRange(startDate, endDate);
                                this.disabledDates.push(...dates);
                            }
                        }
                    });
                    
                    console.log('[DEBUG] Disabled dates array:', this.disabledDates);
                    console.log('[DEBUG] Total disabled dates count:', this.disabledDates.length);
                } else {
                    console.log('[DEBUG] No bookings found for venue');
                    this.disabledDates = [];
                    this.bookedDatesList = [];
                }
            },
            (err) => {
                console.error('[DEBUG] Error loading venue booked dates:', err);
                this.disabledDates = [];
                this.bookedDatesList = [];
            }
        );
    }

    /**
     * Parse date string in DD/MM/YYYY format to Date object
     */
    private parseDate(dateString: string): Date | null {
        if (!dateString) return null;
        
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        
        return new Date(year, month, day);
    }

    /**
     * Get all dates between start and end date (inclusive)
     */
    private getDateRange(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }

    /**
     * Get formatted list of booked dates for display in warning
     */
    private getBookedDatesInRange(startDate: Date, endDate: Date): string[] {
        const bookedDatesInRange: string[] = [];
        
        this.bookedDatesList.forEach(booking => {
            if (booking.details && booking.details.startFilterDate && booking.details.endFilterDate) {
                const bookingStart = this.parseDate(booking.details.startFilterDate);
                const bookingEnd = this.parseDate(booking.details.endFilterDate);
                
                if (bookingStart && bookingEnd) {
                    // Check if booking overlaps with selected range
                    if (bookingStart <= endDate && bookingEnd >= startDate) {
                        const rangeStart = bookingStart > startDate ? bookingStart : startDate;
                        const rangeEnd = bookingEnd < endDate ? bookingEnd : endDate;
                        
                        // Format the overlapping dates
                        const overlapDates = this.getDateRange(rangeStart, rangeEnd);
                        overlapDates.forEach(date => {
                            const formattedDate = moment(date).format('DD/MM/YYYY');
                            if (!bookedDatesInRange.includes(formattedDate)) {
                                bookedDatesInRange.push(formattedDate);
                            }
                        });
                    }
                }
            }
        });
        
        return bookedDatesInRange.sort();
    }

    getVenueDetails() {
        this.venueService.getVenueDetailsByMeta(this.metaUrl).subscribe(
            // this.venueService.getVenueDetails(this.id).subscribe(
            async (data) => {
                console.log(data);

                this.venueDetails = data;
                
                setTimeout(() => this.loadGoogleReviews(), 100);
                this.title.setTitle(
                    this.venueDetails.name + ' - ' + 'Eazyvenue.com'
                );
                this.meta.addTag({
                    name: 'title',
                    content: this.venueDetails.name + ' - ' + 'Eazyvenue.com',
                });
                this.meta.addTag({
                    name: 'description',
                    content: this.venueDetails.metaDescription,
                });
                this.meta.addTag({
                    name: 'keywords',
                    content: this.venueDetails.metaKeywords,
                });
                this.meta.addTag({ name: 'robots', content: 'index, follow' });

                const localBusinessSchema = {
                    '@context': 'http://schema.org/',
                    '@type': 'LocalBusiness',
                    '@id': location.href,
                    name: this.venueDetails.name + ' - ' + 'Eazyvenue.com',
                    description: this.venueDetails.metaDescription,
                    image: [this.venueDetails.venueImage[0]?.venue_image_src],
                    address: {
                        '@type': 'PostalAddress',
                        // "streetAddress": "Near thane,Mumbai, Maharashtra",
                        streetAddress:
                            'Near ' +
                            this.venueDetails.subarea +
                            ', ' +
                            this.venueDetails.cityname +
                            ',' +
                            this.venueDetails.statename +
                            '',
                        // "addressLocality": "Near thane, Mumbai, Maharashtra",
                        addressLocality:
                            'Near ' +
                            this.venueDetails.subarea +
                            ', ' +
                            this.venueDetails.cityname +
                            ',' +
                            this.venueDetails.statename +
                            '',
                        // "addressRegion": "Mumbai",
                        addressRegion: this.venueDetails.cityname,
                        // "postalCode": "400601",
                        postalCode: this.venueDetails.zipcode,
                        addressCountry: 'India',
                    },
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: this.venueDetails.googleRating,
                        reviewCount: '1206',
                        bestRating: '5',
                        worstRating: '1.2',
                    },
                    priceRange:
                        'Menu starts from Rs.' +
                        this.venueDetails.foodMenuType.veg_food[0].value +
                        ' to Rs.' +
                        this.venueDetails.foodMenuType.veg_food[
                            this.venueDetails.foodMenuType.veg_food.length - 1
                        ].value,
                    telephone: '+91 93720 91300',
                };
                const localBusinessScript = document.createElement('script');
                localBusinessScript.type = 'application/ld+json';
                localBusinessScript.text = JSON.stringify(localBusinessSchema);
                document.body.appendChild(localBusinessScript);

                const itemListSchema = {
                    itemListElement: [
                        {
                            item: 'https://eazyvenue.com/',
                            '@type': 'ListItem',
                            name: 'Home',
                            position: '1',
                        },
                        {
                            item: 'https://eazyvenue.com/banquet-halls/',
                            '@type': 'ListItem',
                            name: 'Venues',
                            position: '2',
                        },
                        {
                            item: location.href,
                            '@type': 'ListItem',
                            name: this.venueDetails.name,
                            position: '3',
                        },
                    ],
                    '@type': 'BreadcrumbList',
                    '@context': 'http://schema.org',
                };

                const itemListScript = document.createElement('script');
                itemListScript.type = 'application/ld+json';
                itemListScript.text = JSON.stringify(itemListSchema);
                document.body.appendChild(itemListScript);

                this.selectedVenueList = [data];
                this.cityName = this.venueDetails.cityname.toLowerCase();
                var googleMapSource =
                    'https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=' +
                    this.cityName +
                    '&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed';
                // window.location.replace(this.googleMapSource);
                //this.googleMapSource.toString();
                this.tmpVenueList.forEach((element) => {
                    if (element.venueVideo !== '') {
                        element.venueImage.push({ video: element.venueVideo });
                    }
                });
                this.finalVenueList = [...this.venueList, ...this.tmpVenueList];
                this.googleMapSource =
                    this.sanitizer.bypassSecurityTrustResourceUrl(
                        googleMapSource
                    );
                this.googleMapSource =
                    this.googleMapSource.changingThisBreaksApplicationSecurity;
                // this.url = this.googleMapSource.changingThisBreaksApplicationSecurity;
                let swimmingObj = {
                    title: 'Swimming Pool',
                    details: this.venueDetails.swimmingdetails,
                    icon: 'assets/images/category-icons/pool_party.svg',
                };
                let parkingObj = {
                    title: 'Parking',
                    details: this.venueDetails.parkingdetails,
                    icon: 'assets/images/category-icons/parking-icon.svg',
                };
                let acObj = {
                    title: 'A/C',
                    details: this.venueDetails.acdetails,
                    icon: 'assets/images/category-icons/ac-icon.svg',
                };
                let roomsObj = {
                    title: 'Rooms',
                    details: this.venueDetails.capacityDescription,
                    icon: 'assets/images/category-icons/rooms-icons.svg',
                };
                let powerBackupObj = {
                    title: 'Power Backup',
                    details: this.venueDetails.powerbackupdetails,
                    icon: 'assets/images/category-icons/power_backup.svg',
                };
                let djObj = {
                    title: 'DJ',
                    details: this.venueDetails.djdetails,
                    icon: 'assets/images/category-icons/dj-music.svg',
                };
                let entertainmentLicenseObj = {
                    title: 'Entertainment License',
                    details: this.venueDetails.entertainmentlicensedetails,
                    icon: 'assets/images/category-icons/entertainment.svg',
                };
                this.venueImageNumVisible = Number(
                    this.venueDetails.venueImage.length
                );
                if (this.venueImageNumVisible < 8) {
                    let hideThumbnailClass =
                        this.el.nativeElement.querySelector(
                            '.section-venuelisting-details'
                        );
                    //showp2Table.classList.remove('hide-columns');
                }
                if (this.venueImageNumVisible > 8) {
                    this.venueImageNumVisible = Number(2);
                }
                if (this.venueDetails.isSwimmingPool == true) {
                    this.facilitiesArray.push(swimmingObj);
                }
                if (this.venueDetails.isParking == true) {
                    this.facilitiesArray.push(parkingObj);
                }
                if (this.venueDetails.isAC == true) {
                    this.facilitiesArray.push(acObj);
                }
                if (this.venueDetails.isGreenRooms == true) {
                    this.facilitiesArray.push(roomsObj);
                }
                if (this.venueDetails.isPowerBackup == true) {
                    this.facilitiesArray.push(powerBackupObj);
                }
                if (this.venueDetails.isDJ == true) {
                    this.facilitiesArray.push(djObj);
                }
                if (this.venueDetails.isEntertainmentLicense == true) {
                    this.facilitiesArray.push(entertainmentLicenseObj);
                }
                if (
                    this.venueDetails.decor1Price != undefined ||
                    this.venueDetails.decor1Price != ''
                ) {
                    let decor1img = '';
                    if (this.venueDetails.decor1Image.length > 0) {
                        // if (this.venueDetails.decor1Image[0].venue_image_src) {
                        decor1img =
                            this.venueDetails.decor1Image[0].venue_image_src;
                        this.decorArray.push({
                            name: 'Basic',
                            price: this.venueDetails.decor1Price,
                            image: '/assets/images/icons/Basic.jpg',
                            selected: false,
                            decorImages: this.venueDetails.decor1Image,
                        });
                        // }
                    }
                }
                if (
                    this.venueDetails.decor2Price != undefined ||
                    this.venueDetails.decor2Price != ''
                ) {
                    let decor2img = '';
                    // console.log(this.venueDetails.decor2Image[0].venue_image_src)
                    if (this.venueDetails.decor2Image.length > 0) {
                        // if (this.venueDetails.decor2Image[0].venue_image_src) {
                        decor2img =
                            this.venueDetails.decor2Image[0].venue_image_src;
                        this.decorArray.push({
                            name: 'Standard',
                            price: this.venueDetails.decor2Price,
                            image: '/assets/images/icons/Standard.jpg',
                            selected: false,
                            decorImages: this.venueDetails.decor2Image,
                        });
                        // }
                    }
                }
                if (
                    this.venueDetails.decor3Price != undefined ||
                    this.venueDetails.decor3Price != ''
                ) {
                    let decor3img = '';
                    if (this.venueDetails.decor3Image.length > 0) {
                        // if (this.venueDetails.decor3Image[0].venue_image_src) {
                        decor3img =
                            this.venueDetails.decor3Image[0].venue_image_src;
                        this.decorArray.push({
                            name: 'Premium',
                            price: this.venueDetails.decor3Price,
                            image: '/assets/images/icons/Premium.jpg',
                            selected: false,
                            decorImages: this.venueDetails.decor3Image,
                        });
                        // }
                    }
                }
                this.allFoodMenuPriceArray = [];
                if (this.venueDetails.foodMenuType) {
                    //this.venueDetails.foodMenuType.forEach(fElement => {
                    if (this.venueDetails.foodMenuType.jainFood !== undefined) {
                        if (
                            this.venueDetails.foodMenuType.jainFood.length > 0
                        ) {
                            this.venueDetails.foodMenuType.jainFood.forEach(
                                (jfElement) => {
                                    if (jfElement.value > 0) {
                                        this.allFoodMenuPriceArray.push(
                                            jfElement.value
                                        );
                                    }
                                }
                            );
                        }
                    }
                    if (this.venueDetails.foodMenuType.mixFood !== undefined) {
                        if (this.venueDetails.foodMenuType.mixFood.length > 0) {
                            this.venueDetails.foodMenuType.mixFood.forEach(
                                (mfElement) => {
                                    if (mfElement.value > 0) {
                                        this.allFoodMenuPriceArray.push(
                                            mfElement.value
                                        );
                                    }
                                }
                            );
                        }
                    }
                    if (this.venueDetails.foodMenuType.non_veg !== undefined) {
                        if (this.venueDetails.foodMenuType.non_veg.length > 0) {
                            this.venueDetails.foodMenuType.non_veg.forEach(
                                (nvElement) => {
                                    if (nvElement.value > 0) {
                                        this.allFoodMenuPriceArray.push(
                                            nvElement.value
                                        );
                                    }
                                }
                            );
                        }
                    }
                    if (this.venueDetails.foodMenuType.veg_food !== undefined) {
                        if (
                            this.venueDetails.foodMenuType.veg_food.length > 0
                        ) {
                            this.venueDetails.foodMenuType.veg_food.forEach(
                                (vElement) => {
                                    if (vElement.value > 0) {
                                        this.allFoodMenuPriceArray.push(
                                            vElement.value
                                        );
                                    }
                                }
                            );
                        }
                    }
                    let minPrice = 0;
                    if (this.allFoodMenuPriceArray.length > 0) {
                        minPrice = Math.min(...this.allFoodMenuPriceArray);
                    }
                    // if (this.capacity > 0) {
                    this.venueDetails['minVenuePrice'] = minPrice;
                    // }

                    // });
                }
                this.venueCapacity = this.venueDetails.capacity;
                this.venuePrice = this.venueDetails.venuePrice;
                this.bookingPrice = this.venueDetails.bookingPrice;
                this.foodMenuTypeArray = this.venueDetails.foodMenuType;
                this.totalPeopleBooked = this.venueDetails.peopleBooked;
                this.currentViews = this.venueDetails.views;
                
                // Load booked dates for calendar highlighting
                this.loadVenueBookedDates();
                
                this.onClickEventDate(this.selectedStartDate);
                this.getCategoryDetails();
                this.getSlots();
                this.getCategoryBySlug();
                await this.getSubareas();
                await this.getCities();
                await this.initializeMap();
                if (!this.isLoggedIn) {
                    setTimeout(() => {
                        this.numberPopup = true;
                        this.otpPopup = false;
                        this.otpthankyouPopup = false;
                    }, 4000);
                }
                setTimeout(() => this.getSimilarVenues(), 100);
                this.checkAndStartEnquiryTimer();
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getUserDetails(id: string) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.fullUserDetails = data;
                console.log('👤 VENUE: Full user details loaded:', this.fullUserDetails);

                // Check and start enquiry timer after user details are loaded
                this.checkAndStartEnquiryTimer();
            },
            err => {
                console.error('❌ VENUE: Failed to load user details:', err);
            }
        );
    }

    // 6. Update your createAutoEnquiry method to use fullUserDetails
    // Fixed createAutoEnquiry method with proper error handling
    createAutoEnquiry() {
        console.log('🎯 VENUE: Creating auto enquiry...');
        console.log('🎯 VENUE: isLoggedIn:', this.isLoggedIn);
        console.log('🎯 VENUE: loggedInUser:', this.loggedInUser);
        console.log('🎯 VENUE: fullUserDetails:', this.fullUserDetails);
        console.log('🎯 VENUE: Mobile number:', this.fullUserDetails?.mobileNumber);

        if (this.hasCreatedEnquiry) {
            console.log('🎯 VENUE: Enquiry already created, skipping...');
            return;
        }

        // Check if user is logged in
        if (!this.isLoggedIn || !this.loggedInUser) {
            console.log('⚠️ VENUE: User not logged in');
            return;
        }

        // Check if full user details are loaded
        if (!this.fullUserDetails) {
            console.log('⚠️ VENUE: User details not loaded yet');
            // Try to fetch user details again
            if (this.loggedInUser?.id) {
                console.log('🔄 VENUE: Attempting to fetch user details...');
                this.getUserDetails(this.loggedInUser.id);
            }
            return;
        }

        if (!this.fullUserDetails.mobileNumber) {
            console.log('⚠️ VENUE: No mobile number found in user details:', this.fullUserDetails);
            return;
        }

        if (!this.venueDetails) {
            console.log('⚠️ VENUE: venueDetails is null/undefined');
            return;
        }

        if (!this.venueDetails._id && !this.venueDetails.id) {
            console.log('⚠️ VENUE: Venue ID not found. Available properties:', Object.keys(this.venueDetails));
            return;
        }

        const venueId = this.venueDetails._id || this.venueDetails.id;
        const venueName = this.venueDetails.name || this.venueDetails.venueName || 'Unknown Venue';

        const enquiryData = {
            venueName: venueName,
            venueId: venueId,
            userName: (this.fullUserDetails.firstName || '') + ' ' + (this.fullUserDetails.lastName || ''),
            userContact: this.fullUserDetails.mobileNumber,
            userEmail: this.fullUserDetails.email || '',
            // Analytics tracking fields
            sendEnquiryClicked: this.sendEnquiryClicked,
            clickedOnReserved: this.clickedOnReserved,
            clickedOnBookNow: this.clickedOnBookNow,
            madePayment: false  // Enquiries don't involve payment
        };

        console.log('📝 VENUE: Enquiry data prepared:', enquiryData);
        console.log('� VENUE: Analytics tracking in enquiry:');
        console.log('   sendEnquiryClicked:', enquiryData.sendEnquiryClicked);
        console.log('   clickedOnReserved:', enquiryData.clickedOnReserved);
        console.log('   clickedOnBookNow:', enquiryData.clickedOnBookNow);
        console.log('   madePayment:', enquiryData.madePayment);
        console.log('�📝 VENUE: About to call API...');

        // Check if service exists
        if (!this.enquiryService) {
            console.error('❌ VENUE: EnquiryService is not injected!');
            return;
        }

        // Check if method exists
        if (typeof this.enquiryService.createEnquiry !== 'function') {
            console.error('❌ VENUE: createEnquiry method does not exist on service!');
            return;
        }

        console.log('✅ VENUE: Service and method exist, making API call...');

        try {
            const result = this.enquiryService.createEnquiry(enquiryData);
            console.log('📞 VENUE: Service method returned:', result);

            if (!result) {
                console.error('❌ VENUE: Service method returned null/undefined');
                return;
            }

            if (typeof result.subscribe !== 'function') {
                console.error('❌ VENUE: Service method did not return an Observable');
                console.error('❌ VENUE: Returned type:', typeof result);
                console.error('❌ VENUE: Returned value:', result);
                return;
            }

            console.log('🔄 VENUE: Starting subscription...');

            result.subscribe(
                (response) => {
                    console.log('✅ VENUE: SUCCESS - Response received:', response);
                    if (response && response.success) {
                        console.log('✅ VENUE: Enquiry created successfully with ID:', response.id);
                        this.hasCreatedEnquiry = true;
                        // Update analytics tracking for enquiry submission
                        this.markEnquirySubmitted();
                    }
                },
                (error) => {
                    console.error('❌ VENUE: ERROR - API call failed:', error);
                    console.error('❌ VENUE: Error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        error: error.error
                    });
                },
                () => {
                    console.log('🎯 VENUE: COMPLETE - API call finished');
                }
            );

            console.log('✅ VENUE: Subscription started successfully');

        } catch (error) {
            console.error('💥 VENUE: Exception occurred during API call:', error);
        }
    }

    // 7. Add a method to check if both venue and user data are ready
    checkAndStartEnquiryTimer() {
        // Only start timer if user is logged in and both user details and venue details are loaded
        if (this.isLoggedIn && this.fullUserDetails && this.venueDetails) {
            console.log('✅ VENUE: Both user and venue data loaded, starting enquiry timer');
            this.startEnquiryTimer();
        } else {
            console.log('⏳ VENUE: Waiting for data to load. User logged in:', this.isLoggedIn, 'User details:', !!this.fullUserDetails, 'Venue details:', !!this.venueDetails);
        }
    }

    // 8. Update startEnquiryTimer to be more simple
    startEnquiryTimer() {
        console.log('⏰ VENUE: Starting 10-second enquiry timer...');

        this.enquiryTimer = setTimeout(() => {
            console.log('⏰ VENUE: 10 seconds completed! Creating auto enquiry...');
            this.createAutoEnquiry();
        }, 10000); // 10 seconds
    }


    isNumber(val: any): boolean {
        return typeof val === 'number';
    }
    methodToGetURL() {
        var googleMapSource =
            'https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=' +
            this.cityName +
            '&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed';
        return this.sanitizer.bypassSecurityTrustResourceUrl(googleMapSource);
    }
    getCategoryDetails() {
        let query =
            '?filterByDisable=false&filterByStatus=true&sortBy=created_at&orderBy=1';
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            (data) => {
                //if (data.data.items.length > 0) {
                this.categoryList = data.data.items;
                let count = 0;
                let obj = this.categoryList.find((o) => o.slug === 'vendor');
                let categoryList = this.venueDetails.category;
                let foodTypesList = this.venueDetails.foodType;
                let foodMenuTypesList = this.venueDetails.foodType;
                this.categoryList.forEach((element) => {
                    element['selected'] = false;
                    categoryList.forEach((category) => {
                        element['selected'] = false;
                        if (element.id == category.id) {
                            this.occasionArray.push(element);
                        }
                    });
                    foodTypesList.forEach((foodType) => {
                        element['selected'] = false;
                        if (element.id == foodType.id) {
                            this.foodTypesList.push(element);
                        }
                    });
                    if (obj.id == element.parentcategorycode) {
                        this.vendorList.push(element);
                    }
                });
                // this.selectedFoodType = this.foodTypesList[0];
                // this.onFoodTypeClick(this.selectedFoodType);
                if (this.occasionArray.length > 0) {
                    this.occasionArray.forEach((element) => {
                        let categoryImage =
                            'assets/images/category-icons/' +
                            element.slug +
                            '.svg';
                        if (element['categoryImage']) {
                            element['image_src'] = categoryImage;
                        }
                    });
                    let index = this.findIndexById(
                        this.filterCategoryId,
                        this.occasionArray
                    );
                    if (index != -1) {
                        this.occasionArray[index].selected = true;
                        //this.selectedOccasion.push(occasion.id);
                        this.selectedOccasion = this.occasionArray[index].id;
                        //this.selectedOccasionNames.push({ 'id': occasion.id, 'name': occasion.name });
                        //this.selectedOccasionNames = [{ 'id': this.occasionArray[index].id, 'name': this.occasionArray[index].name }];
                    }
                }
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    // getFoodMenuTypes(selectedFoodTypeId) {
    //   let query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + selectedFoodTypeId + "&sortBy=created_at&orderBy=1";
    //   this.categoryService.getCategoryWithoutAuthList(query).subscribe(
    //     data => {
    //       //if (data.data.items.length > 0) {
    //       this.foodMenuTypesList = data.data.items;
    //       let count = 0;
    //       this.foodMenuTypesList.forEach(element => {
    //         element['selected'] = false;
    //         count++;
    //       });
    //     },
    //     err => {
    //       this.errorMessage = err.error.message;
    //     }
    //   );
    // }

    onFoodTypeClick(foodType) {
        this.selectedFoodType = foodType;
        this.selectedFoodTypeId = foodType.id;
        this.selectedFoodTypeName = foodType.name;
        this.selectedFoodTypeSlug = foodType.slug;
        let foodMenuTypeArray = this.foodMenuTypeArray[foodType.slug];
        this.foodMenuTypes = [];
        this.selectedFoodMenuTypes = [];
        foodMenuTypeArray.forEach((element) => {
            if (element.value != '0') {
                element['selected'] = false;
                this.foodMenuTypes.push(element);
            }
        });
        this.showFoodMenuTypesList = true;
        //this.getFoodMenuTypes(this.selectedFoodTypeId);
    }
    onFoodMenuTypeClick(foodMenuType, event) {
        // console.log(event);
        this.selectedFoodMenuType = foodMenuType;
        if (this.selectedVenueCapacity != undefined) {
            this.totalVenuePrice =
                Number(this.selectedVenueCapacity) * Number(foodMenuType.value);
            this.totalFoodPrice = this.totalVenuePrice;
        }
        if (
            this.selectedDecorPrice != 0 &&
            this.selectedDecorPrice != undefined
        ) {
            this.totalVenuePrice =
                Number(this.totalVenuePrice) + Number(this.selectedDecorPrice);
        }
        // if (foodMenuType.selected == true) {
        //     let index = this.findIndexBySlug(foodMenuType.slug, this.foodMenuTypes);
        //     if (index != -1) {
        //         this.foodMenuTypes[index].selected = false;
        //         let selectedIndex = this.findSelectedIndexBySlug(foodMenuType.slug, this.selectedFoodMenuTypes);
        //         //let selectedNameIndex = this.findIndexById(foodMenuType.id, this.selectedVendorNames);
        //         this.selectedFoodMenuTypes.splice(selectedIndex, 1);
        //         //this.selectedFoodMenuTypesNames.splice(selectedNameIndex, 1);
        //     }
        // } else {

        // }
        let index = this.findIndexBySlug(foodMenuType.slug, this.foodMenuTypes);
        if (index != -1) {
            this.foodMenuTypes[index].selected = true;
            this.selectedFoodMenuTypes = [foodMenuType.slug];
            //this.selectedVendorNames.push({ 'id': foodMenuType.id, 'name': foodMenuType.name });
        }
        this.foodMenuTypes.forEach((element) => {
            if (element.slug == foodMenuType.slug) {
                element.selected = true;
            } else {
                element.selected = false;
            }
        });
        
        // Track analytics for food menu type selection
        console.log('📊 ANALYTICS: Food menu type selected:', foodMenuType.name || foodMenuType.slug);
        this.sendCurrentAnalytics();
    }
    findIndexBySlug(slug, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].slug === slug) {
                index = i;
                break;
            }
        }
        return index;
    }
    findSelectedIndexBySlug(slug, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i] === slug) {
                index = i;
                break;
            }
        }
        return index;
    }
    onClickDecorImage(decor) {
        this.showDecorImages = true;
        this.decorImages = decor.decorImages;
    }
    premiumDecor: boolean = false;
    onClickDecor(decor) {
        this.decorArray.forEach((element) => {
            if (element.name == decor.name) {
                element['selected'] = true;
            } else {
                element['selected'] = false;
            }
        });
        //this.showDecorImages = true;
        this.decorImages = decor.decorImages;
        this.selectedDecor = decor;
        this.selectedDecorPrice = decor.price;
        this.selectedDecorName = decor.name;

        if (decor.price != 'Call for prices') {
            this.premiumDecor = false;
            if (decor.price != undefined || decor.price != '') {
                this.totalVenuePrice =
                    this.totalFoodPrice + Number(decor.price);
                // this.totalVenuePrice = Number(this.totalVenuePrice) - Number(this.oldDecorPrice);
                // this.oldDecorPrice = decor.price;
                // this.totalVenuePrice = Number(this.totalVenuePrice) + Number(decor.price);
            }
        } else {
            this.premiumDecor = true;
            this.totalVenuePrice =
                Number(this.selectedVenueCapacity) *
                Number(this.selectedFoodMenuType.value);
        }
        
        // Track analytics for decor selection
        console.log('📊 ANALYTICS: Decor selected:', decor.name, 'Price:', decor.price);
        this.sendCurrentAnalytics();
    }
    onFeatureClick(feature) {
        if (feature.id == '1') {
            this.showSendEnquiries = true;
        } else {
            this.showSendEnquiries = false;
        }
        // this.featureArray.forEach(element => {
        //   let index = this.findIndexById(feature.id, this.featureArray);
        //   console.log(index);
        //   if (index == -1) {
        //     if (element.id == feature.id) {
        //       this.featureArray[index].selected = true;
        //       this.featureArray[index].status = false;
        //     } else {
        //       this.featureArray[index].selected = false;
        //       this.featureArray[index].status = true;
        //     }
        //   }
        // });
    }
    onClickVendor(vendor) {
        if (vendor.selected == true) {
            let index = this.findIndexById(vendor.id, this.vendorList);
            if (index != -1) {
                this.vendorList[index].selected = false;
                let selectedIndex = this.findSelectedIndexById(
                    vendor.id,
                    this.selectedVendor
                );
                let selectedNameIndex = this.findIndexById(
                    vendor.id,
                    this.selectedVendorNames
                );
                this.selectedVendor.splice(selectedIndex, 1);
                this.selectedVendorNames.splice(selectedNameIndex, 1);
            }
        } else {
            let index = this.findIndexById(vendor.id, this.vendorList);
            if (index != -1) {
                this.vendorList[index].selected = true;
                this.selectedVendor.push(vendor.id);
                this.selectedVendorNames.push({
                    id: vendor.id,
                    name: vendor.name,
                });
            }
        }
    }
    onClickOccasion(occasion) {
        // if (occasion.selected == true) {
        //   let index = this.findIndexById(occasion.id, this.occasionArray);
        //   if (index != -1) {
        //     //this.occasionArray[index].selected = false;
        //     let selectedIndex = this.findSelectedIndexById(occasion.id, this.selectedOccasion);
        //     let selectedNameIndex = this.findIndexById(occasion.id, this.selectedOccasionNames);
        //     this.selectedOccasion.splice(selectedIndex, 1);
        //     this.selectedOccasionNames.splice(selectedNameIndex, 1);
        //   }
        // } else {
        let index = this.findIndexById(occasion.id, this.occasionArray);
        if (index != -1) {
            // this.occasionArray[index].selected = true;
            this.occasionArray.forEach((element) => {
                if (element.id == occasion.id) {
                    element.selected = true;
                } else {
                    element.selected = false;
                }
            });
            //this.selectedOccasion.push(occasion.id);
            this.selectedOccasion = occasion.id;
            this.sOccasion = occasion;
            //this.selectedOccasionNames.push({ 'id': occasion.id, 'name': occasion.name });
            this.selectedOccasionNames = [
                { id: occasion.id, name: occasion.name },
            ];
        }
        // }
    }
    onSlotClick(slot) {
        this.selectedSlots = [
            {
                occasionStartDate: this.selectedStartDate,
                occasionEndDate: this.selectedEndDate,
                slotId: slot.id,
            },
        ];
        this.selectedSlotsName = slot.slot;
        // this.availabilityList.forEach(element => {
        //     element[1].forEach(item => {
        //         if (item.id == slot.id) {
        //             if (item.selected == true) {
        //                 item.selected = false;
        //                 let index = this.findPostAvailabilityIndexById(slot.id, this.selectedSlots);
        //                 this.selectedSlots.splice(index, 1);
        //             } else if (item.selected == false) {
        //                 item['selected'] = true;
        //                 if (this.multipleDaySelected == false) {
        //                     //this.selectedSlots.push({ 'postavailabilityId': slot.id, 'occasionDate': moment(slot.slotdate).local().format('MM-DD-YYYY'), slotId: slot.slotId });
        //                     this.selectedSlots = [{ 'postavailabilityId': slot.id, 'occasionDate': moment(slot.slotdate).local().format('MM-DD-YYYY'), 'slotId': slot.slotId }];
        //                 }
        //                 if (this.multipleDaySelected == true) {
        //                     // if (this.rangeDates != undefined) {
        //                     //   this.selectedSlots.push({
        //                     //     'postavailabilityId': slot.id, 'occasionDate': moment(slot.slotdate).local().format('MM-DD-YYYY')
        //                     //   });
        //                     // }
        //                 }
        //             }
        //         }
        //     });
        // });
    }
    findPostAvailabilityIndexById(id, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].postavailabilityId === id) {
                index = i;
                break;
            }
        }
        return index;
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
    get uniqueOccasions() {
        // If occasionArray is not populated yet, return empty array
        if (!this.occasionArray || this.occasionArray.length === 0) {
            return [];
        }

        // Create a map to track unique occasions by name
        const uniqueMap = new Map();

        // Add only unique items to the map (by name)
        this.occasionArray.forEach(occasion => {
            if (!uniqueMap.has(occasion.name)) {
                uniqueMap.set(occasion.name, occasion);
            }
        });

        // Convert map values back to array
        return Array.from(uniqueMap.values());
    }

    // Update the onCapacitySelect method to handle the new format
    onCapacitySelect(event) {
        if (event != undefined) {
            let venuePrice = 0;
            let totalVenuePrice = 0;

            // Set the selected capacity label for display
            this.selectedVenueCapacity = event.label;

            // Handle the different condition types
            if (event.condition === 'range') {
                // For range values, you might want to use the max or a specific value
                this.selectedGuestName = event.max;
            } else {
                // For lte or gte, use the value directly
                this.selectedGuestName = event.value;
            }

            // Calculate prices if needed
            if (this.selectedFoodMenuType != undefined) {
                venuePrice =
                    Number(this.selectedGuestName) *
                    Number(this.selectedFoodMenuType.value);
                totalVenuePrice =
                    Number(this.selectedDecorPrice) + Number(venuePrice);
            }

            this.totalVenuePrice = totalVenuePrice;
        }
    }

    onGuestCountSelect(guestCount: string) {
        // Deselect previously selected guest count
        this.guestCountOptions.forEach(option => {
          option.selected = option.value === guestCount;
        });

        // Set the selected venue capacity
        this.selectedVenueCapacity = guestCount;

        // Calculate numeric value for pricing
        let calculatedGuestCount = 0;
        if (guestCount === '0-100') {
          calculatedGuestCount = 50; // Midpoint
        } else if (guestCount === '100-200') {
          calculatedGuestCount = 150; // Midpoint
        } else if (guestCount === '200+') {
          calculatedGuestCount = 200; // Minimum
        }

        // Calculate venue price if food menu type is selected
        let venuePrice = 0;
        let totalVenuePrice = 0;
        if (this.selectedFoodMenuType != undefined) {
          venuePrice = calculatedGuestCount * Number(this.selectedFoodMenuType.value);
          totalVenuePrice = Number(this.selectedDecorPrice || 0) + Number(venuePrice);
        }

        this.totalVenuePrice = totalVenuePrice;
        this.selectedGuestName = guestCount;
        
        // Track analytics for guest count selection
        console.log('📊 ANALYTICS: Guest count selected:', guestCount);
        this.sendCurrentAnalytics();
      }
  onClickEventDate(event) {
        this.selectedStartDate = this.rangeDates[0];
        this.selectedEndDate = this.rangeDates[1];
        
        // Use DD/MM/YYYY format for backend query (same as booking-analytics component)
        let startDate = moment(this.selectedStartDate).format('DD/MM/YYYY');
        let endDate;
        if (this.selectedEndDate === null) {
            endDate = moment(this.selectedStartDate).format('DD/MM/YYYY');
        } else {
            this.datePicker.overlayVisible = false;
            endDate = moment(this.selectedEndDate).format('DD/MM/YYYY');
        }
        
        // Keep selectedStartDate/selectedEndDate in DD/MM/YYYY for UI consistency
        this.selectedStartDate = moment(this.selectedStartDate).local().format('DD/MM/YYYY');
        this.selectedEndDate = moment(this.selectedEndDate).local().format('DD/MM/YYYY');
        this.selectedDate = moment(event).local().format('DD-MM-YYYY');

        // Debugging: Check if we reach the booking conflict check
        console.log('[DEBUG] onClickEventDate called with event:', event);
        console.log('[DEBUG] venueDetails:', this.venueDetails);
        console.log('[DEBUG] Calculated startDate (DD/MM/YYYY):', startDate, 'endDate (DD/MM/YYYY):', endDate);
        if (this.venueDetails && this.venueDetails.id && this.isLoggedIn) {
            console.log('[DEBUG] Checking for existing bookings for venueId:', this.venueDetails.id);
            this.bookingService.getVenueBookings(this.venueDetails.id, {
                startDate: startDate,
                endDate: endDate
            }).subscribe(
                (res: any) => {
                    console.log('[DEBUG] BookingService.getVenueBookings response:', res);
                    const bookingsArr = res && res.success && res.data && Array.isArray(res.data.bookings) ? res.data.bookings : [];
                    if (bookingsArr.length > 0) {
                        // There are bookings in this range - get specific booked dates
                        const selectedStartDate = moment(this.selectedStartDate, 'DD/MM/YYYY').toDate();
                        const selectedEndDate = moment(this.selectedEndDate, 'DD/MM/YYYY').toDate();
                        const bookedDatesInRange = this.getBookedDatesInRange(selectedStartDate, selectedEndDate);
                        
                        console.log('[DEBUG] Booked dates found, showing warning to user.');
                        console.log('[DEBUG] Specific booked dates:', bookedDatesInRange);
                        
                        const warningMessage = bookedDatesInRange.length > 0 
                            ? `The following dates are already booked: ${bookedDatesInRange.join(', ')}. Please choose different dates.`
                            : 'Some dates in your selection are already booked. Please choose different dates.';
                        
                        this.messageService.add({
                            key: 'toastMsg',
                            severity: 'warn',
                            summary: 'Date Unavailable',
                            detail: warningMessage,
                            life: 8000
                        });
                        // Optionally, you can clear the selected dates or prevent further action here
                        // this.rangeDates = null;
                        // this.selectedDate = null;
                    } else {
                        console.log('[DEBUG] No bookings found for selected dates.');
                    }
                },
                (err) => {
                    console.error('[DEBUG] Error in getVenueBookings:', err);
                }
            );
        } else {
            console.log('[DEBUG] venueDetails or venueDetails.id not set, skipping booking check.');
        }

        let query =
            'filterByDisable=false&filterByStatus=true&filterByVenueId=' +
            this.id +
            '&filterBySlotStartDate=' +
            startDate +
            '&filterBySlotEndDate=' +
            endDate;
        this.postAvailabilityService
            .getPostAvailabilityListWithoutAuth(query)
            .subscribe(
                (data) => {
                    let totalCount = data.data.totalCount;
                    let startDate = moment(
                        this.selectedStartDate,
                        'DD.MM.YYYY'
                    );
                    let endDate = moment(this.selectedEndDate, 'DD.MM.YYYY');
                    var days = endDate.diff(startDate, 'days');
                    days = Number(days) + Number(1);
                    let totalExpectedSlots = Number(days) * 3;
                    if (totalCount == totalExpectedSlots) {
                        this.showAvailabilityMessage = false;
                    } else {
                        this.showAvailabilityMessage = true;
                    }
                    //this.availabilityList = [];
                    //let availabilityList = data.data.items;
                    // this.availabilityList =
                    //     availabilityList.reduce((result, currentValue) => {
                    //         (result[currentValue.slotdate] = result[currentValue.slotdate] || []).push(
                    //             currentValue
                    //         );
                    //         return result;
                    //     }, {});
                    // this.availabilityList = Object.entries(this.availabilityList);
                    // this.availabilityList.forEach(element => {
                    //     if (element[0]) {
                    //         element[0] = moment(element[0]).local().format('DD-MM-YYYY');
                    //     }
                    //     if (element[1].length > 0) {
                    //         element[1].forEach(item => {
                    //             item['selected'] = false;
                    //         });
                    //     }
                    // });
                },
                (err) => {
                    this.errorMessage = err.error.message;
                }
            );
            
        // Track analytics for date selection
        console.log('📊 ANALYTICS: Event dates selected:', this.selectedStartDate, 'to', this.selectedEndDate);
        this.sendCurrentAnalytics();
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
    findSelectedIndexById(id, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i] === id) {
                index = i;
                break;
            }
        }
        return index;
    }
    onGenderSelect(gender, event) {
        this.selectedGender = '';
        if (event.isTrusted) {
            this.selectedGender = gender;
        }
    }
    getRoleDetails() {
        const querystring =
            'filterByroleId=' + this.userData.data.userdata.role;
        this.roleService.searchRoleDetails(querystring).subscribe(
            (data) => {
                this.trainerRoleId = data.data.items[0]['id'];
                this.permissions = data.data.items[0]['permissions'];
                this.tokenStorageService.saveUserPermissions(this.permissions);
                this.rolelist = data.data.items[0];
            },
            (err) => {
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
        var querystring = 'filterByDisable=false&filterByStatus=true';
        var rolearray = [];
        this.roleService.getRoleList(querystring).subscribe(
            (data) => {
                var rolelist = data.data.items;
                rolelist.forEach((element) => {
                    rolearray.push({
                        roleid: element.id,
                        rolename: element.user_role_name,
                    });
                });
                if (rolearray.length > 0) {
                    this.tokenStorageService.saveRolelist(rolearray);
                }
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    onClickClear() {
        this.rangeDates = null;
        this.selectedDate = null;
        // this.startDate = undefined;
        // this.endDate = undefined;
    }
    onClickCalendarClose() {
        this.datePicker.overlayVisible = false;
    }
    search(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.cityList.length; i++) {
            let city = this.cityList[i];
            if (city.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                city.mode = 'city';
                filtered.push(city);
            }
        }
        for (let i = 0; i < this.subareaList.length; i++) {
            let subarea = this.subareaList[i];
            if (subarea.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                subarea.mode = 'subarea';
                filtered.push(subarea);
            }
        }
        for (let i = 0; i < this.finalVenueList.length; i++) {
            let venue = this.finalVenueList[i];
            if (venue.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                venue.mode = 'venue';
                filtered.push(venue);
            }
        }
        this.filteredList = filtered;
    }
    async getSubareas() {
        let query = '?filterByDisable=false&filterByStatus=true';
        this.subareaService.getSubareaList(query).subscribe(
            (data) => {
                this.subareaList = data.data.items;
                this.selectedSubareaData = [];
                this.subareaList.forEach((element) => {
                    if (this.filterSubareaIds != undefined) {
                        if (this.filterSubareaIds.length > 0) {
                            this.filterSubareaIds.forEach((sElement) => {
                                if (sElement === element.id) {
                                    this.selectedSubareaData.push(element);
                                    if (this.selectedFilter === undefined) {
                                        this.selectedFilter = [element];
                                    } else {
                                        this.selectedFilter.push(element);
                                    }
                                }
                            });
                        }
                    }
                });
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    async getCities() {
        let query = '?filterByDisable=false&filterByStatus=true';
        this.cityService.getcityList(query).subscribe(
            (data) => {
                this.cityList = data.data.items;
                if (this.cityList.length > 0) {
                    this.selectedFilter = [];
                    this.cityList.forEach((element) => {
                        if (this.filterCityIds !== undefined) {
                            if (this.filterCityIds.length > 0) {
                                this.filterCityIds.forEach((cElement) => {
                                    element.mode = 'city';
                                    if (cElement === element.id) {
                                        if (this.selectedFilter == undefined) {
                                            this.selectedFilter = [element];
                                        } else {
                                            this.selectedFilter.push(element);
                                        }
                                    }
                                });
                            }
                        }
                    });
                    this.selectedSubareaData.forEach((sElement) => {
                        sElement.mode = 'subarea';
                        this.selectedFilter.push(sElement);
                    });
                    if (this.selectedVenueList.length > 0) {
                        this.selectedVenueList.forEach((vElement) => {
                            vElement.mode = 'venue';
                            this.selectedFilter.push(vElement);
                        });
                    }
                }
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }

    onClearResetAllData(event) {
        if (event.mode === 'venue') {
            let index = this.findVenueIndexById(
                event.id,
                this.selectedVenueIds
            );
            let venueIndex = this.findIndexById(
                event.id,
                this.selectedVenueList
            );
            let filterVenueIndex = this.findVenueIndexById(
                event.id,
                this.filterVenueIds
            );
            if (index !== -1) {
                if (this.selectedVenueIds.length > 0) {
                    this.selectedVenueIds.splice(index, 1);
                }
            }
            if (venueIndex !== -1) {
                this.selectedVenueList.splice(venueIndex, 1);
            }
            if (filterVenueIndex !== -1) {
                this.filterVenueIds.splice(filterVenueIndex, 1);
            }
        } else if (event.mode === 'subarea') {
            let index = this.findVenueIndexById(
                event.id,
                this.selectedSubareaIds
            );
            let filterSubareaIdsIndex = this.findVenueIndexById(
                event.id,
                this.filterSubareaIds
            );
            let selectedSubareaIndex = this.findIndexById(
                event.id,
                this.selectedSubareaData
            );
            if (index !== -1) {
                this.selectedSubareaIds.splice(index, 1);
            }
            if (filterSubareaIdsIndex !== -1) {
                this.filterSubareaIds.splice(filterSubareaIdsIndex, 1);
            }
            if (selectedSubareaIndex !== -1) {
                this.selectedSubareaData.splice(selectedSubareaIndex, 1);
            }
        } else if (event.mode === 'city') {
            let index = this.findVenueIndexById(event.id, this.selectedCities);
            let filterCityIndex = this.findVenueIndexById(
                event.id,
                this.filterCityIds
            );
            if (index !== -1) {
                this.selectedCities.splice(index, 1);
            }
            if (filterCityIndex !== -1) {
                this.selectedCities.splice(filterCityIndex, 1);
            }
        }
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
    }
    onClickSearch() {
        if (this.selectedVenueCapacity === undefined) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'Error',
                detail: 'Please select guest count.',
                life: 3000,
            });
            return;
        }
        let selectedCities = JSON.stringify(this.selectedCities);
        let selectedSubareaIds = JSON.stringify(this.selectedSubareaIds);
        let selectedVenueIds = JSON.stringify(this.selectedVenueIds);
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.startDate = moment(this.rangeDates[0]).format('YYYY-MM-DD');
        this.endDate = moment(this.rangeDates[1]).format('YYYY-MM-DD');
        this.router.navigate(['/venue'], {
            queryParams: {
                startDate: this.startDate,
                endDate: this.endDate,
                capacity: this.selectedVenueCapacity,
                occasion: this.selectedCategories,
                city: selectedCities,
                area: selectedSubareaIds,
                venue: selectedVenueIds,
            },
        });
    }
    onClickCategory(category) {
        if (category !== null) {
            this.selectedOccasion = category.id;
            if (category.selected == true) {
                this.selectedCategories = [];
                //this.selectedCategoriesNames = [];
                let index = this.findIndexById(
                    category.id,
                    this.categoryMenuList
                );
                if (index != -1) {
                    this.categoryMenuList[index].selected = false;
                    // let selectedIndex = this.findSelectedIndexById(category.id, this.selectedCategories);
                    // if (selectedIndex != -1) {
                    //     this.selectedCategories.splice(selectedIndex, 1);
                    // }
                    // let selectedNameIndex = this.findIndexById(category.id, this.selectedCategoriesNames);
                    // if (selectedNameIndex != -1) {
                    //     this.selectedCategoriesNames.splice(selectedNameIndex, 1);
                    // }
                }
            } else {
                let index = this.findIndexById(
                    category.id,
                    this.categoryMenuList
                );
                if (index != -1) {
                    this.categoryMenuList[index].selected = true;
                    //let selectedIndex = this.findSelectedIndexById(category.id, this.selectedCategories);
                    this.selectedCategories = category.id;
                    this.sOccasion = category;
                    //this.selectedCategoriesNames = [{ 'id': category.id, 'name': category.name, selected: true }];
                }
            }
        } else {
            this.selectedOccasion = undefined;
            this.selectedCategories = [];
            //this.selectedCategoriesNames = [];
        }
        if (this.selectedCategories == undefined) {
            this.selectedCategories = [];
        }
    }
    onClickOccasionCategory(event) {
        console.log(event);
        this.selectedOccasion = event.id;
        this.sOccasion = event;
        this.selectedOccasionNames = [{ id: event.id, name: event.name }];
        
        // Track analytics for occasion selection
        console.log('📊 ANALYTICS: Occasion selected:', event.name);
        
        if (event.id !== undefined) {
            let index = this.findIndexById(event.id, this.occasionArray);
            if (index != -1) {
                // this.occasionArray[index].selected = true;
                this.occasionArray.forEach((element) => {
                    if (element.id == event.id) {
                        element.selected = true;
                    } else {
                        element.selected = false;
                    }
                });
                //this.selectedOccasion.push(occasion.id);
                //this.selectedOccasion = event.id;
                //this.selectedOccasionNames.push({ 'id': occasion.id, 'name': occasion.name });
            } else {
                this.occasionArray.forEach((element) => {
                    element.selected = false;
                });
            }
        }
        
        // Send analytics update for occasion selection
        this.sendCurrentAnalytics();
    }
    getCategoryBySlug() {
        let query = '?filterByDisable=false&filterByStatus=true';
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            (data) => {
                if (data.data.items.length > 0) {
                    this.parentCategoryDetails = data.data.items;
                    this.parentCategoryDetails.forEach((element) => {
                        if (element.slug == 'parent_category') {
                            this.parentCategoryId = element['id'];
                            this.getCategoryList();
                        }
                        // if (element.slug == "property_type") {
                        //     this.propertyTypeId = element['id'];
                        //     this.getPropertyTypes();
                        // }
                        if (element.slug == 'food') {
                            this.foodTypeId = element['id'];
                            this.getFoodTypes();
                        }
                    });
                }
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    getCategoryList() {
        let query =
            '?filterByDisable=false&filterByStatus=true&filterByParent=' +
            this.parentCategoryId +
            '&sortBy=created_at&orderBy=1';
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            (data) => {
                //if (data.data.items.length > 0) {
                this.selectedCategories = [];
                this.categoryMenuList = data.data.items;
                let count = 0;
                this.categoryMenuList.forEach((element) => {
                    element['selected'] = false;
                    if (this.filterCategoryId == element.id) {
                        //this.selectedOccasion.push(element);
                        //this.selectedOccasion = element.id;
                        element['selected'] = true;
                        this.selectedCategories.push(element.id);
                        this.sOccasion = element;
                        this.occasionArray.forEach((element) => {
                            if (element.id == this.filterCategoryId) {
                                element.selected = true;
                            } else {
                                element.selected = false;
                            }
                        });
                        this.selectedOccasionNames.push({
                            id: element.id,
                            name: element.name,
                        });
                    }
                    count++;
                });

                //}
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    getFoodTypes() {
        let query =
            '?filterByDisable=false&filterByStatus=true&filterByParent=' +
            this.foodTypeId +
            '&sortBy=created_at&orderBy=1';
        this.categoryService.getCategoryWithoutAuthList(query).subscribe(
            (data) => {
                //if (data.data.items.length > 0) {
                this.foodTypesListA = data.data.items;
                let count = 0;
                this.foodTypesListA.forEach((element) => {
                    element['selected'] = false;
                    element['disable'] = true;
                    this.foodTypesList.forEach((fElement) => {
                        if (fElement.id === element.id) {
                            element['disable'] = false;
                        }
                    });
                    count++;
                });
            },
            (err) => {
                this.errorMessage = err.error.message;
            }
        );
    }
    filterCategory(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.categoryMenuList.length; i++) {
            let category = this.categoryMenuList[i];
            if (category.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(category);
            }
        }
        this.filterOccasion = filtered;
    }
    onClickCloseCancelation() {
        this.visible = false;
    }

    onClickSendEnquiries(mode) {
        if (this.isLoggedIn == false) {
            this.numberPopup = true;
            return;
        }

        if (
            this.selectedOccasion === undefined ||
            this.selectedOccasion === null
        ) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'error',
                detail: 'Please select occasion.',
                life: 6000,
            });
            return;
        }
        // if (this.selectedOccasion.length == 0) {
        //     this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select occasion.', life: 6000 });
        //     return;
        // }
        if (this.selectedDate == undefined) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'error',
                detail: 'Please select Event Date.',
                life: 6000,
            });
            return;
        }
        if (mode === 'book_now') {
            if (this.selectedSlots.length == 0) {
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: 'error',
                    detail: 'Please select Slot.',
                    life: 6000,
                });
                return;
            }
        }
        if (this.selectedVenueCapacity == undefined) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'error',
                detail: 'Please select Guest Capacity.',
                life: 6000,
            });
            return;
        }
        if (mode === 'book_now') {
            if (this.selectedFoodTypeSlug == undefined) {
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: 'error',
                    detail: 'Please select Food Type.',
                    life: 6000,
                });
                return;
            }
            if (
                this.selectedFoodMenuTypes == undefined ||
                this.selectedFoodMenuTypes.length == 0
            ) {
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: 'error',
                    detail: 'Please select Food Menu Type.',
                    life: 6000,
                });
                return;
            }
        }
        // if (this.selectedDecor == undefined) {
        //   this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select Decor.', life: 6000 });
        //   return;
        // }
        // if (this.selectedVendor.length == 0) {
        //   this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select Vendor.', life: 6000 });
        //   return;
        // }
        this.offerPaymentValue25_percent = this.totalVenuePrice * 0.25;
        this.orderType = mode;
        
        // Track analytics immediately when buttons are clicked
        if (mode === 'book_now') {
            // This is "Reserve For ₹5000" button - track as reserve clicked
            this.clickedOnReserved = true;
            console.log('📊 ANALYTICS: Reserve For ₹5000 button clicked, clickedOnReserved =', this.clickedOnReserved);
        } else if (mode === 'send_enquires') {
            // This is "Send Enquiry" button - track as enquiry clicked
            this.sendEnquiryClicked = true;
            console.log('📊 ANALYTICS: Send Enquiry button clicked, sendEnquiryClicked =', this.sendEnquiryClicked);
        }
        
        this.isBookingSummary = true;
        this.showVenueDetailFilter = false;

    }
    onClickSendfastquery(mode) {
        if (this.isLoggedIn == false) {
            this.numberPopup = true;
            return;
        }

        if (
            this.selectedOccasion === undefined ||
            this.selectedOccasion === null
        ) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'error',
                detail: 'Please select occasion.',
                life: 6000,
            });
            return;
        }
        // if (this.selectedOccasion.length == 0) {
        //     this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select occasion.', life: 6000 });
        //     return;
        // }
        if (mode === 'book_now') {
            if (this.selectedSlots.length == 0) {
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: 'error',
                    detail: 'Please select Slot.',
                    life: 6000,
                });
                return;
            }
        }
        if (this.selectedVenueCapacity == undefined) {
            this.messageService.add({
                key: 'toastMsg',
                severity: 'error',
                summary: 'error',
                detail: 'Please select Guest Capacity.',
                life: 6000,
            });
            return;
        }

        // if (this.selectedDecor == undefined) {
        //   this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select Decor.', life: 6000 });
        //   return;
        // }
        // if (this.selectedVendor.length == 0) {
        //   this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select Vendor.', life: 6000 });
        //   return;
        // }
        this.orderType = mode;
        
        // Track analytics immediately when fast enquiry button is clicked
        if (mode === 'send_enquires') {
            this.sendEnquiryClicked = true;
            console.log('📊 ANALYTICS: Fast enquiry button clicked, sendEnquiryClicked =', this.sendEnquiryClicked);
        }
        
        this.isBookingenquerySummary = true;
        this.showVenueDetailFilter = false;
    }
    onClickBooking(mode) {
        
        // Track analytics - Book Now clicked
        this.clickedOnBookNow = true;
        console.log('📊 ANALYTICS: Book Now clicked, clickedOnBookNow =', this.clickedOnBookNow);
        
        console.log('=== BOOKING PROCESS STARTED ===');
        console.log('Mode:', mode);
        console.log('Payment Amount:', this.paymentAmount);
        console.log('Selected Decor:', this.selectedDecor);
        console.log('Venue Details:', this.venueDetails);
        console.log('User ID:', this.userId);
        console.log('Full User Details:', this.fullUserDetails);

        let durationData = [
            {
                occasionStartDate: this.rangeDates[0],
                occasionEndDate: this.rangeDates[1],
                slotId: this.selectedSlots[0]?.slotId,
            },
        ];
        console.log('Duration Data:', durationData);

        let venueOrderData = {
            categoryId: this.sOccasion.id,
            occasionDate: this.selectedDate,
            durationData: durationData,
            guestcnt: this.selectedVenueCapacity,
            decor: this.selectedDecorPrice,
            foodType: [this.selectedFoodTypeSlug],
            foodPrice: this.totalFoodPrice,
            decorType: this.selectedDecor?.name,
            vendors: this.selectedVendor,
            customerId: this.userId,
            venueId: this.venueDetails.id,
            price: this.totalVenuePrice,
            foodMenuType: this.selectedFoodMenuTypes,
            orderType: mode,
            bookingPrice:
                this.paymentAmount === 'full'
                    ? this.totalVenuePrice
                    : this.paymentAmount === '25_percent'
                    ? this.offerPaymentValue25_percent
                    : this.paymentAmount === 'custom'
                    ? this.customAmountValue
                    : 5000,
            guestCount: this.capacity,
            decorName: this.selectedDecorName,
            paymentType: this.paymentAmount,
            // Analytics tracking fields
            sendEnquiryClicked: this.sendEnquiryClicked,
            clickedOnReserved: this.clickedOnReserved,
            clickedOnBookNow: this.clickedOnBookNow,
            madePayment: mode === 'book_now' // Will be true for book_now, false for enquiries
        };
        console.log('=== VENUE ORDER DATA PREPARED ===');
        console.log(venueOrderData);
        console.log('📊 VENUE ORDER: Analytics tracking:');
        console.log('   sendEnquiryClicked:', venueOrderData.sendEnquiryClicked);
        console.log('   clickedOnReserved:', venueOrderData.clickedOnReserved);
        console.log('   clickedOnBookNow:', venueOrderData.clickedOnBookNow);
        console.log('   madePayment:', venueOrderData.madePayment);

        //send data to api and
        console.log('=== SENDING VENUE ORDER TO API ===');
        this.placeAnOrderOrEnquiry(venueOrderData);
    }
    async placeAnOrderOrEnquiry(orderData) {
        console.log(' FRONTEND: About to send venue order to API');
        console.log('📤 FRONTEND: Order data being sent:', JSON.stringify(orderData, null, 2));
        console.log('📤 FRONTEND: API endpoint:', environment.apiUrl + 'venueorder');
        
        this.venueOrderService.addVenueOrder(orderData).subscribe(
            async (data) => {
                console.log('✅ FRONTEND: API response received:', data);
                if (data && data.message === 'no profile') {
                    this.messageService.add({
                        key: 'toastMsg',
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Please complete your profile first.',
                        life: 3000,
                    });
                } else {
                    if (this.orderType == 'book_now') {
                        // PRODUCTION READY - Razorpay payment integration
                        const options = {
                            key: environment.razorPayKeyLive, // Live key for production
                            amount: data.amount,
                            currency: data.currency,
                            order_id: data.order_id,
                            name: data.name,
                            description: data.description,
                            image: data.image,
                            handler: (response: any) => {
                                response.venueOrderId = data.venueOrderId;
                                response.orderType = 'venue';
                                this.onRazorWindowClosed(response);
                            },
                            prefill: data.prefill,
                            theme: {
                                color: '#eb3438',
                            },
                            modal: {
                                ondismiss: () => {
                                    console.log('Payment modal closed by user');
                                    // Optional: Track payment abandonment
                                    console.log('� ANALYTICS: Payment modal dismissed without completion');
                                },
                            },
                        };
                        
                        console.log('🏦 PRODUCTION: Opening Razorpay payment gateway...');
                        try {
                            const rzp = new Razorpay(options);
                            rzp.open();
                        } catch (error) {
                            console.error('💰 PAYMENT ERROR: Failed to open Razorpay:', error);
                            this.messageService.add({
                                key: 'toastMsg',
                                severity: 'error',
                                summary: 'Payment Gateway Error',
                                detail: 'Failed to open payment gateway. Please try again or contact support.',
                                life: 6000,
                            });
                        }
                    } else {
                        this.markEnquirySubmitted(); 
                        this.messageService.add({
                            key: 'toastMsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Enquires send to eazyvenue.',
                            life: 6000,
                        });
                        setTimeout(() => {
                            let currentUrl = '/my-profile';
                            console.log('currentUrl', currentUrl);
                            this.router.routeReuseStrategy.shouldReuseRoute =
                                () => false;
                            this.router.onSameUrlNavigation = 'reload';
                            this.router.navigate([currentUrl], {
                                queryParams: { mode: this.orderType },
                            });
                        }, 2000);
                    }
                }
            },
            (err) => {
                console.error('❌ FRONTEND: API Error occurred:', err);
                console.error('❌ FRONTEND: Error status:', err.status);
                console.error('❌ FRONTEND: Error message:', err.message);
                console.error('❌ FRONTEND: Error details:', err.error);
    
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: err.error?.message || 'API Error',
                    detail: 'Venue order booking failed. Check console for details.',
                    life: 6000,
                });
            }
        );
    }
    onRazorWindowClosed(response) {
        this.isBookingSummary = false;
        
        console.log('💰 PAYMENT: Razorpay response received:', response);
        
        // First verify the payment with backend
        this.venueOrderService.handleVenuePayment(response).subscribe(
            (res: any) => {
                console.log('💰 PAYMENT: Backend verification response:', res);
                
                if (res.status === 'Success') {
                    // Payment successful - update analytics tracking immediately
                    this.madePayment = true;
                    console.log('✅ PAYMENT SUCCESS: Updated madePayment =', this.madePayment);
                    
                    // Payment verified successfully, now create booking record
                    this.createBookingRecord(response.venueOrderId)
                        .then(() => {
                            console.log('✅ BOOKING: Booking record created successfully');
                            this.messageService.add({
                                key: 'toastMsg',
                                severity: 'success',
                                summary: 'Payment Successful!',
                                detail: 'Your venue booking has been completed successfully!',
                                life: 6000,
                            });
                            
                            // Send updated analytics with payment completion
                            this.sendPaymentAnalytics();
                            
                            // Refresh booked dates to include this new booking
                            this.refreshBookedDates();
                            
                            setTimeout(() => {
                                this.router.navigateByUrl('/my-profile?mode=bookings');
                            }, 2000);
                        })
                        .catch((error) => {
                            console.error('❌ BOOKING: Error creating booking record:', error);
                            this.messageService.add({
                                key: 'toastMsg',
                                severity: 'warn',
                                summary: 'Payment Successful',
                                detail: 'Payment completed but booking record creation failed. Please contact support with your payment ID.',
                                life: 8000,
                            });
                        });
                }
                if (res.status === 'pending') {
                    // payment pending show pending popup
                    this.messageService.add({
                        key: 'toastMsg',
                        severity: 'info',
                        summary: 'Payment Pending',
                        detail: 'Your payment is being processed. Please wait.',
                        life: 6000,
                    });
                }
                if (res.status === 'failed') {
                    // payment failed tell to try again
                    this.messageService.add({
                        key: 'toastMsg',
                        severity: 'error',
                        summary: 'Payment Failed',
                        detail: 'Payment failed. Please try again.',
                        life: 6000,
                    });
                }
            },
            (err) => {
                console.log('Payment verification error:', err);
                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Payment verification failed. Please contact support.',
                    life: 6000,
                });
            }
        );
    }

    /**
     * Creates a booking record in the database after successful payment
     * @param venueOrderId - The ID of the venue order that was just created
     */
    async createBookingRecord(venueOrderId: string): Promise<void> {
        try {
            console.log('Creating booking record for venue order:', venueOrderId);
            console.log('🔄 Current venue details:', this.venueDetails);
            console.log('🔄 Current user details:', this.fullUserDetails);
            console.log('🔄 Selected dates:', this.rangeDates);
            console.log('🔄 Selected occasion:', this.sOccasion);
            console.log('🔄 User ID:', this.userId);
            console.log('🔄 Logged in user:', this.loggedInUser);
            console.log('🔄 User ID extraction: this.userId =', this.userId, ', loggedInUser.userdata.id =', this.loggedInUser?.userdata?.id, ', loggedInUser.id =', this.loggedInUser?.id);
            
            // Validate required user data - check both userId and loggedInUser.userdata.id
            const actualUserId = this.userId || this.loggedInUser?.userdata?.id || this.loggedInUser?.id;
            console.log('🔄 Actual user ID resolved to:', actualUserId);
            if (!actualUserId) {
                throw new Error('User ID is required but not available');
            }
            
            // If fullUserDetails is not loaded, try to load it synchronously
            if (!this.fullUserDetails && actualUserId) {
                console.log('🔄 User details not loaded, attempting to load...');
                try {
                    // Get user details synchronously if possible
                    await new Promise((resolve, reject) => {
                        this.userService.getUserDetails(actualUserId).subscribe(
                            (data) => {
                                this.fullUserDetails = data;
                                console.log('✅ User details loaded successfully:', this.fullUserDetails);
                                resolve(data);
                            },
                            (err) => {
                                console.error('❌ Failed to load user details:', err);
                                reject(err);
                            }
                        );
                    });
                } catch (error) {
                    console.warn('⚠️ Could not load user details, proceeding with available data:', error);
                }
            }
            
            if (!this.fullUserDetails && !this.loggedInUser) {
                throw new Error('User details are required but not available');
            }
            
            // Prepare frontend booking data in the format expected by createBookingFromFrontend
            const frontendBookingData = {
                venueId: this.venueDetails.id,
                venueName: this.venueDetails.name,
                userId: actualUserId,
                userName: this.fullUserDetails?.firstName && this.fullUserDetails?.lastName 
                    ? `${this.fullUserDetails.firstName} ${this.fullUserDetails.lastName}` 
                    : this.loggedInUser?.userdata?.firstname && this.loggedInUser?.userdata?.lastname
                    ? `${this.loggedInUser.userdata.firstname} ${this.loggedInUser.userdata.lastname}`
                    : this.loggedInUser?.userdata?.fullName || this.loggedInUser?.name || 'Unknown User',
                userContact: this.fullUserDetails?.mobileNumber || this.fullUserDetails?.mobile || this.fullUserDetails?.phone || this.loggedInUser?.userdata?.mobile || this.loggedInUser?.mobileNumber || '',
                userEmail: this.fullUserDetails?.email || this.loggedInUser?.userdata?.email || this.loggedInUser?.email || '',
                occasionDate: this.selectedDate,
                durationData: [
                    {
                        occasionStartDate: this.rangeDates[0],
                        occasionEndDate: this.rangeDates[1],
                        slotId: this.selectedSlots[0]?.slotId,
                    },
                ],
                guestCount: this.selectedVenueCapacity?.toString() || this.capacity?.toString() || '0',
                categoryId: this.sOccasion?.id,
                selectedSlot: this.selectedSlots,
                selectedFoodType: [this.selectedFoodTypeSlug],
                selectedFoodMenuTypes: this.selectedFoodMenuTypes,
                selectedDecor: this.selectedDecor,
                decorPrice: this.selectedDecorPrice || 0,
                foodPrice: this.totalFoodPrice || 0,
                totalAmount: this.totalVenuePrice || 0,
                paymentAmount: this.paymentAmount,
                paymentType: this.paymentAmount,
                orderType: 'book_now',
                // Missing fields that are causing nulls in database - using same data sources as venue order
                eventDuration: this.getEventDurationFromSlot() || this.selectedSlotsName || 'full',
                foodMenuType: this.getFoodMenuTypeNames() || (this.selectedFoodMenuTypes && this.selectedFoodMenuTypes.length > 0 
                    ? this.selectedFoodMenuTypes.join(', ') 
                    : this.selectedFoodTypeSlug || 'standard'),
                foodMenuPlate: this.getFoodMenuPlate() || (this.selectedFoodMenuTypes && this.selectedFoodMenuTypes.length > 0 
                    ? this.selectedFoodMenuTypes[0] 
                    : '2x2'),
                // Analytics tracking fields - use actual component values
                sendEnquiryClicked: this.sendEnquiryClicked,
                clickedOnReserved: this.clickedOnReserved,
                clickedOnBookNow: this.clickedOnBookNow,
                madePayment: this.madePayment // Use component's madePayment value
            };

            // Debug analytics tracking values
            console.log('📊 ANALYTICS DEBUG:');
            console.log('   sendEnquiryClicked:', this.sendEnquiryClicked, '-> booking data:', frontendBookingData.sendEnquiryClicked);
            console.log('   clickedOnReserved:', this.clickedOnReserved, '-> booking data:', frontendBookingData.clickedOnReserved);
            console.log('   clickedOnBookNow:', this.clickedOnBookNow, '-> booking data:', frontendBookingData.clickedOnBookNow);
            console.log('   madePayment will be:', frontendBookingData.madePayment);

            // Debug the missing fields
            console.log('🔍 DEBUG: Checking missing fields...');
            console.log('🔍 eventDuration:', frontendBookingData.eventDuration);
            console.log('🔍 selectedSlotsName:', this.selectedSlotsName);
            console.log('🔍 selectedSlots:', this.selectedSlots);
            console.log('🔍 foodMenuType:', frontendBookingData.foodMenuType);
            console.log('🔍 selectedFoodMenuTypes:', this.selectedFoodMenuTypes);
            console.log('🔍 selectedFoodMenuType:', this.selectedFoodMenuType);
            console.log('🔍 selectedFoodTypeSlug:', this.selectedFoodTypeSlug);
            console.log('🔍 foodMenuPlate:', frontendBookingData.foodMenuPlate);
            console.log('🔍 selectedVenueCapacity:', this.selectedVenueCapacity);
            
            // Debug method returns
            console.log('🔍 METHOD RETURNS:');
            console.log('   getEventDurationFromSlot():', this.getEventDurationFromSlot());
            console.log('   getFoodMenuTypeNames():', this.getFoodMenuTypeNames());
            console.log('   getFoodMenuPlate():', this.getFoodMenuPlate());
            
            console.log('🔍 VENUE ORDER COMPARISON:');
            console.log('   📦 VenueOrder.foodMenuType would be:', this.selectedFoodMenuTypes);
            console.log('   📦 VenueOrder.foodType would be:', [this.selectedFoodTypeSlug]);
            console.log('   📦 VenueOrder.durationData would be:', [{
                occasionStartDate: this.rangeDates[0],
                occasionEndDate: this.rangeDates[1], 
                slotId: this.selectedSlots[0]?.slotId
            }]);
            
            // Enhanced debugging - check each method individually
            console.log('🔍 DETAILED DEBUG:');
            console.log('   getEventDurationFromSlot() returns:', this.getEventDurationFromSlot());
            console.log('   getFoodMenuTypeNames() returns:', this.getFoodMenuTypeNames());
            console.log('   getFoodMenuPlate() returns:', this.getFoodMenuPlate());
            
            // If any of these are null, let's set robust fallback values to prevent nulls in database
            if (!frontendBookingData.eventDuration || frontendBookingData.eventDuration === null) {
                // Try multiple fallback sources
                frontendBookingData.eventDuration = this.selectedSlotsName || 
                                                  (this.selectedSlots && this.selectedSlots[0] && this.selectedSlots[0].slotName) ||
                                                  'full';
                console.log('🔧 Setting robust fallback eventDuration to:', frontendBookingData.eventDuration);
            }
            
            if (!frontendBookingData.foodMenuType || frontendBookingData.foodMenuType === null) {
                // Use multiple fallback sources
                frontendBookingData.foodMenuType = this.selectedFoodTypeSlug || 
                                                  (this.selectedFoodMenuTypes && this.selectedFoodMenuTypes.length > 0 
                                                    ? this.selectedFoodMenuTypes.join(', ')
                                                    : null) ||
                                                  'standard';
                console.log('🔧 Setting robust fallback foodMenuType to:', frontendBookingData.foodMenuType);
            }
            
            if (!frontendBookingData.foodMenuPlate || frontendBookingData.foodMenuPlate === null) {
                // Use guest count for a sensible default
                const guestCount = parseInt(this.selectedVenueCapacity?.toString() || '0');
                frontendBookingData.foodMenuPlate = guestCount <= 50 ? '1x1' : 
                                                   guestCount <= 150 ? '2x2' : '3x3';
                console.log('🔧 Setting robust fallback foodMenuPlate to:', frontendBookingData.foodMenuPlate, 'based on guestCount:', guestCount);
            }

            console.log('Booking data prepared:', JSON.stringify(frontendBookingData, null, 2));

            // Final validation to ensure critical fields are never null
            console.log('🔍 FINAL VALIDATION:');
            if (frontendBookingData.eventDuration === null || frontendBookingData.eventDuration === undefined) {
                frontendBookingData.eventDuration = 'full';
                console.log('🚨 FORCED eventDuration to:', frontendBookingData.eventDuration);
            }
            if (frontendBookingData.foodMenuType === null || frontendBookingData.foodMenuType === undefined) {
                frontendBookingData.foodMenuType = 'standard';
                console.log('🚨 FORCED foodMenuType to:', frontendBookingData.foodMenuType);
            }
            if (frontendBookingData.foodMenuPlate === null || frontendBookingData.foodMenuPlate === undefined) {
                frontendBookingData.foodMenuPlate = '2x2';
                console.log('🚨 FORCED foodMenuPlate to:', frontendBookingData.foodMenuPlate);
            }
            
            console.log('🔍 FINAL VALUES:');
            console.log('   eventDuration:', frontendBookingData.eventDuration);
            console.log('   foodMenuType:', frontendBookingData.foodMenuType);
            console.log('   foodMenuPlate:', frontendBookingData.foodMenuPlate);

            // Validate required fields before sending to API
            const requiredFields = ['venueId', 'userId', 'userName', 'userContact', 'userEmail'];
            const missingFields = requiredFields.filter(field => {
                const value = frontendBookingData[field];
                if (field === 'userName') {
                    return !value || value === '' || value === 'Unknown User' || value === 'undefined undefined';
                }
                return !value || value === '';
            });
            
            if (missingFields.length > 0) {
                console.error('❌ Missing required fields:', missingFields);
                console.error('❌ Current booking data:', frontendBookingData);
                console.error('❌ Available user sources:');
                console.error('   - fullUserDetails:', this.fullUserDetails);
                console.error('   - loggedInUser:', this.loggedInUser);
                console.error('   - userId:', this.userId);
                
                // Try to fix missing data if possible
                if (missingFields.includes('userId') && this.loggedInUser?.id) {
                    frontendBookingData.userId = this.loggedInUser.id;
                    console.log('🔧 Fixed userId from loggedInUser:', frontendBookingData.userId);
                }
                
                if (missingFields.includes('userContact')) {
                    const contact = this.loggedInUser?.mobileNumber || this.loggedInUser?.mobile || this.loggedInUser?.phone;
                    if (contact) {
                        frontendBookingData.userContact = contact;
                        console.log('🔧 Fixed userContact from loggedInUser:', frontendBookingData.userContact);
                    }
                }
                
                if (missingFields.includes('userEmail') && this.loggedInUser?.email) {
                    frontendBookingData.userEmail = this.loggedInUser.email;
                    console.log('🔧 Fixed userEmail from loggedInUser:', frontendBookingData.userEmail);
                }
                
                if (missingFields.includes('userName')) {
                    const name = this.loggedInUser?.name || this.loggedInUser?.firstName + ' ' + this.loggedInUser?.lastName || 'Guest User';
                    if (name && name !== 'undefined undefined') {
                        frontendBookingData.userName = name;
                        console.log('🔧 Fixed userName from loggedInUser:', frontendBookingData.userName);
                    }
                }
                
                // Recheck after fixes
                const stillMissingFields = requiredFields.filter(field => {
                    const value = frontendBookingData[field];
                    if (field === 'userName') {
                        return !value || value === '' || value === 'Unknown User' || value === 'undefined undefined';
                    }
                    return !value || value === '';
                });
                
                if (stillMissingFields.length > 0) {
                    throw new Error(`Still missing required fields after fix attempts: ${stillMissingFields.join(', ')}`);
                } else {
                    console.log('✅ Fixed all missing fields, proceeding with booking');
                }
            }

            // Create the booking using the booking service
            console.log('📡 Calling booking service createBookingFromFrontend API...');
            console.log('📡 FRONTEND -> BACKEND: Sending these exact values:');
            console.log('   📡 eventDuration:', frontendBookingData.eventDuration);
            console.log('   📡 foodMenuType:', frontendBookingData.foodMenuType);
            console.log('   📡 foodMenuPlate:', frontendBookingData.foodMenuPlate);
            console.log('📡 Full data being sent to backend:', JSON.stringify(frontendBookingData, null, 2));
            
            const response = await this.bookingService.createBookingFromFrontend(frontendBookingData).toPromise();
            
            console.log('📡 Booking service response:', response);
            
            if (response && response.success) {
                console.log('✅ Booking created successfully:', response.data);
                
                // Refresh booked dates to update calendar
                this.refreshBookedDates();
                
                // Optional: Track booking creation in analytics
                this.trackBookingAnalytics(response.data);
            } else {
                const errorMessage = response?.message || 'Failed to create booking';
                console.error('❌ Booking creation failed:', errorMessage);
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Error in createBookingRecord:', error);
            console.error('❌ Error details:', error.message);
            throw error; // Re-throw to be caught by the calling method
        }
    }

    /**
     * Format date for booking (DD/MM/YYYY format)
     */
    /**
     * Get event duration from selected slot
     */
    private getEventDurationFromSlot(): string {
        console.log('🔍 getEventDurationFromSlot() called');
        console.log('   selectedSlots:', this.selectedSlots);
        console.log('   selectedSlotsName:', this.selectedSlotsName);
        
        // First check if we have any slots selected
        if (!this.selectedSlots || this.selectedSlots.length === 0) {
            console.log('   No selectedSlots found, checking selectedSlotsName...');
            
            // Check selectedSlotsName as fallback
            if (this.selectedSlotsName) {
                const lowerSlotName = this.selectedSlotsName.toString().toLowerCase();
                console.log('   Using selectedSlotsName:', lowerSlotName);
                
                if (lowerSlotName.includes('morning')) return 'morning';
                if (lowerSlotName.includes('evening')) return 'evening';
                if (lowerSlotName.includes('night')) return 'night';
                if (lowerSlotName.includes('full')) return 'full';
                if (lowerSlotName.includes('afternoon')) return 'afternoon';
                if (lowerSlotName.includes('noon')) return 'afternoon';
                
                return lowerSlotName; // Return the slot name itself
            }
            
            return 'full'; // Default fallback - match backend enum
        }
        
        // Try to get slot name from selectedSlotsName first, then from selectedSlots object
        let slotName = this.selectedSlotsName;
        
        if (!slotName && this.selectedSlots[0]) {
            // Try different possible property names for slot name
            slotName = this.selectedSlots[0].slotName || 
                      this.selectedSlots[0].slot || 
                      this.selectedSlots[0].name ||
                      this.selectedSlots[0].slotId;
        }
        
        console.log('   Raw slot name found:', slotName);
        
        if (!slotName) {
            console.log('   No slot name found, returning default');
            return 'full'; // Default - match backend enum
        }
        
        const lowerSlotName = slotName.toString().toLowerCase();
        console.log('   Processed slot name (lowercase):', lowerSlotName);
        
        if (lowerSlotName.includes('morning')) return 'morning';
        if (lowerSlotName.includes('evening')) return 'evening';
        if (lowerSlotName.includes('night')) return 'night';
        if (lowerSlotName.includes('full')) return 'full'; // Match backend enum
        if (lowerSlotName.includes('afternoon')) return 'afternoon';
        if (lowerSlotName.includes('noon')) return 'afternoon';
        
        // Return the slot name itself if no pattern matches
        const result = lowerSlotName;
        console.log('   Final result:', result);
        return result;
    }

    /**
     * Get food menu type names as comma-separated string
     */
    private getFoodMenuTypeNames(): string {
        if (!this.selectedFoodMenuTypes || this.selectedFoodMenuTypes.length === 0) {
            console.log('🔍 getFoodMenuTypeNames: No selectedFoodMenuTypes, returning null');
            return null;
        }
        
        // If selectedFoodMenuTypes contains objects with name property
        if (typeof this.selectedFoodMenuTypes[0] === 'object') {
            const result = this.selectedFoodMenuTypes.map(item => item.name || item.slug).join(', ');
            console.log('🔍 getFoodMenuTypeNames: Object array result:', result);
            return result;
        }
        
        // If it's just an array of strings
        const result = this.selectedFoodMenuTypes.join(', ');
        console.log('🔍 getFoodMenuTypeNames: String array result:', result);
        return result;
    }

    /**
     * Get food menu plate type (1x1, 2x2, 3x3)
     */
    private getFoodMenuPlate(): string {
        console.log('🔍 getFoodMenuPlate: Starting with selectedFoodMenuType:', this.selectedFoodMenuType);
        console.log('🔍 getFoodMenuPlate: selectedFoodType:', this.selectedFoodType);
        console.log('🔍 getFoodMenuPlate: selectedFoodMenuTypes:', this.selectedFoodMenuTypes);
        
        // Check if selectedFoodMenuType has plate information
        if (this.selectedFoodMenuType && this.selectedFoodMenuType.plate) {
            console.log('🔍 getFoodMenuPlate: Found plate in selectedFoodMenuType:', this.selectedFoodMenuType.plate);
            return this.selectedFoodMenuType.plate;
        }
        
        // Check if selectedFoodType has plate information
        if (this.selectedFoodType && this.selectedFoodType.plate) {
            console.log('🔍 getFoodMenuPlate: Found plate in selectedFoodType:', this.selectedFoodType.plate);
            return this.selectedFoodType.plate;
        }
        
        // Try to extract from selected food menu types array
        if (this.selectedFoodMenuTypes && this.selectedFoodMenuTypes.length > 0) {
            const firstMenuType = this.selectedFoodMenuTypes[0];
            if (typeof firstMenuType === 'object' && firstMenuType.plate) {
                console.log('🔍 getFoodMenuPlate: Found plate in first selectedFoodMenuTypes object:', firstMenuType.plate);
                return firstMenuType.plate;
            }
            
            // Check if it's a string that contains plate info
            if (typeof firstMenuType === 'string') {
                if (firstMenuType.includes('1x1')) {
                    console.log('🔍 getFoodMenuPlate: Found 1x1 in string:', firstMenuType);
                    return '1x1';
                }
                if (firstMenuType.includes('2x2')) {
                    console.log('🔍 getFoodMenuPlate: Found 2x2 in string:', firstMenuType);
                    return '2x2';
                }
                if (firstMenuType.includes('3x3')) {
                    console.log('🔍 getFoodMenuPlate: Found 3x3 in string:', firstMenuType);
                    return '3x3';
                }
            }
        }
        
        // Default fallback based on guest count
        const guestCount = parseInt(this.selectedVenueCapacity?.toString() || '0');
        let result;
        if (guestCount <= 50) result = '1x1';
        else if (guestCount <= 150) result = '2x2';
        else result = '3x3';
        
        console.log('🔍 getFoodMenuPlate: Using fallback based on guestCount', guestCount, '-> result:', result);
        return result;
    }

    /**
     * Track booking creation in analytics (optional)
     */
    private trackBookingAnalytics(bookingData: any): void {
        try {
            // You can enhance this based on your analytics requirements
            console.log('Tracking booking analytics:', {
                venueId: this.venueDetails.id,
                bookingId: bookingData._id || bookingData.id,
                amount: this.totalVenuePrice,
                paymentType: this.paymentAmount
            });
            
            // Add any additional analytics tracking here if needed
        } catch (error) {
            console.error('Error tracking booking analytics:', error);
            // Don't throw here as this is optional functionality
        }
    }

    /**
     * Helper method to update booking analytics tracking fields
     * This can be used in the future to track different user actions
     * @param bookingId - ID of the booking to update
     * @param analyticsData - Object containing analytics fields to update
     */
    async updateBookingAnalytics(bookingId: string, analyticsData: {
        sendEnquiryClicked?: boolean;
        clickedOnReserved?: boolean;
        clickedOnBookNow?: boolean;
        madePayment?: boolean;
    }): Promise<void> {
        try {
            console.log('Updating booking analytics for booking:', bookingId, analyticsData);
            
            // Use the booking service to update tracking fields
            const response = await this.bookingService.updateBooking(bookingId, {
                details: analyticsData
            }).toPromise();
            
            if (response.success) {
                console.log('Booking analytics updated successfully');
            } else {
                console.error('Failed to update booking analytics:', response.message);
            }
        } catch (error) {
            console.error('Error updating booking analytics:', error);
        }
    }

    /**
     * Method to be called when user clicks "Send Enquiry"
     */
    trackEnquiryClick(): void {
        this.sendEnquiryClicked = true;
        console.log('📊 ANALYTICS: User clicked Send Enquiry, sendEnquiryClicked =', this.sendEnquiryClicked);
        
        // Send updated analytics immediately
        this.sendCurrentAnalytics();
    }

    /**
     * Method to be called when user clicks "Reserve"
     */
    trackReserveClick(): void {
        this.clickedOnReserved = true;
        console.log('📊 ANALYTICS: User clicked Reserve, clickedOnReserved =', this.clickedOnReserved);
        
        // Send updated analytics immediately
        this.sendCurrentAnalytics();
    }

    /**
     * Method to be called when user clicks "Book Now"
     */
    trackBookNowClick(): void {
        this.clickedOnBookNow = true;
        console.log('📊 ANALYTICS: User clicked Book Now, clickedOnBookNow =', this.clickedOnBookNow);
        
        // Send updated analytics immediately
        this.sendCurrentAnalytics();
    }


    ngOnDestroy(): void {
        console.log('VenueDetailsComponent destroying - saving analytics data');
        
        // Send final analytics data before destroying the component
        this.sendFinalAnalytics();

        // Existing cleanup logic
        if (this.enquiryTimer) {
            clearTimeout(this.enquiryTimer);
            console.log('🏢 VENUE: Timer cleared on destroy');
        }
        
        // Clean up analytics tracking
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            console.log('📊 ANALYTICS: Tracking interval cleared');
        }
        
        if (this.scrollThrottleTimer) {
            clearTimeout(this.scrollThrottleTimer);
            console.log('📊 ANALYTICS: Scroll throttle timer cleared');
        }
        
        // Remove beforeunload listener if it exists
        if (this.boundBeforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.boundBeforeUnloadHandler);
        }
        
        this.renderer.removeClass(document.body, 'body-dark');
    }

    /**
     * Refresh booked dates (can be called after a new booking is made)
     */
    refreshBookedDates() {
        console.log('[DEBUG] Refreshing booked dates...');
        this.loadVenueBookedDates();
    }

    /**
     * Helper method to format date for API calls (DD/MM/YYYY format)
     * Same format used in booking-analytics component
     */
    private formatDateForAPI(dateInput: Date | string): string {
        let date: Date;
        if (typeof dateInput === 'string') {
            date = new Date(dateInput);
        } else {
            date = dateInput;
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

}

