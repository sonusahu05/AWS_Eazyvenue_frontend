import { Component, OnInit } from '@angular/core';
import { CmsmoduleService } from '../../manage/cmsmodule/service/cmsmodule.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
//import { BannerService } from '../../services/banner.service';
//import { OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from "./../../../environments/environment";
import { CustomValidators } from 'ng2-validation';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
//import { ReferAFriendService } from '../service/referAFriendService.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  providers: [MessageService],
})
export class BlogComponent implements OnInit {
  public loading: boolean;
  public cmsContent;
  public cmsContentData;
  public cmsBottomContent;
  public cmsBottomContentData;
  public errorMessage: string;
  public bannerList: any[];
  public totalBanners = 0;
  submitted: boolean;
  public customOptions1;
  constructor(private cmsmoduleService: CmsmoduleService,
    //private bannerService: BannerService,
    private formBuilder: FormBuilder, private messageService: MessageService, private router: Router,
    //private referAFriendService: ReferAFriendService
  ) { }

  ngOnInit(): void {
    this.getCmsContent();
    this.getBanner();

  }



  get f() {
    return '';
  }


  getCmsContent() {
    var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=blog";
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

    // var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=blog";
    // this.cmsmoduleService.getContentDetails(query).subscribe(
    //   data => {
    //     this.loading = false;
    //     this.cmsBottomContent = data.data.items[0];
    //     this.cmsBottomContentData = this.cmsBottomContent['cmsDescription'];
    //     // console.log(this.cmsBottomContentData)
    //   },
    //   err => {
    //     this.errorMessage = err.error.message;
    //   });
  }

  getBanner() {
    var query = "?filterByDisable=false&filterByStatus=true&filterBySlug=blog";
    // this.bannerService.getbannerList(query).subscribe(
    //   data => {
    //     this.loading = false;
    //     this.bannerList = data.data.items[0]['banner_image'];
    //     this.totalBanners = data.data.totalCount;
    //   },
    //   err => {
    //     this.errorMessage = err.error.message;
    //   });
  }

}
