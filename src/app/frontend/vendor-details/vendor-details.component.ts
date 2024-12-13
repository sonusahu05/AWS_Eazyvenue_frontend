import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { CityService } from 'src/app/manage/city/service/city.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { RazorpayService } from 'src/app/services/razorpay.service';
import { SlotService } from 'src/app/services/slot.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { VendorService } from 'src/app/services/vendor.service';
import { environment } from 'src/environments/environment';

declare var Razorpay;

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.scss', '../venue-details/venue-details.component.scss'],
  providers: [MessageService]
})
export class VendorDetailsComponent implements OnInit {

  // Top Filters
  //vendor types
  vendorCategoryList: any[] = [];
  selectedVendorCategory: any = null;
  //location
  selectedLocationFilter: any[];
  cityList: any[] = [];
  filterCityIds: any;
  selectedSubareaData: any[];
  subareaList: any[] = [];
  filterSubareaIds;
  errorMessage;
  locationList: any[] = [];
  selectedSubareaIds: any[] = [];
  selectedCities: any[] = [];

  //date filter
  minDateValue: Date;
  rangeDates: Date[] | undefined;
  startDate;
  endDate;


  //details
  vendorDetails: any;
  showAvailabilityMessage: any;
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  checked: boolean = true;
  public slotList: any[] = [];;
  selectedVendorServices: any[] = [];
  selectedStartDate: any;
  selectedEndDate: any;
  selectedSlotsName: any;
  selectedSlot:any;

  vendorId;
  vendorName;
  vendorMetaName;
  categoryName;

  totalAmount:number = 0;

  selectedDecorationService:any;
  selectedDecorationServiceId:any;
  selectedDecorationServiceName:any;
  selectedDecorationServiceSlug:any;

  decorationServicesTypes:any[] = [];
  selectedDecorationServicesTypes:any;
  showDecorationServicesList: boolean = false;

  categoryHeader:string;

  isBookingFilter: boolean = false;
  categoryMenuList: any[]
  occasionResponsiveOptions;
  selectedOccasion;

  loggedInUser;
  userToken;

  isPaymentSuccess:boolean = false;


  @ViewChild('searchCalendar', { static: true }) datePicker;


