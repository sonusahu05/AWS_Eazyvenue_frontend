import { Component, OnInit } from '@angular/core';

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

  public listingblock;
  public loading: boolean = true;
  public bannerList: any[] = [];
  public bannerImageList: any[] = [];
  image :any;
  public venueList: any[] = [];
  public totalRecords: 0;
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
    this.filterCapacityArray = environment.capacity;
    this.productService.getVenue().then(products => {
      this.products = products;
    });
    this.eventPlannerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      eventdate: ['', [Validators.required]],
      mobileNumber: ['', Validators.required],
      capacity: ['', Validators.required],
    });
    this.getBannerList();
    //this.getVenueList();
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
        this.bannerList = data.data.items;
        this.totalRecords = data.data.totalCount;
        this.bannerList.forEach(element => {
          this.bannerImageList = element.banner_image;
          this.image = this.bannerImageList[0].banner_image_src;          
        });
      },
      err => {
        this.errorMessage = err.error.message;
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