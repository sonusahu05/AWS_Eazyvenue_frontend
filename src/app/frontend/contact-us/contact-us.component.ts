import { Component, OnInit } from '@angular/core';
import { CmsmoduleService } from 'src/app/manage/cmsmodule/service/cmsmodule.service';
import { BannerService } from 'src/app/services/banner.service';
//import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { ContactUsService } from '../service/contactus.service';


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  providers: [MessageService]
})
export class ContactUsComponent implements OnInit {
  availableClasses: string[] = [ "light", "normal-header"];
  currentClassIdx: number = 0;
  bodyClass: string;
  contactUsForm: FormGroup;
  submitted: boolean = false;
  public loading: boolean;
  public cmsContent;
  public cmsContentData;
  public cmsBottomContent;
  public cmsBottomContentData;
  public errorMessage: string;
  public bannerList: any[];
  public totalBanners = 0;
  public bannerImageList: any[] = [];
  public totalRecords: 0;
  public customOptions1;
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
  // customOptions1: OwlOptions = {
  //   loop: false,
  //   mouseDrag: true,
  //   touchDrag: true,
  //   pullDrag: true,
  //   dots: false,
  //   navSpeed: 800,
  //   navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
  //   responsive: {
  //     0: {
  //       items: 1,
  //       dots: true,
  //       nav: false,
  //       margin: 10,
  //     },
  //     400: {
  //       items: 1,
  //       dots: true,
  //       nav: false,
  //       margin: 10,
  //     },
  //     740: {
  //       items: 1
  //     },
  //     940: {
  //       items: 1
  //     }
  //   },
  //   nav: true
  // }
  constructor(
    private cmsmoduleService: CmsmoduleService,
    private bannerService: BannerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private contactUsService: ContactUsService
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
  ngOnInit(): void {
    this.getCmsContent();
    this.getBanner();
    this.contactUsForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[A-Za-z ]*$')]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      message: ['', Validators.required],
      // companyName:['', Validators.required],
      // website: ['', Validators.required],
      // industrialVertical: ['', Validators.required],
    })
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.contactUsForm.controls;
  }
  getCmsContent() {
    var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=contact_us";
    this.cmsmoduleService.getContentDetails(query).subscribe(
      data => {
        this.loading = false;
        this.cmsContent = data.data.items[0];
        if (this.cmsContent != undefined) {
          this.cmsContentData = this.cmsContent['cmsDescription'];
        }

      },
      err => {
        this.errorMessage = err.error.message;
      });

    var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=contact_us";
    this.cmsmoduleService.getContentDetails(query).subscribe(
      data => {
        this.loading = false;
        this.cmsBottomContent = data.data.items[0];
        if (this.cmsBottomContent != undefined) {
          this.cmsBottomContentData = this.cmsBottomContent['cmsDescription'];
        }
        // console.log(this.cmsBottomContentData)
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }

  getBanner() {
    let query = "?filterByDisable=false&filterByStatus=true&filterBySlug=contact_us";
    this.bannerService.getbannerList(query).subscribe(
      data => {
        this.loading = false;
        this.bannerList = data.data.items;
        this.totalRecords = data.data.totalCount;
        this.bannerList.forEach(element => {
          this.bannerImageList = element.banner_image;
        });    
        console.log(this.bannerImageList);    
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.contactUsForm.invalid) {
      return;
    }
    let contactUsData = this.contactUsForm.value;
    // display form values on success
    //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryForm.value, null, 4));
    //return;
    contactUsData = JSON.stringify(contactUsData, null, 4);
    this.contactUsService.add(contactUsData).subscribe(
      data => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Thank you for contacting us.', life: 6000 });
        setTimeout(() => {
          this.router.navigate(['/contact-us']);
          this.contactUsForm.reset();
          this.submitted = false;
        }, 1000);
      },
      ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'System Error Please try again.', life: 6000 });
      })
    );
  }
}
