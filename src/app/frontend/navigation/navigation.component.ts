import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../demo/service/productservice';
import { Product } from '../../demo/domain/product';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { SelectItemGroup } from 'primeng/api';
import { CategoryService } from 'src/app/services/category.service';
import { CountryService } from "../../demo/service/countryservice";
import { CommonService } from 'src/app/services/common.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface City {
    name: string,
    code: string
}
@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    providers: [MessageService, CountryService]
})
export class NavigationComponent implements OnInit {
    showoccasionerror = false;
    showvenuecityerror = false;
    venuecityname: any;
    public otp: string;
    numberPopup: boolean = false;
    mobileForm: FormGroup;
    submitted: boolean = false;
    mobilenumber: any;
    otpPopup: boolean = false;
    selectedCountries: any[];
    filteration: any[];
    occassion: any;
    categoryiid: any;
    public cities: City[];
    public selectedCity1: City;
    public selectedCity2: City;
    public selectedCity3: string;
    public selectedCountry: string;
    public countries: any[];
    public groupedCities: SelectItemGroup[];
    public items: SelectItem[];
    public item: string;
    public date12: Date;
    public date13: Date;
    public rangeDates?: Date;
    public es: any;
    public invalidDates: Array<Date>
    public products: Product[];
    public menuFilter: Product[];
    public selectedProduct: Product;
    public categoryMenuList: any[] = [];
    public parentCategoryId;
    public errorMessage;
    public parentCategoryDetails;
    public filterCapacityArray: any[] = [];
    public venueCapacity;
    public selectedVenueCapacity;
    public selectedGuestName;
    statecode = '4008';
    subarealist: any;
    assuredVenueList: any;
    venuecapacity: any;
    scheduleOption: any;
    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 8,
            numScroll: 8
        },
        {
            breakpoint: '768px',
            numVisible: 6,
            numScroll: 6
        },
        {
            breakpoint: '600px',
            numVisible: 4,
            numScroll: 4
        }
    ];
    showOtpErrors: boolean = false;
    @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
    public config = {
        allowNumbersOnly: true,
        length: 4,
        isPasswordInput: false,
        disableAutoFocus: false,
        required: true,
        placeholder: '',
        inputStyles: {
            'width': '50px',
            'height': '50px'
        }
    };
    // public navigation = data;
    public filteredCountries: any[] = [];
    constructor(private productService: ProductService, 
        private categoryService: CategoryService, 
        private countryService: CountryService, 
        private subareaService: SubareaService, 
        private venueService: VenueService, 
        private form: FormBuilder, 
        private router: Router) { }

    ngOnInit() {
        // this.getSubareas();
        // this.getAssuredVenueList();
        // this.categoryService._categoryid.subscribe(cid => {
        //     if (cid != null) {
        //         this.categoryiid = cid;
        //         this.getCategoryid();
        //     }
        // })
        // this.getCategoryBySlug();
        this.getCategoryListNew();
        this.countryService.getCountries().then(countries => {
            this.countries = countries;
        });
        this.items = [];
        for (let i = 0; i < 10000; i++) {
            this.items.push({ label: 'Item ' + i, value: 'Item ' + i });
        }

        this.groupedCities = [
            {
                label: 'India', value: 'ing',
                items: [
                    { label: 'Mumbai', value: 'Mumbai' },
                    { label: 'Delhi', value: 'Delhi' },
                    { label: 'Bangalore', value: 'Bangalore' },
                    { label: 'Hyderabad', value: 'Hyderabad' }
                ]
            }
        ];
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
                'id': 5, 'label': ">500", condition: 'gte', value: 500, status: false
            },
        ]
        this.productService.navigationMenu().then(menu => {
            this.menuFilter = menu;
        });
        this.productService.getProductsSmall().then(products => this.products = products);
        this.mobileForm = this.form.group({
            mobileNumber: ['', [Validators.required, Validators.pattern("[0-9]{10}")]]

        })

    }
    get h() {
        return this.mobileForm.controls;
    }
    onSubmitNumber() {
        this.submitted = true;
        if (this.mobileForm.invalid) {
            return;
        }
        this.mobilenumber = this.mobileForm.value;
        this.otpPopup = true;
        this.mobileForm.reset();
        this.submitted = false;
        this.numberPopup = false;
    }
    onOtpChange(otp) {
        this.otp = otp;
    }
    otpSubmit() {
        if (this.otp == undefined || this.otp.length < 4) {
            this.showOtpErrors = true;
            return;
        }
        if (this.otp === '4321' && this.mobilenumber) {
            this.otpPopup = false;
            this.router.navigate(['/venue']);
        }

    }
    resendOtp() {
    }
    changeMobileNumber() {
        this.numberPopup = true;
        this.otpPopup = false
    }

    // getAssuredVenueList() {
    //     let query = "filterByDisable=false&filterByStatus=true&filterByAssured=true";
    //     // &filterByCategory=" + this.selectedCategoryId;
    //     this.venueService.getVenueListWithoutAuth(query).subscribe(
    //         data => {
    //             //if (data.data.items.length > 0) {
    //             this.assuredVenueList = data.data.items;

    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );

    // }
    // getSubareas() {
    //     var query = "?filterByDisable=false&filterByStatus=true";

    //     this.subareaService.getSubareaList(query).subscribe(
    //         data => {
    //             this.subarealist = data.data.items;
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
    // filterCity(event) {
    //     //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    //     let filtered: any[] = [];
    //     let query = event.query;
    //     for (let i = 0; i < this.subarealist.length; i++) {
    //         let city = this.subarealist[i];
    //         if (city.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //             filtered.push(city);
    //         }
    //     }
    //     for (let i = 0; i < this.assuredVenueList.length; i++) {
    //         let venue = this.assuredVenueList[i];
    //         if (venue.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //             filtered.push(venue);
    //         }
    //     }
    //     this.filteration = filtered;
    // }
    // onCapacitySelect(event) {

    //     if (event != undefined) {
    //         if (event.value.value > this.venueCapacity) {
    //         }
    //         this.selectedVenueCapacity = event.value.value | this.venuecapacity;
    //         this.selectedGuestName = event.value.label;
    //     }
    // }
    // onCategorySelect(event) {
    //     // this.categoryService.categoryid(event.value);
    //     this.occassion = event.value;
    //     if (this.occassion) {
    //         this.showoccasionerror = false;
    //     }

    // }
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
    //             //}
    //         },
    //         err => {
    //             this.errorMessage = err.error.message;
    //         }
    //     );
    // }
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
    toggleCanvas() {
    }
    toggleSearch() {
    }
    getCategoryid() {
        this.categoryService._categoryid.subscribe(cid => {
            var categoryid = this.categoryMenuList.find(x => x.id == cid);
            if (categoryid) {
                this.occassion = categoryid.id;
            }

        })
    }
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
        //     console.log("oc", this.occassion);
        //     this.showoccasionerror = false;
        // }
        // if (this.venuecityname != null) {
        //     this.showvenuecityerror = false;
        // }
        // this.router.navigate
    }
    // filterCountry(event) {
    //     //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    //     let filtered: any[] = [];
    //     let query = event.query;
    //     for (let i = 0; i < this.cities.length; i++) {
    //         let country = this.cities[i];
    //         if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //             filtered.push(country);
    //         }
    //     }
    //     this.filteredCountries = filtered;
    // }
}
