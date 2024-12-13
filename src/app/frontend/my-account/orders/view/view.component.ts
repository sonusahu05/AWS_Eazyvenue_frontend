import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueOrderService } from 'src/app/services/venueOrder.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonService } from 'src/app/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../../environments/environment";
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
@Component({
  selector: 'app-view-customer-venue-order',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [ConfirmationService, MessageService, DatePipe]
})
export class ViewCustomerVenueOrderComponent implements OnInit {

  availableClasses: string[] = ["light", "normal-header"];
  currentClassIdx: number = 0;
  bodyClass: string;
  pagetitle: string;
  id: string;
  venueorder: any = [];
  errorMessage: string;
  submitted = false;
  venueorderForm: FormGroup;
  public vendorName: any[] = [];
  public foodTypeList: any[] = [];
  public foodMenuTypeList: any[] = [];
  public foodType;
  public OccasionDate;
  public price;
  public categoryName;
  constructor(
    private venueorderService: VenueOrderService,
    private tokenStorageService: TokenStorageService,
    private commonService: CommonService,
    private categoryService: CategoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private elementRef: ElementRef,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe
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
    this.pagetitle = "Venue Order Details";
    this.id = this.route.snapshot.paramMap.get("id");
    this.venueorderForm = this.formBuilder.group({
      venueName: [''],
      venueaddress: [''],
      venuecity: [''],
      venuezipcode: [''],
      venueprice: [''],
      customerName: [''],
      customeremail: [''],
      customermobileNumber: [''],
      customerselecteddecor: [''],
      customerselectedvendorarr: [''],
      customerselectedFoodrarr: [''],
      //customerselectedFoodmenurarr: [''],
      occasionDate: [''],
      decor1price: [''],
      decor2price: [''],
      decor3price: [''],
      comment: ['', [Validators.required]]
    });
    this.getVenueorder(this.id);
  }
  get f() {
    return this.venueorderForm.controls;
  }
  getVenueorder(id) {
    this.venueorderService.getVenueOrder(this.id).subscribe(res => {
      this.venueorder = res;
      this.vendorName = [];
      if (this.venueorder['customerselectedvendorarr'] != undefined) {
        this.venueorder['customerselectedvendorarr'].forEach(element => {
          this.vendorName.push(element['name']);
        })
      }

      var foodName = [];
      if (this.venueorder['customerselectedFoodrarr'].length > 0) {
        this.venueorder['customerselectedFoodrarr'].forEach(element => {
          foodName.push(element['name']);
        })
      }
      if (this.venueorder['foodType'].length > 0) {
        if (this.venueorder['foodType'][0] == 'veg_food') {
          this.foodType = "Veg Food";
        }
        if (this.venueorder['foodType'][0] == 'non_veg') {
          this.foodType = "Non Veg Food";
        }
        if (this.venueorder['foodType'][0] == 'mixFood') {
          this.foodType = "Mix Food";
        }
        if (this.venueorder['foodType'][0] == 'jainFood') {
          this.foodType = "Jain Food";
        }
      }
      if (this.venueorder['foodMenuType'].length > 0) {
        this.foodMenuTypeList = this.venueorder['foodMenuType'];
      }
      if (this.venueorder['duration'] != undefined) {
        this.OccasionDate = moment(this.venueorder['duration'][0]['occasionDate']).local().format('DD-MM-YYYY');
      }
      if (this.venueorder['price'] != undefined) {
        this.price = this.venueorder['price'];
      }
      if (this.venueorder['categoryName'] != undefined && this.venueorder['categoryName'] != '') {
        this.categoryName = this.venueorder['categoryName'];
      }
      this.venueorderForm.patchValue({
        venueName: this.venueorder['venueName'],
        venueaddress: this.venueorder['venueaddress'],
        venuecity: this.venueorder['venuecity'],
        venuezipcode: this.venueorder['venuezipcode'],
        venueprice: this.venueorder['venuePrice'],
        customerName: this.venueorder['customerName'],
        customeremail: this.venueorder['customeremail'],
        customermobileNumber: this.venueorder['customermobileNumber'],
        customerselecteddecor: this.venueorder['customerselecteddecor'],
        occasionDate: this.datePipe.transform(this.venueorder['occasionDate'], 'dd-MM-yyyy'),
        customerselectedvendorarr: this.vendorName.toString(),
        customerselectedFoodrarr: foodName.toString(),
        decor1price: this.venueorder['venuedecor1Price'],
        decor2price: this.venueorder['venuedecor2Price'],
        decor3price: this.venueorder['venuedecor3Price'],
      });
      this.venueorderForm.get('venueName').disable();
      this.venueorderForm.get('venueaddress').disable();
      this.venueorderForm.get('venuecity').disable();
      this.venueorderForm.get('venuezipcode').disable();
      this.venueorderForm.get('venueprice').disable();
      this.venueorderForm.get('customerName').disable();
      this.venueorderForm.get('customeremail').disable();
      this.venueorderForm.get('customermobileNumber').disable();
      this.venueorderForm.get('customerselecteddecor').disable();
      this.venueorderForm.get('customerselectedvendorarr').disable();
      this.venueorderForm.get('customerselectedFoodrarr').disable();
      this.venueorderForm.get('occasionDate').disable();
      this.venueorderForm.get('decor1price').disable();
      this.venueorderForm.get('decor2price').disable();
      this.venueorderForm.get('decor3price').disable();
    });
  }

  addComment() {
    this.submitted = true;
    if (this.venueorderForm.invalid) {
      return;
    }
    var venueData = this.venueorderForm.value;
    this.venueorderService.updateVenueOrder(this.id, venueData).subscribe(
      data => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Venue Order Comment Added', life: 3000 });
        setTimeout(() => {
          this.router.navigate(['/manage/venue']);
        }, 2000);
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  cancelvenue() {
    this.router.navigate(["/my-profile"]);
  }
}
