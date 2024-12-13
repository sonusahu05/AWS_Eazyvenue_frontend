import { Component, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { FilterService, LazyLoadEvent, MessageService } from 'primeng/api';
import { CityService } from 'src/app/manage/city/service/city.service';
import { CategoryService } from 'src/app/services/category.service';
import { SlotService } from 'src/app/services/slot.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-vendor-filter-list',
  templateUrl: './vendor-filter-list.component.html',
  styleUrls: ['./vendor-filter-list.component.scss', '../venue-category-list/venue-category-list.component.css'],
  providers: [MessageService]
})
export class VendorFilterListComponent implements OnInit {

  selectedVendor: any
  selectedCategoriesNames: any[] = []
  public filterList: any[] = [];
  selectedSort: any;
  vendorPriceRangeValues: number[];
  rangeValues: number[];
  public slotList: any[] = [];
  public vendorTypesList: any[] = [];
  errorMessage;
  servicesArray: any[] = [];
  vendorCompareList: any[] = [];
  showCompareBar: boolean = false;
  carouselResponsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
      numScroll: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '560px',
      numVisible: 3,
      numScroll: 1
    }
  ];
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    }
  ];
  vendorList: any[] = [];
  finalVendorList: any[] = [];
  displayBasic: boolean = false;
  isVendorFilterDialogVisible: boolean = false;
  isVendorSearchDialogVisible: boolean = false;
  vendorCategoryList: any[] = [];
  isNavbarFixed: boolean = false;
  selectedVendorCategory: any = null;
  vendorCategory: any = null;
  //search location
  selectedLocationFilter: any[] = [];
  locationList: any[] = [];
  cityList: any[] = [];
  subareaList: any[] = [];
  filterCityIds: any;
  selectedSubareaData: any[];
  filterSubareaIds;
  selectedSubareaIds: any[] = [];
  selectedCities: any[] = [];

  //date filter
  minDateValue: Date;
  rangeDates: Date[] | undefined;
  startDate;
  endDate;

  //lazy loading
  rows = 10;
  pageNumber = 1;
  private lazyLoadEvent: LazyLoadEvent;

  //selection for services
  selectedServices:any[] = [];

  sortBy:string;
  currentTitle;
  currentDescription;
  minBudgetPrice:number = 0;
  maxBudgetPrice:number = 1;
  step: number= 1;

  //slot type
  selectedPropertyType:string = "";
  
  @ViewChild('searchCalendar', { static: true }) datePicker;
  @ViewChild('searchCalendarMobile', { static: true }) datePickerMobile;

  @HostListener('window:keyup.esc', ['$event']) w(e: KeyboardEvent) {
    this.displayBasic = false;
  }
  @HostListener('window:scroll', ['$event']) onScroll() {
    if (window.scrollY > 100) {
      this.isNavbarFixed = true;
    } else {
      this.isNavbarFixed = false;
    }
  }
  constructor(
    private filterService: FilterService,
    private slotService: SlotService,
    private categoryService: CategoryService,
    private router: Router,
    private messageService: MessageService,
    private subareaService: SubareaService,
    private cityService: CityService,
    private vendorService: VendorService,
    private route:ActivatedRoute,
    private meta: Meta,
    private title: Title,
    private renderer: Renderer2
  ) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.vendorCategory = this.router.getCurrentNavigation().extras.state;
      localStorage.setItem("vendor", JSON.stringify(this.vendorCategory))
      this.selectedVendorCategory = this.vendorCategory.name;
    } 
    // else {
    //   this.vendorCategory = localStorage.getItem("vendor") == undefined ? {name:"Photographer",slug:"photographer",selected:true} : JSON.parse(localStorage.getItem("vendor"));
    //   this.selectedVendorCategory = this.vendorCategory.name;
    // }
  }  

  ngOnInit(): void {
    const canonicalLink = this.renderer.createElement('link');
    this.renderer.setAttribute(canonicalLink, 'rel', 'canonical');
    this.renderer.setAttribute(canonicalLink, 'href', window.location.href); 
    this.renderer.appendChild(document.head, canonicalLink);
    this.minDateValue = new Date();
    this.selectedVendorCategory  = this.vendorCategory?.name
    this.getMinMaxBudget();
    // this.selectedCategoriesNames.push({ 'id': this.selectedVendorCategory.id, 'name': this.selectedVendorCategory.name, selected: true })
    this.filterList = [
      { name: 'Price (low to high)', value: 'price_low_high' },
      { name: 'Price (high to low)', value: 'price_high_low' },
      { name: 'Ratings', value: 'ratings' },
      { name: 'Popularity', value: 'popularity' },
      // { name: 'Distance', value: 'distance' }
    ];
    this.sortBy = this.filterList[0].value;

    this.vendorPriceRangeValues = [this.minBudgetPrice, this.maxBudgetPrice];
    this.rangeValues = [this.minBudgetPrice,this.maxBudgetPrice]
    this.getSlots();
    this.vendorTypesList = [
      { name: "Full Day", slug: "user-icon", selected: true, key: "fullDayPrice" },
      { name: "12 Hours", slug: "user-icon", selected: false, key: "hours12Price" },
      { name: "8 Hours", slug: "user-icon", selected: false, key: "hours8Price" },
      { name: "4 Hours", slug: "user-icon", selected: false, key: "hours4Price" }
    ]
    //slot type
    this.selectedPropertyType = this.vendorTypesList.find(type => type.selected)?.key;
    // this.servicesArray = [
    //   { key: "1", name: "Traditional" },
    //   { key: "2", name: "Candid" },
    //   { key: "3", name: "Cinematography" },
    //   { key: "4", name: "Drone Shoots" },
    //   { key: "5", name: "Photobooth" },
    //   { key: "6", name: "Live Screening" },
    // ]
    this.vendorCategoryList = [
      { name: "Photographer",slug:"photographer" },
      { name: "Decorater",slug:"decorater" },
      { name: "Caterer",slug:"caterer" },
      { name: "Videographer",slug:"videographer" },
      { name: "Mehendi Artist",slug:"mehendi-artist" },
      
    ]
    this.getServicesArray();
    this.getSubareas();
    this.getCities();

    this.route.params.subscribe(params =>{
      const category_slug = params['category'];
      const city_slug = params['city'];
      const subarea_slug = params['subarea'];

      if(!category_slug && !city_slug && !subarea_slug){
        this.currentTitle = "Explore The Top Vendors Near You - Eazyvenue.com";
        this.currentDescription = `Searching For the Best Vendors for your event? Here we have list of the best Vendors Find out Review, Portfolio, Ratings.`;
        this.title.setTitle(this.currentTitle)
        this.meta.addTag({ name: 'title', content: this.currentTitle });
        this.meta.addTag({ name: "description", content: this.currentDescription })
        this.meta.addTag({ name: "keywords", content: `vendors` })
        this.meta.addTag({ name: 'robots', content: 'index, follow' });

        const currentUrl = location.href;

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
                "name": "Explore The Top Vendors Near You - Eazyvenue.com",
                "position": "2"
              }

            ], "@type": "BreadcrumbList",
          "@context": "http://schema.org"
        }

        const itemListScript = document.createElement('script');
        itemListScript.type = 'application/ld+json';
        itemListScript.text = JSON.stringify(itemListSchema);
        document.body.appendChild(itemListScript);
        this.getVendorList(this.lazyLoadEvent, 'load')
      }else if(category_slug && !city_slug && !subarea_slug){
        this.selectedVendorCategory = this.capitalizeWords(category_slug);
        //this route is for SEO
        const cat = this.capitalizeWords(category_slug);
        this.currentTitle = "List of Best " + cat + " Vendors - Eazyvenue.com";
        this.currentDescription = `Searching For the Best ${cat} Vendors for your event? Here we have list of the best ${cat} Vendors Find out Review, Portfolio, Ratings.`;
        this.title.setTitle(this.currentTitle)
        this.meta.addTag({ name: 'title', content: this.currentTitle });
        this.meta.addTag({ name: "description", content: this.currentDescription })
        this.meta.addTag({ name: "keywords", content: `${cat} vendors` })
        this.meta.addTag({ name: 'robots', content: 'index, follow' });

        const currentUrl = location.href;

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
                "name": "Explore The Top Vendors Near You - Eazyvenue.com",
                "position": "2"
              },
              {
                "item": currentUrl,
                "@type": "ListItem",
                "name": this.currentTitle,
                "position": "3"
              }

            ], "@type": "BreadcrumbList",
          "@context": "http://schema.org"
        }

        const itemListScript = document.createElement('script');
        itemListScript.type = 'application/ld+json';
        itemListScript.text = JSON.stringify(itemListSchema);
        document.body.appendChild(itemListScript);
        this.getVendorList(this.lazyLoadEvent, 'load')
        
      }else if(category_slug && city_slug && !subarea_slug){
        this.selectedVendorCategory = this.capitalizeWords(category_slug);
        //this route is for SEO
        const cat = this.capitalizeWords(category_slug);
        const city = this.capitalizeWords(city_slug);

        this.vendorService.getCityByName(city).subscribe(cityRes =>{
          if(cityRes.data){
            // console.log(cityRes.data);
            this.selectedCities.push(cityRes.data.id)
            this.selectedLocationFilter = [cityRes.data]
            this.currentTitle = "List of Best "+cat +" Vendors in "+city + " - Eazyvenue.com";
            this.currentDescription = `Searching For the Best ${cat} Vendors in ${city} for your event? Here we have list of the best ${cat} Vendors in ${city} Find out Review, Portfolio, Ratings.`;
            this.title.setTitle(this.currentTitle)
            this.meta.addTag({ name: 'title', content: this.currentTitle});
            this.meta.addTag({name:"description",content: this.currentDescription})
            this.meta.addTag({name:"keywords",content:`${cat} vendors in ${city}`})
            this.meta.addTag({ name: 'robots', content: 'index, follow' });

            const currentUrl = location.href;
            let segments = currentUrl.split('/');
            segments.pop();
            let categoryUrl = segments.join("/");
            
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
                          "name": "Explore The Top Banquet Halls Near You - Eazyvenue.com",
                          "position": "2"
                      },
                      {
                          "item": categoryUrl,
                          "@type": "ListItem",
                          "name": "List of Best "+ cat +" Vendors - Eazyvenue.com",
                          "position": "3"
                      },
                      {
                          "item": currentUrl,
                          "@type": "ListItem",
                          "name": this.currentTitle,
                          "position": "4"
                      }

                  ], "@type": "BreadcrumbList",
                  "@context": "http://schema.org"
              }

          const itemListScript =  document.createElement('script');
          itemListScript.type = 'application/ld+json';
          itemListScript.text = JSON.stringify(itemListSchema);
          document.body.appendChild(itemListScript);
          this.getVendorList(this.lazyLoadEvent,'load')
          }else{
            //city not found
          }
        },err =>{
          console.log(err);
          
        })

      }else if(category_slug && city_slug && subarea_slug){
        if(category_slug === 'detail'){
          this.router.navigateByUrl("/vendor")
          return;
        }
        this.selectedVendorCategory = this.capitalizeWords(category_slug);
        //this route is for SEO
        const cat = this.capitalizeWords(category_slug);
        const city = this.capitalizeWords(city_slug);
        const sub = this.capitalizeWords(subarea_slug);
         
        this.vendorService.getCityByName(city).subscribe(cityRes =>{
          if(cityRes.data){
            // console.log(cityRes.data);
            this.selectedCities.push(cityRes.data.id)
            this.currentTitle = "List of Best "+cat +" Vendors in "+sub + ", "+city + " - Eazyvenue.com";
            this.currentDescription = `Searching For the Best ${cat} Vendors in ${sub}, ${city} for your event? Here we have list of the best ${cat} Vendors in ${sub}, ${city} Find out Review, Portfolio, Ratings.`;
            this.title.setTitle(this.currentTitle)
            this.meta.addTag({ name: 'title', content: this.currentTitle});
            this.meta.addTag({name:"description",content: this.currentDescription})
            this.meta.addTag({name:"keywords",content:`${cat} vendors in ${sub}, ${city}`})
            this.meta.addTag({ name: 'robots', content: 'index, follow' });

            const currentUrl = location.href;
            let segments = currentUrl.split('/');
            segments.pop();
            let cityUrl = segments.join("/");
            segments.pop();
            let categoryUrl = segments.join("/");
            
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
                          "name": "Explore The Top Banquet Halls Near You - Eazyvenue.com",
                          "position": "2"
                      },
                      {
                          "item": categoryUrl,
                          "@type": "ListItem",
                          "name": "List of Best "+ cat +" Vendors - Eazyvenue.com",
                          "position": "3"
                      },
                      {
                          "item": cityUrl,
                          "@type": "ListItem",
                          "name": "List of Best "+cat +" Vendors in "+city + " - Eazyvenue.com",
                          "position": "4"
                      },
                      {
                          "item": currentUrl,
                          "@type": "ListItem",
                          "name": this.currentTitle,
                          "position": "5"
                      }

                  ], "@type": "BreadcrumbList",
                  "@context": "http://schema.org"
              }

          const itemListScript =  document.createElement('script');
          itemListScript.type = 'application/ld+json';
          itemListScript.text = JSON.stringify(itemListSchema);
          document.body.appendChild(itemListScript);
            
            this.vendorService.getSubareaByName(sub).subscribe(subRes =>{
              if(subRes){
                // console.log(subRes.data);
                this.selectedSubareaIds.push(subRes.data.id)
                this.selectedLocationFilter = [cityRes.data,subRes.data]
                this.getVendorList(this.lazyLoadEvent,'load')
              }else{
                //sub area not found
                this.selectedLocationFilter = [cityRes.data]
              }
            }, err =>{
              console.log(err);    
            })
          }else{
            //city not found
          }
        },err =>{
          console.log(err);
          
        })

      }else{
        this.router.navigateByUrl('/vendor')
      }

    })

  }
  getMinMaxBudget(){
    const pricingQuery = "?category="+this.selectedVendorCategory;
    this.vendorService.getMinMaxPricingForVendor(pricingQuery).subscribe(res =>{
      // console.log(res);
      // this.rangeValues = [res.data[0].minVendorPrice,res.data[0].maxVendorPrice]
      this.minBudgetPrice = res.data[0].minVendorPrice;
      this.maxBudgetPrice = res.data[0].maxVendorPrice;
      this.rangeValues = [this.minBudgetPrice,this.maxBudgetPrice]
      // this.vendorPriceRangeValues = [res.data[0].minVendorPrice,res.data[0].minVendorPrice]
      this.vendorPriceRangeValues = [this.minBudgetPrice,this.maxBudgetPrice]

      if((this.maxBudgetPrice-this.minBudgetPrice) / 100 >= 100){
        this.step = 1000;
      }else{
        this.step = 100;
      }

    },err =>{
      console.log(err);
      
    })
  }
  onSortByChange(event){
    // console.log(event.value);
    if(event.value){
      this.sortBy = event.value.value;
    }
    this.vendorList = [];
    this.getVendorList(this.lazyLoadEvent,'sort')
  }
  capitalizeWords(str) {
    const formattedStr = str.replace(/\b\w/g, match => match.toUpperCase());
    return formattedStr.replace(/-/g, ' ');
  }
  getServicesArray(){
    this.vendorService.getVendorServices(this.vendorCategory?.name).subscribe(res =>{
      this.servicesArray = res.data
    },err => {
      console.log(err);
    })
  }
  onSelectServices(service, event){
    
    // console.log(event.checked);
    this.selectedServices = event.checked.map(o => o.name);
    //  if(event.checked){
    //     this.selectedServices.push(service);
    //  }else{
    //   this.selectedServices = this.selectedServices.filter(o => o.name !== service.name);
    //  }s
    //  console.log(this.selectedServices);
     this.getVendorList(this.lazyLoadEvent,"service")
         
  }
  selectedService;
  getSlots() {
    let query = "?filterByDisable=false&filterByStatus=true";
    this.slotService.getSlotListWithoutAuth(query).subscribe(
      data => {
        if (data.data.items.length > 0) {
          this.slotList = data.data.items;
        }
      },
      error => {

      }
    );
  }
  onScrollDown() {
    if(this.finalVendorList.length < 10){
      return;
    }
    this.pageNumber++;
    // this.direction = "down";
    this.getVendorList(this.lazyLoadEvent,"scroll");
  }
  onUnselectSearchLocationItem(event){
    // console.log(event);
    if(event.mode === 'city'){
      this.selectedCities.splice(event.id,1)
    }
    if(event.mode === 'subarea'){
      this.selectedSubareaIds.splice(event.id,1)
    }
    this.getVendorList(this.lazyLoadEvent,'clear-location')
  }
  onApplyBudgetClick(){
    this.getVendorList(this.lazyLoadEvent,"budget");
  }
  vendorBudgetInputChange(type,event){
    if (type === 'min') {
      this.rangeValues = [parseInt(event.target.value), this.rangeValues[1]];
    }
    if (type === 'max') {
      this.rangeValues = [this.rangeValues[0], parseInt(event.target.value)];
    }
  }
  getVendorList(event: LazyLoadEvent,mode:string) {
    console.log(event);
    
    if(event !== undefined){
      if (event.first != undefined && event.first == 0) {
        this.pageNumber = event.first + 1;
      } else if (event.first != undefined && event.first > 0) {
          this.pageNumber = (event.first / event.rows) + 1;
      } else {
          this.pageNumber = 1;
      }
      if (event.rows != undefined) {
          this.rows = event.rows;
      } else {
          this.rows = 10;
      }
    }
    if(mode === 'clear-location' || mode === 'budget' || mode === 'category' || mode === "service" || mode === "sort" || mode === "property"){
      this.vendorList = [];
      this.rows = 10;
      this.pageNumber = 1;
    }

    let queryForServices = "";
    this.selectedServices.forEach(element => {
      queryForServices += "&services="+element
    });

    let queryForCities = "";
    this.selectedCities.forEach(element =>{
      queryForCities += "&citycode="+element
    })
    let queryForSubareas = "";
    this.selectedSubareaIds.forEach(element =>{
      queryForSubareas += "&subareacode="+element
    })
    let queryForBudget = ""; 
    if(mode === 'budget' ||mode ===  "scroll"){
      if(this.minBudgetPrice != 0){
        queryForBudget += "&minBudget="+this.rangeValues[0]+"&maxBudget="+this.rangeValues[1];
      }
    }
    //vendor type or slot
    let propertyQuery = "";
    if(this.selectedPropertyType){
      propertyQuery += "&vendorType="+this.selectedPropertyType;
    }

    let sortQuery = "&sort="+this.sortBy;
    // console.log(sortQuery);
    
    this.vendorService.getVendorListUser(
      '?category='+this.selectedVendorCategory
      +'&pageSize='+this.rows
      +'&pageNumber='+this.pageNumber
      +queryForServices
      +queryForCities
      +queryForSubareas
      +sortQuery
      +queryForBudget
      +propertyQuery
      ).subscribe(data =>{
        // console.log(data);
      let tmpVendorList = data.data;
      this.finalVendorList = [...this.vendorList,...tmpVendorList];
      this.vendorList = this.finalVendorList;
      // console.log(this.vendorList);
      const localBusinessSchema = {
        "@context": "http://schema.org/",
        "@type": "LocalBusiness",
        "@id": location.href,
        "name": this.currentTitle,
        "description": this.currentDescription,
        "image": [
            this.finalVendorList[0].vendorImage[0]?.vendor_image_src //first image
        ],
        "address": {
            "@type": "PostalAddress",
            // "streetAddress": "Near thane,Mumbai, Maharashtra",
            "streetAddress": "Near "+this.finalVendorList[0].subArea+", "+this.finalVendorList[0].city+","+this.finalVendorList[0].state.name+"",
            // "addressLocality": "Near thane, Mumbai, Maharashtra",
            "addressLocality": "Near "+this.finalVendorList[0].subArea+", "+this.finalVendorList[0].city+","+this.finalVendorList[0].state.name+"",
            // "addressRegion": "Mumbai",
            "addressRegion": this.finalVendorList[0].city,
            // "postalCode": "400601",
            "postalCode": this.finalVendorList[0].zipcode ?? 400072,
            "addressCountry": "India"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": this.finalVendorList[0].googleRating,
            "reviewCount": "1206",
            "bestRating": "5",
            "worstRating": "1.2"
        },
        "priceRange": "Price starts from Rs."+this.finalVendorList[0].minVendorPrice+" to Rs."+this.finalVendorList[this.finalVendorList.length - 1].minVendorPrice,
        "telephone": "+91 93720 91300"
    }


    const localBusinessScript = document.createElement('script');
    localBusinessScript.type = 'application/ld+json';
    localBusinessScript.text = JSON.stringify(localBusinessSchema);
    document.body.appendChild(localBusinessScript);
      
    },err => {
      console.log(err);
    })
  }
  vendorCompareClick() {
    let path = "/compare-vendor?"
    if(this.vendorCompareList.length < 2){
      this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'Compare', detail: 'Please select one more vendor for compare.', life: 6000 });
      return;
    }
    for (let index = 0; index < this.vendorCompareList.length; index++) {
      const element = this.vendorCompareList[index];
      if(index == 0){
        path += "id="+element.id;
      }else{
        path += "&id"+index+"="+element.id;
      }
    }
    // console.log(path);
    this.router.navigateByUrl(path);
  }
  closeVendorFilterDialog() {
    this.isVendorFilterDialogVisible = false;
    this.onApplyBudgetClick();
  }
  clearDatesAndClose() {
    // this.rangeDates = null; // or reset to initial value
    this.datePicker.hideOverlay();
  }
  closeDatesMobileView(){
    this.datePickerMobile.hideOverlay();
  }
  onChangeListCompareCheckbox(vendor, event) {
    if(this.vendorCompareList.length !== 4){
      if (event) {
        if (event.checked) {
          this.vendorCompareList.push(vendor);
        } else {
          let vendorItem = this.vendorList.find(v => v.id === vendor.id);
          vendorItem.selectedStatus = false;
          this.vendorCompareList = this.vendorCompareList.filter((v) => v.id !== vendor.id);
        }
      }
      if (this.vendorCompareList.length > 0) {
        this.showCompareBar = true;
      } else {
        this.showCompareBar = false;
      }
    }else{
      //tell user to limit reached 
    }
  }

  clearVendorCompare() {
    this.vendorCompareList.forEach(element => {
      let vendorItem = this.vendorList.find(v => v.id === element.id);
      vendorItem.selectedStatus = false;
    });
    this.vendorCompareList = [];
    this.showCompareBar = false;
  }
  open(event) {
    // console.log(event)
    // this.activeIndex = 0;
    this.displayBasic = true;
    let venueData = '';
    // this.venueImages = [];
    // venueData = this.finalVenueList.find(x => x.id == event);
    // this.venueImages = venueData['venueImage'];

  }
  showVendorFilterDialog() {
    this.isVendorFilterDialogVisible = true;
  }
  showVendorSearchDialog() {
    this.isVendorSearchDialogVisible = true;
  }
  onClickClearAll() {
    //clear all filters values
  }
  onRemoveVendorCategoryChip(event){
    // console.log(event);
    this.selectedVendorCategory = undefined
    this.finalVendorList = [];
    this.pageNumber = 1; 
    this.getVendorList(this.lazyLoadEvent, 'category');
  }
  createSlug(input):string {
    return input.toLowerCase().replace(/ /g, '_');
  }
  onClickCategory(vendor) { 
    if (vendor !== null) {
      this.vendorCategory = {
        name: vendor.value,
        slug: this.createSlug(vendor.value)
      }
      this.selectedVendorCategory = vendor.value; 
      this.getServicesArray()
      this.getMinMaxBudget();
      this.finalVendorList = [];
      this.pageNumber = 1; 
      this.rows = 10;
      this.getVendorList(this.lazyLoadEvent, 'category');
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

  //on search location
  onLocationSearch(event) {
    // console.log(event);
    
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
  }
  onSelectLocationSearch(event) {
    // console.log(event);  
    
    if (event.mode == 'subarea') {
      this.selectedSubareaIds.push(event.id);
    }
    if (event.mode == 'city') {
      this.selectedCities.push(event.id);
    }
    this.vendorList = [];
    // this.pageNumber = 1;
    // this.getVendorList(this.lazyLoadEvent, this.mode);
    // this.getVendorList(this.lazyLoadEvent,"location");
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
    this.vendorList = [];
    // this.pageNumber = 1;
    // this.mode = "category";
    // this.getVendorList(this.lazyLoadEvent, this.mode);
    this.getVendorList(this.lazyLoadEvent,"reset");
  }
  getCities() {
    // let query = "?filterByDisable=false&filterByStatus=true";
    let query = "list=true";
    this.cityService.getcityList(query).subscribe(
      data => {
        this.cityList = data.data.items;
        if (this.cityList.length > 0) {
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

  //date filter
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
    this.vendorList = [];
    // this.pageNumber = 1;
    // this.getVendorList(this.lazyLoadEvent, this.mode);
    this.getVendorList(this.lazyLoadEvent,"date");
  }

  onClickClear() {
    this.rangeDates = null;
    // this.startDate = undefined;
    // this.endDate = undefined;
    // this.finalVenueList = [];
    // this.pageNumber = 1;
    // this.getVendorList(this.lazyLoadEvent, this.mode);
    this.getVendorList(this.lazyLoadEvent,"reset");
  }

  //search click
  onClickSearch() {
    let selectedCities = JSON.stringify(this.selectedCities);
    let selectedSubareaIds = JSON.stringify(this.selectedSubareaIds);
    if(this.selectedCities.length == 0 && this.selectedSubareaIds.length == 0){
      this.messageService.add({ key: 'toastMsg', severity: 'error', summary: 'error', detail: 'Please select area/Sub area.', life: 6000 });
      return;
    }
    //filter or get vendorList
    this.getVendorList(this.lazyLoadEvent,"search");

  }
  onClickPropertyType(property){
    this.vendorTypesList = this.vendorTypesList.map(o =>{
      if(o.key === property.key){
        this.selectedPropertyType = o.key;
        return{...o, selected: true}
      }else{
        return{...o, selected: false}
      }
    })
    this.getVendorList(this.lazyLoadEvent,"property");
  }
}
