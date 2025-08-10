import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// import data from '../../../assets/demo/data/navigation.json';
import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
// import listingblock from '../../../assets/demo/data/listing.json';
import { BannerService } from 'src/app/services/banner.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { VenueListComponent } from '../venue-list/venue-list.component';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CustomValidators } from 'ng2-validation';
import { EventPlannerService } from 'src/app/services/eventPlanner.service';
import { SsrStateService } from 'src/app/services/ssr-state.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [BannerService, MessageService]

})
export class HomeComponent implements OnInit {
  availableClasses: string[] = ["light", "normal-header"];
  currentClassIdx: number = 1;
  sidebarVisible4: boolean;
  bodyClass: string;
  val1: number;

  val2: number = 3;

  val3: number = 5;

  val4: number = 5;

  val5: number;

  msg: string;
  eventPlannerForm: FormGroup;

  products: Product[];
  showModalOffer:boolean=false
  carouselResponsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 12,
      numScroll: 12,
      margin: 20,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2,
      margin: 20,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];
appLoading = true;
  public listingblock;
  public loading: boolean = true;
  public bannerList: any[] = [];
  public bannerImageList: any[] = [];
  image :any;
  public venueList: any[] = [];
  public totalRecords: number = 0;
  public showEventPlannerDialog: boolean = false;
  public filterCapacityArray: any[] = [];
  public selectedCapacity;
  public submitted: boolean = false;
  public showCapacityError: boolean = false;
  errorMessage = '';
  constructor(
    private productService: ProductService,
    private BannerService: BannerService,
    private venueService: VenueService,
    private formBuilder: FormBuilder,
    private eventPlannerService: EventPlannerService,
    private messageService: MessageService,
    private ssrState: SsrStateService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.bodyClass = this.availableClasses[this.currentClassIdx];
    this.changeBodyClass();
  }

  changeBodyClass() {
    // Only manipulate DOM in browser environment
    if (!this.ssrState.isBrowser()) {
      return;
    }

    // get html body element
    const bodyElement = this.ssrState.getDocument()?.body;

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
    setTimeout(() => {
    this.appLoading = false;
  }, 1500);
    this.filterCapacityArray = environment.capacity;
    
    // Load basic data synchronously for SSR
    this.eventPlannerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      eventdate: ['', [Validators.required]],
      mobileNumber: ['', Validators.required],
      capacity: ['', Validators.required],
    });

    // Load async data
    this.loadAsyncData();
  }

  private loadAsyncData() {
    // Get resolved data from the route first
    const resolvedData = this.route.snapshot.data['homeData'];
    
    if (resolvedData && resolvedData.banners && resolvedData.banners.length > 0) {
      // Use resolved data
      this.bannerList = resolvedData.banners;
      this.totalRecords = resolvedData.banners.length;
      this.loading = false;
      
      // Process banner images
      this.bannerList.forEach(element => {
        if (element.banner_image && element.banner_image.length > 0) {
          this.bannerImageList = element.banner_image;
          this.image = this.bannerImageList[0].banner_image_src;
        }
      });
    } else {
      // Fallback: check if we have cached banner data from SSR
      const cachedBannerData = this.ssrState.getState<any>('bannerData');
      
      if (cachedBannerData) {
        // Use cached data
        this.bannerList = cachedBannerData.bannerList || [];
        this.bannerImageList = cachedBannerData.bannerImageList || [];
        this.image = cachedBannerData.image || null;
        this.totalRecords = cachedBannerData.totalRecords || 0;
        this.loading = false;
        
        // Clean up the cached state
        this.ssrState.removeState('bannerData');
      } else {
        // Load banner data fresh (fallback for browser navigation)
        this.getBannerList();
      }
    }

    this.ssrState.onBrowser(() => {
      // Only load heavy data in browser
      this.productService.getVenue().then(products => {
        this.products = products;
      });
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.eventPlannerForm.controls;
  }
  toggleCanvas() {

  }
  toggleSearch() {

  }

  getBannerList() {
    let query = "?filterByDisable=false&filterBySlug=hom_banner";
    this.BannerService.getbannerList(query).subscribe(
      data => {
        this.loading = false;
        if (data && data.data && data.data.items) {
          this.bannerList = data.data.items;
          this.totalRecords = data.data.totalCount;
          this.bannerList.forEach(element => {
            if (element.banner_image && element.banner_image.length > 0) {
              this.bannerImageList = element.banner_image;
              this.image = this.bannerImageList[0].banner_image_src;
            }
          });

          // Cache data for SSR transfer
          if (this.ssrState.isServer()) {
            this.ssrState.setState('bannerData', {
              bannerList: this.bannerList,
              bannerImageList: this.bannerImageList,
              image: this.image,
              totalRecords: this.totalRecords
            });
          }
        }
      },
      err => {
        this.loading = false;
        console.warn('Failed to load banner data:', err);
        // Set default values for SSR fallback
        this.bannerList = [];
        this.bannerImageList = [];
        this.image = null;
        if (err && err.error && err.error.message) {
          this.errorMessage = err.error.message;
        }
      });
  }
  // getVenueList() {
  //   let query = "?filterByDisable=false&filterByStatus=true";
  //   this.venueService.getVenueListWithoutAuth(query).subscribe(
  //     data => {
  //       //if (data.data.items.length > 0) {
  //       this.venueList = data.data.items;
  //       console.log('this.venueList', this.venueList);
  //       //}
  //     },
  //     err => {
  //       this.errorMessage = err.error.message;
  //     }
  //   );
  // }
  onClickLetsConnect() {
    this.showEventPlannerDialog = true;
  }
  onCapacitySelect(event) {
    this.selectedCapacity = event.value.value;
  }
  onSubmit(): void {
    this.submitted = true;
    //stop here if form is invalid
    if (this.eventPlannerForm.invalid) {
      return;
    }
    let eventPlannerData = this.eventPlannerForm.value;

    if (this.selectedCapacity == null) {
      this.showCapacityError = true;
      return;
    }
    eventPlannerData['guestcnt'] = this.selectedCapacity;
    console.log(eventPlannerData);
    this.eventPlannerService.addEventPlanner(eventPlannerData).subscribe(
      data => {
        this.messageService.add({ key: 'event_planer_msg', severity: 'success', summary: 'Successful', detail: 'Thank you to connecting us. Eazy venue event planner will connect with you', life: 3000 });
        this.eventPlannerForm.reset();
        this.showEventPlannerDialog = false;
      },
      ((err) => {
        this.showCapacityError = true;
        this.messageService.add({ key: 'event_planer_msg', severity: 'error', summary: err.error.error, detail: 'Server Error, Please try again.', life: 6000 });
      })
    );
  }
  close(){
    this.sidebarVisible4=false;
    console.log(this.sidebarVisible4);
  }
  onClickmodalopen(){
    this.showModalOffer=true
  }
}