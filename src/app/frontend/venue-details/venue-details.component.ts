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
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
declare var google: any;

declare var Razorpay;

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
    selectedReviewSource: string = 'eazyvenue';
  showReviewForm: boolean = false;
  showAllReviews: boolean = false;
  googleReviews: any[] = [];
  isLoadingGoogleReviews: boolean = false;
   expandedReviews: boolean[] = [];
   currentSlide: number = 0;
  reviewsPerSlide: number = 3;
  userPhotos: any[] = [];

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
            this.userId = this.loggedInUser.id;
        }
        if (this.isLoggedIn == true) {
            // this.loginRegisterModal = false;
            this.numberPopup = false;
        }
        if (this.isLoggedIn && this.loggedInUser?.id) {
            this.getUserDetails(this.loggedInUser.id);
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
    const reviews = this.selectedReviewSource === 'google' ? this.googleReviews : (this.venueDetails.reviews || []);
    return reviews;
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

  // Open photo modal (if you want to implement photo viewing)
  openPhotoModal(photo: any) {
    // Implement photo modal logic here
    console.log('Opening photo modal for:', photo);
  }

  // Enhanced getDisplayedReviews with better sorting
  getDisplayedReviews() {
    let reviews = [];

    if (this.selectedReviewSource === 'google') {
      reviews = this.googleReviews || [];
    } else {
      reviews = this.venueDetails.reviews || [];
    }

    // Sort reviews by rating (highest first) and then by date (newest first)
    reviews = reviews.sort((a, b) => {
      if (a.reviewrating !== b.reviewrating) {
        return b.reviewrating - a.reviewrating;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

  // Enhanced getCurrentRating with fallback logic
  getCurrentRating(): number {
    if (this.selectedReviewSource === 'google') {
      return this.venueDetails.googleRating || 0;
    } else {
      // If no EazyVenue reviews, show Google rating as fallback
      const eazyRating = this.venueDetails.eazyVenueRating || 0;
      const eazyReviewsCount = this.venueDetails.reviews?.length || 0;

      if (eazyReviewsCount === 0 && this.venueDetails.googleRating) {
        return this.venueDetails.googleRating;
      }

      return eazyRating;
    }
  }

  // Enhanced setInitialReviewSource with better logic
  setInitialReviewSource() {
    const eazyReviewsCount = this.venueDetails.reviews?.length || 0;
    const googleReviewsCount = this.googleReviews?.length || 0;

    if (eazyReviewsCount <= 2 && googleReviewsCount > 0) {
      this.selectedReviewSource = 'google';
    } else if (eazyReviewsCount > 0) {
      this.selectedReviewSource = 'eazyvenue';
    } else if (googleReviewsCount > 0) {
      this.selectedReviewSource = 'google';
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

  // Show success message (you can implement toast notifications)
  showSuccessMessage(message: string) {
    // Implement your success message display logic here
    alert(message); // Replace with proper toast notification
  }

  // Show error message
  showErrorMessage(message: string) {
    // Implement your error message display logic here
    alert(message); // Replace with proper toast notification
  }

  // Method to handle review card interactions
  onReviewCardClick(review: any, index: number) {
    // You can implement review detail modal or expand functionality
    console.log('Review card clicked:', review);
  }

  // Method to get review statistics for the selected source
  getReviewStatistics() {
    const reviews = this.selectedReviewSource === 'google' ? this.googleReviews : (this.venueDetails.reviews || []);

    const stats = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    reviews.forEach(review => {
      const rating = Math.floor(review.reviewrating);
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

//     setInitialReviewSource() {
//     const eazyReviewsCount = this.venueDetails.reviews?.length || 0;

//     if (eazyReviewsCount <= 2) {
//       // If EazyVenue has 2 or fewer reviews, show Google reviews by default
//       this.selectedReviewSource = 'google';
//     } else {
//       // If EazyVenue has more than 2 reviews, show EazyVenue reviews by default
//       this.selectedReviewSource = 'eazyvenue';
//     }
//   }

//   // Updated loadGoogleReviews method
//   loadGoogleReviews() {
//     if (!this.venueDetails.name || !this.venueDetails.cityname) {
//       console.log('Venue name or city not available for Google reviews');
//       return;
//     }

//     this.isLoadingGoogleReviews = true;
//     this.venueService.getGoogleReviews(this.venueDetails.name, this.venueDetails.cityname)
//       .subscribe(
//         (response) => {
//           console.log('Google reviews response:', response);
//           if (response.result && response.result.reviews) {
//             this.googleReviews = response.result.reviews.map(review => ({
//               ...review,
//               reviewtitle: this.generateReviewTitle(review.rating),
//               reviewdescription: review.text,
//               reviewrating: review.rating,
//               created_at: new Date(review.time * 1000).toISOString(),
//               author_name: review.author_name,
//               profile_photo_url: review.profile_photo_url
//             }));
//           }
//           this.isLoadingGoogleReviews = false;
//         },
//         (error) => {
//           console.error('Error loading Google reviews:', error);
//           this.isLoadingGoogleReviews = false;
//         }
//       );
//   }

//   // Helper method to generate review titles for Google reviews
//   generateReviewTitle(rating: number): string {
//     if (rating >= 4.5) return 'Excellent Experience';
//     if (rating >= 4) return 'Great Place';
//     if (rating >= 3.5) return 'Good Experience';
//     if (rating >= 3) return 'Average Experience';
//     return 'Below Average';
//   }

  // Toggle review source
  toggleReviewSource(source: string) {
    this.selectedReviewSource = source;
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

  // Submit new review
//   submitReview() {
//     if (!this.newReview.reviewtitle || !this.newReview.reviewrating || !this.newReview.reviewdescription) {
//       alert('Please fill all required fields');
//       return;
//     }

//     const reviewData = {
//       ...this.newReview,
//       venueId: this.venueDetails.id,
//       created_at: new Date().toISOString()
//     };

//     this.venueService.addReview(this.venueDetails.id, reviewData).subscribe(
//       (response) => {
//         console.log('Review submitted successfully:', response);
//         // Add the new review to the existing reviews
//         if (!this.venueDetails.reviews) {
//           this.venueDetails.reviews = [];
//         }
//         this.venueDetails.reviews.unshift(reviewData);

//         // Update the EazyVenue rating
//         this.updateEazyVenueRating();

//         // Reset form and close it
//         this.resetReviewForm();
//         this.showReviewForm = false;

//         // Switch to EazyVenue reviews to show the new review
//         this.selectedReviewSource = 'eazyvenue';

//         alert('Review submitted successfully!');
//       },
//       (error) => {
//         console.error('Error submitting review:', error);
//         alert('Error submitting review. Please try again.');
//       }
//     );
//   }

  // Update EazyVenue rating based on all reviews
  updateEazyVenueRating() {
    if (this.venueDetails.reviews && this.venueDetails.reviews.length > 0) {
      const totalRating = this.venueDetails.reviews.reduce((sum, review) => sum + review.reviewrating, 0);
      this.venueDetails.eazyVenueRating = Math.round((totalRating / this.venueDetails.reviews.length) * 10) / 10;
    }
  }

  // Get displayed reviews based on selected source
//   getDisplayedReviews() {
//     if (this.selectedReviewSource === 'google') {
//       return this.showAllReviews ? this.googleReviews : this.googleReviews.slice(0, 3);
//     } else {
//       const eazyReviews = this.venueDetails.reviews || [];
//       return this.showAllReviews ? eazyReviews : eazyReviews.slice(0, 3);
//     }
//   }

  // Get total reviews count for selected source
  getTotalReviewsCount(): number {
    if (this.selectedReviewSource === 'google') {
      return this.googleReviews.length;
    } else {
      return this.venueDetails.reviews?.length || 0;
    }
  }

  // Get rating for selected source
//   getCurrentRating(): number {
//     if (this.selectedReviewSource === 'google') {
//       return this.venueDetails.googleRating || 0;
//     } else {
//       return this.venueDetails.eazyVenueRating || 0;
//     }
//   }

//   // Get reviews count text
//   getReviewsCountText(): string {
//     const count = this.getTotalReviewsCount();
//     return count === 1 ? '1 Review' : `${count} Reviews`;
//   }

  // Check if should show "Show all reviews" button
  shouldShowAllReviewsButton(): boolean {
    const totalReviews = this.getTotalReviewsCount();
    return totalReviews > 3 && !this.showAllReviews;
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
     * Get current engagement data for analytics
     */
    private getEngagementData(): any {
        return {
            timeSpentSeconds: this.getTimeSpentSeconds(),
            scrollDepthPercent: this.maxScrollDepth,
            submittedEnquiry: this.hasCreatedEnquiry,
            qualityScore: this.calculateQualityScore()
        };
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
     * Manually trigger analytics tracking with current data (for testing or manual calls)
     */
    public sendCurrentAnalytics(): void {
        if (this.venueDetails) {
            console.log('📊 MANUAL: Sending current analytics data...');
            this.trackVenueClick(this.venueDetails);
        } else {
            console.warn('📊 MANUAL: Cannot send analytics - venue details not loaded');
        }
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
            userEmail: this.fullUserDetails.email || ''
        };

        console.log('📝 VENUE: Enquiry data prepared:', enquiryData);
        console.log('📝 VENUE: About to call API...');

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
            this.premiumDecor = true;                this.totalVenuePrice =
                Number(this.selectedVenueCapacity) *
                Number(this.selectedFoodMenuType.value);
        }
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
      }
  onClickEventDate(event) {
        this.selectedStartDate = this.rangeDates[0];
        this.selectedEndDate = this.rangeDates[1];
        let startDate = moment(this.selectedStartDate)
            .subtract(1, 'd')
            .format('YYYY-MM-DD');
        //let startDate = moment(this.selectedStartDate).format("YYYY-MM-DD");
        let endDate;
        if (this.selectedEndDate === null) {
            this.selectedEndDate = moment(this.selectedStartDate).format(
                'YYYY-MM-DD'
            );
            endDate = moment(this.selectedStartDate).format('YYYY-MM-DD');
            //endDate = moment(this.selectedStartDate).format("YYYY-MM-DD");
        } else {
            this.datePicker.overlayVisible = false;
            this.selectedEndDate = moment(this.rangeDates[1]).format(
                'YYYY-MM-DD'
            );
            endDate = moment(this.rangeDates[1]).format('YYYY-MM-DD');
            //endDate = moment(this.rangeDates[1]).format("YYYY-MM-DD");
        }
        this.selectedStartDate = moment(this.selectedStartDate)
            .local()
            .format('DD/MM/YYYY');
        this.selectedEndDate = moment(this.selectedEndDate)
            .local()
            .format('DD/MM/YYYY');
        this.selectedDate = moment(event).local().format('DD-MM-YYYY');
        let searchDate = moment(event).subtract(1, 'd').format('MM-DD-YYYY');
        // startDate = moment(this.rangeDates[0]).subtract(1, "d").format('MM-DD-YYYY');
        // endDate = moment(this.rangeDates[1]).subtract(1, "d").format('MM-DD-YYYY');

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
        this.isBookingenquerySummary = true;
        this.showVenueDetailFilter = false;
    }
    onClickBooking(mode) {
        
        // console.log(this.paymentAmount);
        // console.log(this.selectedDecor);

        let durationData = [
            {
                occasionStartDate: this.rangeDates[0],
                occasionEndDate: this.rangeDates[1],
                slotId: this.selectedSlots[0]?.slotId,
            },
        ];
        // console.log(this.orderType);

        // console.log(this.selectedOccasion);
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
        };
        console.log(venueOrderData);

        //send data to api and
        this.placeAnOrderOrEnquiry(venueOrderData);
    }
    placeAnOrderOrEnquiry(orderData) {
        this.venueOrderService.addVenueOrder(orderData).subscribe(
            (data) => {
                if (data && data.message === 'no profile') {
                    this.messageService.add({
                        key: 'toastMsg',
                        severity: 'error',
                        summary: 'Problem',
                        detail: 'Please complete your profile before inquiry or booking',
                        life: 5000,
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl(
                            '/my-profile?mode=' + data.mode
                        );
                    }, 3000);
                } else {
                    if (this.orderType == 'book_now') {
                        const options = {
                            // key: environment.razorPayKeyTest, //test key
                            key: environment.razorPayKeyLive, //Live key
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
                                // color: '#fff'
                            },
                            modal: {
                                ondismiss: () => {
                                    console.log('payment modal closed');
                                },
                            },
                        };
                        const rzp = new Razorpay(options);
                        rzp.open();
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
                console.log(err);

                this.messageService.add({
                    key: 'toastMsg',
                    severity: 'error',
                    summary: err.error.message,
                    detail: 'Venue order booked failed',
                    life: 6000,
                });
            }
        );
    }
    onRazorWindowClosed(response) {
        this.isBookingSummary = false;
        this.venueOrderService.handleVenuePayment(response).subscribe(
            (res: any) => {
                if (res.status === 'Success') {
                    this.messageService.add({
                        key: 'toastMsg',
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Venue order booked.',
                        life: 6000,
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('/my-profile?mode=bookings');
                    }, 1000);
                }
                if (res.status === 'pending') {
                    // payment pending show pending popup
                }
                if (res.status === 'failed') {
                    // payment failed tell to try again
                }
            },
            (err) => {
                console.log('Payment error:', err);
            }
        );
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

}