  constructor(
    private messageService: MessageService,
    private subareaService: SubareaService,
    private cityService: CityService,
    private slotService: SlotService,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    private renderer: Renderer2,
    private router: Router,
    private venueService: VenueService,
    private tokenStorageService: TokenStorageService,
    private razorpayService: RazorpayService
  ) {
    this.occasionResponsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 4,
        numScroll: 4
    },
    {
        breakpoint: '768px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '560px',
        numVisible: 3,
        numScroll: 3
    }
    ]
  }

  ngOnInit(): void {
    const canonicalLink = this.renderer.createElement('link');
    this.renderer.setAttribute(canonicalLink, 'rel', 'canonical');
    this.renderer.setAttribute(canonicalLink, 'href', window.location.href);
    this.renderer.appendChild(document.head, canonicalLink);

    this.minDateValue = new Date();
    this.vendorCategoryList = [
      {id:"photographer" ,name: "Photographer" },
      {id:"caterer" ,name: "Caterer" },
      {id:"decorater" ,name: "Decorater" },
      {id:"event-management" ,name: "Event Management" },
      {id:"makup-artist" ,name: "Makup Artist" },
    ]
    this.checkLogin();
    this.getCities();
    this.getSubareas();
    this.getSlots();
    this.getCategoryListNew();
    this.route.queryParams.subscribe(params => {
      if (params['slot']) {
        this.slotList.find(type => type.key === params['slot']);
        this.selectedSlot = this.slotList.find(type => type.key === params['slot']);
      } else {
        this.selectedSlot = this.slotList[0]
      }
    })

    this.route.paramMap.subscribe(params => {

      this.vendorMetaName = params.get('metaurl');
      this.selectedVendorCategory = params.get('category');

      this.categoryName = this.vendorCategoryList.find(o => o.id === this.selectedVendorCategory)?.name;
      if(this.categoryName === 'Decorater'){
        this.categoryHeader = 'Decoration'
      }
      if(this.categoryName === 'Photographer'){
        this.categoryHeader = 'Photography'
      }
      const query = "&slot="+this.selectedSlot.key;
      this.getVendorData(query)
    });
  }
  checkLogin(){
    this.loggedInUser = this.tokenStorageService.getUser();
    this.userToken = this.tokenStorageService.getToken();
  }
  getVendorData(query) {
    this.vendorService.getVendorByMetaUrl(this.vendorMetaName, query).subscribe(res => {
      // console.log(res);
      if (res) {
        this.vendorDetails = res.data[0];
        console.log(this.vendorDetails);

        // this.title.setTitle(res.data[0].name + " - "+res.data[0].categories[0].name+" - Eazyvenue.com")
        this.title.setTitle(res.data[0].name + " - " + "Eazyvenue.com");
        this.meta.addTag({ name: "title", content: res.data[0].name + " - " + "Eazyvenue.com" })
        this.meta.addTag({ name: "description", content: res.data[0].metaDescription })
        this.meta.addTag({ name: "keywords", content: res.data[0].metaKeywords })
        this.meta.addTag({ name: 'robots', content: 'index, follow' });


        const localBusinessSchema = {
          "@context": "http://schema.org/",
          "@type": "LocalBusiness",
          "@id": location.href,
          "name": res.data[0].name + " - " + "Eazyvenue.com",
          "description": res.data[0].metaDescription,
          "image": [
            res.data[0].vendorImage[0]?.vendor_image_src
          ],
          "address": {
            "@type": "PostalAddress",
            // "streetAddress": "Near thane,Mumbai, Maharashtra",
            "streetAddress": "Near " + res.data[0].subarea.name + ", " + res.data[0].city.name + "," + res.data[0].state.name + "",
            // "addressLocality": "Near thane, Mumbai, Maharashtra",
            "addressLocality": "Near " + res.data[0].subarea.name + ", " + res.data[0].city.name + "," + res.data[0].state.name + "",
            // "addressRegion": "Mumbai",
            "addressRegion": res.data[0].city.name,
            // "postalCode": "400601",
            "postalCode": res.data[0].zipcode ?? 400072,
            "addressCountry": "India"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": res.data[0].googleRating,
            "reviewCount": "1206",
            "bestRating": "5",
            "worstRating": "1.2"
          },
          "priceRange": "Price starts from Rs." + res.data[0].services[0].actualPrice + " to Rs." + res.data[0].services[res.data[0].services.length - 1].actualPrice,
          "telephone": "+91 93720 91300"
        }


        const localBusinessScript = document.createElement('script');
        localBusinessScript.type = 'application/ld+json';
        localBusinessScript.text = JSON.stringify(localBusinessSchema);
        document.body.appendChild(localBusinessScript);

        const itemListSchema = {
          "itemListElement":
            [
              {
                "item": "https://eazyvenue.com/",
                "@type": "ListItem",
                "name": "Home",
                "position": "1"
              },
              {
                "item": "https://eazyvenue.com/vendor/",
                "@type": "ListItem",
                "name": "Vendors",
                "position": "2"
              }, {
                "item": location.href,
                "@type": "ListItem",
                "name": res.data[0].name + " - " + "Eazyvenue.com",
                "position": "3"
              }], "@type": "BreadcrumbList",
          "@context": "http://schema.org"
        }

        const itemListScript = document.createElement('script');
        itemListScript.type = 'application/ld+json';
        itemListScript.text = JSON.stringify(itemListSchema);
        document.body.appendChild(itemListScript);
      }
    }, (error) => {

    })
  }
  onClickCategory(vendor) {
    // console.log(vendor);
    // console.log(this.selectedVendorCategory);

    if (vendor !== null) {
      this.selectedVendorCategory = vendor
      //     this.selectedOccasion = category;
      //     if (category.selected == true) {
      //         this.selectedCategories = [];
      //         this.selectedCategoriesNames = [];
      //         let index = this.findIndexById(category.id, this.categoryMenuList);
      //         if (index != -1) {
      //             this.categoryMenuList[index].selected = false;
      //             // let selectedIndex = this.findSelectedIndexById(category.id, this.selectedCategories);
      //             // if (selectedIndex != -1) {
      //             //     this.selectedCategories.splice(selectedIndex, 1);
      //             // }
      //             // let selectedNameIndex = this.findIndexById(category.id, this.selectedCategoriesNames);
      //             // if (selectedNameIndex != -1) {
      //             //     this.selectedCategoriesNames.splice(selectedNameIndex, 1);
      //             // }
      //         }
      //     } else {
      //         let index = this.findIndexById(category.id, this.categoryMenuList);
      //         if (index != -1) {
      //             this.categoryMenuList[index].selected = true;
      //             //let selectedIndex = this.findSelectedIndexById(category.id, this.selectedCategories);
      //             this.selectedCategories = category.id;
      //             this.selectedCategoriesNames = [{ 'id': category.id, 'name': category.name, selected: true }];
      //         }
      //     }
      // } else {
      //     this.selectedOccasion = undefined;
      //     this.selectedCategories = [];
      //     this.selectedCategoriesNames = [];
      // }
      // if (this.selectedCategories == undefined) {
      //     this.selectedCategories = [];
      // }
      // this.finalVenueList = [];
      // this.pageNumber = 1;
      // this.mode = "category";
      // this.getVenueList(this.lazyLoadEvent, this.mode);
    }
  }
  getCities() {
    let query = "?filterByDisable=false&filterByStatus=true";
    this.cityService.getcityList(query).subscribe(
      data => {
        this.cityList = data.data.items;
        if (this.cityList.length > 0) {
          this.selectedLocationFilter = [];
          this.cityList.forEach(element => {
            if (this.filterCityIds !== undefined) {
              if (this.filterCityIds.length > 0) {
                this.filterCityIds.forEach(cElement => {
                  element.mode = 'city';
                  if (cElement === element.id) {
                    if (this.selectedLocationFilter == undefined) {
                      this.selectedLocationFilter = [element];
                    } else {
                      this.selectedLocationFilter.push(element);
                    }
                  }
                });
              }
            }
          })
          this.selectedSubareaData.forEach(sElement => {
            sElement.mode = 'subarea';
            this.selectedLocationFilter.push(sElement);
          });

        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  getSubareas() {
    let query = "?filterByDisable=false&filterByStatus=true";
    this.subareaService.getSubareaList(query).subscribe(
      data => {
        this.subareaList = data.data.items;
        this.selectedSubareaData = [];
        this.subareaList.forEach(element => {
          if (this.filterSubareaIds != undefined) {
            if (this.filterSubareaIds.length > 0) {
              this.filterSubareaIds.forEach(sElement => {
                if (sElement === element.id) {
                  this.selectedSubareaData.push(element);
                  if (this.selectedLocationFilter === undefined) {
                    this.selectedLocationFilter = [element];
                  } else {
                    this.selectedLocationFilter.push(element);
                  }
                }
              });
            }
          }
        });
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }
  //on search location
  onLocationSearch(event) {
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
    this.locationList = filtered;
  } onSelectLocationSearch(event) {
    if (event.mode == 'subarea') {
      this.selectedSubareaIds.push(event.id);
    }
    if (event.mode == 'city') {
      this.selectedCities.push(event.id);
    }
    // this.vendorList = [];

    // this.getVendorList();
  }
  onClearResetAllData(event) {
    if (event.mode === 'subarea') {
      let index = this.findItemIndexById(event.id, this.selectedSubareaIds);
      let filterSubareaIdsIndex = this.findItemIndexById(event.id, this.filterSubareaIds);
      let selectedSubareaIndex = this.findItemIndexById(event.id, this.selectedSubareaData);
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
      let index = this.findItemIndexById(event.id, this.selectedCities);
      let filterCityIndex = this.findItemIndexById(event.id, this.filterCityIds);
      if (index !== -1) {
        this.selectedCities.splice(index, 1);
      }
      if (filterCityIndex !== -1) {
        this.selectedCities.splice(filterCityIndex, 1);
      }
    }
    // this.vendorList = [];

    // this.getVendorList(this.lazyLoadEvent, this.mode);
    // this.getVendorList();
  }
  findItemIndexById(id, arrayName) {
    let index = -1;
    for (let i = 0; i < arrayName.length; i++) {
      if (arrayName[i] === id) {
        index = i;
        break;
      }
    }
    return index;
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
    // this.vendorList = [];
    // this.pageNumber = 1;
    // this.getVendorList(this.lazyLoadEvent, this.mode);
    // this.getVendorList();
  }

  //search click
  onClickSearch() {
    let selectedCities = JSON.stringify(this.selectedCities);
    let selectedSubareaIds = JSON.stringify(this.selectedSubareaIds);
    //filter or get vendorList
    // this.getVendorList();

  }
  onVendorBookingFilter() {
    // console.log(this.loggedInUser); //logged in user
    // console.log(this.userToken); //auth token

    if(this.userToken){
      console.log('user');
      this.isBookingFilter = !this.isBookingFilter;
    }else{
      this.messageService.add(
        {
          key: 'toastmsg',
          severity: 'error',
          summary: 'Error',
          detail: 'Please Provide Login',
          life: 3000
        }
      );
      return;
    }
  }
  showVendorDetailsFilter() {

  }
  getCategoryListNew() {
    this.venueService.getOccastionCategoryList().subscribe(
      data => {
        this.categoryMenuList = data.data.filter(o => o.name !== "Couple Dates")
        this.categoryMenuList = this.categoryMenuList.map(o => ({ ...o, selected: false }));
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }
  onClickOccasion(occasion) {
    this.categoryMenuList = this.categoryMenuList.map(o =>
      o === occasion ? { ...o, selected: true } : { ...o, selected: false }
    );
    this.selectedOccasion = occasion;
  }

  getSlots() {
    this.slotList= [
      { name: "Full Day", slug: "user-icon", selected: true, key: "fullDayPrice" },
      { name: "12 Hours", slug: "user-icon", selected: false, key: "hours12Price" },
      { name: "8 Hours", slug: "user-icon", selected: false, key: "hours8Price" },
      { name: "4 Hours", slug: "user-icon", selected: false, key: "hours4Price" }
    ]
  }
  onSlotClick(slot) {
    console.log(slot);
    this.selectedSlot = slot;
    const query = "&slot="+this.selectedSlot.key;
    this.totalAmount = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { slot: this.selectedSlot.key },
      queryParamsHandling: 'merge',
    });
    this.getVendorData(query)
  }
  onVendorServiceClick(vendorService, event) {
    const targetService = this.vendorDetails.services.find(s => s.name === vendorService.name);

    if (event.checked === true) {
      this.selectedVendorServices.push(vendorService);
      this.totalAmount += parseInt(vendorService.price.match(/\d+/)[0], 10);

      if (targetService) {
        targetService.selected = true;
      }
    } else {
      this.selectedVendorServices = this.selectedVendorServices.filter(o => o.name !== vendorService.name);
      this.totalAmount -= parseInt(vendorService.price.match(/\d+/)[0], 10);

      if (targetService) {
        targetService.selected = false;
      }
    }
    console.log(this.selectedVendorServices);
  }

  onClickDecorationService(decorationService){
    // console.log(decorationService);
    this.selectedVendorServices = []
    this.selectedVendorServices.push(decorationService);
    this.selectedDecorationService = decorationService;
    // this.selectedDecorationServiceId = decorationService.id;
    // this.selectedDecorationServiceName = decorationService.name;
    // this.selectedDecorationServiceSlug = decorationService.slug;
    let decorationServiceArray = this.vendorDetails.otherServices[decorationService.slug];
    this.decorationServicesTypes = [];

    decorationServiceArray.forEach(element => {
        if(element.value != '0'){
          element['selected'] = false;
          this.decorationServicesTypes.push(element)
        }
    });
    // console.log(this.decorationServicesTypes);

    this.showDecorationServicesList = true;

  }

  onClickDecorationServiceType(decorationServiceType, event){
    // console.log(decorationServiceType);
    // console.log(event);
    this.selectedDecorationServicesTypes = decorationServiceType;
  }

  onClickSendEnquiries(pmode){
    console.log(this.loggedInUser); //logged in user
    if(!this.userToken){
      this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please Provide Login', life: 3000 });
      return;
    }
    //validate fields
    console.log(this.selectedOccasion);

    if(!this.selectedOccasion){
      this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select an occasion', life: 3000 });
      return;
    }
    if(!this.startDate && !this.endDate){
      this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select occasion dates', life: 3000 });
      return;
    }
    if(!this.selectedSlot){
      this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select slot', life: 3000 });
      return;
    }
    //check selected vendor services
    const vendorServices = this.vendorDetails.services.filter(o => o.selected === true);
    if(vendorServices.length === 0){
      this.messageService.add({ key: 'toastmsg', severity: 'error', summary: 'Error', detail: 'Please select services', life: 3000 });
      return;
    }

    //call razorpayservice.createOrder and get resoponse from our database
    const data = {
      vendorId: this.vendorDetails.id,
      vendorCategoryId: this.vendorDetails.categories[0].id,
      orderType: 'order',
      occasionId: this.selectedOccasion.id,
      duration:{
        occasionStartDate: this.startDate,
        occasionEndDate: this.endDate
      },
      timeSlot:{
        name: this.selectedSlot.name,
        slug: this.selectedSlot.key
      },
      services: vendorServices.map(o => ({
        name: o.name,
        price: parseInt(o.price.match(/\d+/)[0]),
      })),
      coupon: "",
      amount: 500000,
      totalAmount: this.totalAmount,
    };

    this.razorpayService.createVendorOrder(data).subscribe((res:any) =>{
      //order saved now open razor pay window
      const options = {
        // key: environment.razorPayKeyTest, //test key
        // key: environment.razorPayKeyLive, //Live key
        amount: res.amount,
        currency: res.currency,
        order_id: res.order_id,
        name: res.name,
        description: res.description,
        image: res.image,
        handler: (response: any) => {
         this.onRazorWindowClosed(response)
        },
        prefill: res.prefill,
        theme: {
          color: '#eb3438'
          // color: '#fff'
        },
        modal:{
          ondismiss: () =>{
            console.log('payment modal closed');

          }
        }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    }, (err) => {
      //issue while creating vendor order
      console.log(err);

    })

  }

  onRazorWindowClosed(response:any){
    this.isBookingFilter = false;
    this.razorpayService.handleVendorPayment(response).subscribe((res:any) =>{
      console.log(res);

      if(res.status === "Success"){
        this.isPaymentSuccess = true;
        //payment recieved success show success popup and redirect to orders/profile
      }
      if(res.status === "pending"){
        //payment pending show pending popup
      }
      if(res.status === "failed"){
        //payment failed tell to try again
      }
    },err =>{

    })
  }
  onCheckAnotherVendor() {
    this.router.navigateByUrl('/vendor')
  }
  onGoToMyBookings() {
    this.router.navigateByUrl('//my-profile?mode=bookings')
  }
}

