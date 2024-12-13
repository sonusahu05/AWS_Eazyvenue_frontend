import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueorderService } from '../service/venueorder.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonService } from 'src/app/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../../environments/environment";
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-viewvenueorder',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [ConfirmationService, MessageService, DatePipe]
})
export class ViewvenueorderComponent implements OnInit {
  pagetitle: string;
  id: string;
  venueorder: any = [];
  errorMessage: string;
  submitted = false;
  venueorderForm: FormGroup;
  constructor(
    private venueorderService: VenueorderService,
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
  ) { }

  ngOnInit() {
    this.pagetitle = "Venue Order Details";
    this.id = this.route.snapshot.paramMap.get("venueid");
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
      comment: ['',[Validators.required]]
    });
    this.getVenueorder(this.id);
  }
  get f() {
    return this.venueorderForm.controls;
  }
  getVenueorder(id) {
    this.venueorderService.getVenueorder(this.id).subscribe(res => {
      this.venueorder = res;
      var vendorName = [];
      this.venueorder['customerselectedvendorarr'].forEach(element => {
        vendorName.push(element['name']);
      })
      var foodName = [];
      this.venueorder['customerselectedFoodrarr'].forEach(element => {
        foodName.push(element['name']);
      })
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
        customerselectedvendorarr: vendorName.toString(),
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
    this.venueorderService.updateVenueorder(this.id, venueData).subscribe(
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
    this.router.navigate(["/manage/venue"]);
  }
}
