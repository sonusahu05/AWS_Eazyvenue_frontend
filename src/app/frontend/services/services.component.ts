import { Component, OnInit } from '@angular/core';
import { CmsmoduleService } from '../../manage/cmsmodule/service/cmsmodule.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { BannerService } from '../../services/banner.service';
//import { OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from "./../../../environments/environment";
import { CustomValidators } from 'ng2-validation';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
//import { ReferAFriendService } from '../service/referAFriendService.service';
@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ServicesComponent implements OnInit {
  availableClasses: string[] = [ "light", "normal-header"];
  currentClassIdx: number = 0;
  bodyClass: string;
  referAFriendForm: FormGroup;
  public loading: boolean;
  public cmsContent;
  public cmsContentData;
  public cmsBottomContent;
  public cmsBottomContentData;
  public totalRecords=0;
  public errorMessage: string;
  public bannerList: any[];
  public bannerImageList: any[] = [];
  public totalBanners = 0;
  submitted: boolean;
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

  constructor(private cmsmoduleService: CmsmoduleService,
    private bannerService: BannerService,
    private formBuilder: FormBuilder, private messageService: MessageService, private router: Router,
    //private referAFriendService: ReferAFriendService
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
    this.referAFriendForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      friendFieldSet: this.formBuilder.group({
        fieldsSet: this.formBuilder.array([this.addFriendFieldsSet()])
      }),
    });
  }



  get f() {
    return this.referAFriendForm.controls;
  }

  addFriendFieldsSet() {
    return this.formBuilder.group({
      friendFirstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      friendLastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      friendEmail: ['', [Validators.required, Validators.email, CustomValidators.email]],
    });
  }
  addMoreFriendFieldsSet() {
    this.friendFieldSetArray.push(this.addFriendFieldsSet());
  }

  removeFriendFieldsSet(i: number): void {
    this.submitted = false;
    this.friendFieldSetArray.removeAt(i);
  }
  get friendFieldSetArray() {
    const control = <FormArray>(<FormGroup>this.referAFriendForm.get('friendFieldSet')).get('fieldsSet');
    return control;
  }
  getCmsContent() {
    var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=services";
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
  }

  getBanner() {
    let query = "?filterByDisable=false&filterByStatus=true&filterBySlug=services";
    this.bannerService.getbannerList(query).subscribe(
      data => {
        this.loading = false;
        this.bannerList = data.data.items;
        this.totalRecords = data.data.totalCount;
        this.bannerList.forEach(element => {
          this.bannerImageList = element.banner_image;
        });    
        //console.log(this.bannerImageList);    
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }
}
