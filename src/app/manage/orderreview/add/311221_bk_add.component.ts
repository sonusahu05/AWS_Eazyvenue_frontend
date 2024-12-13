import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { NodeService } from '../../../demo/service/nodeservice';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { TreeNode } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { BannerService } from '../service/banner.service';
//import { TokenStorageService } from '../_services/token-storage.service';
//import { Editor } from 'primeng/editor';
//import Quill from 'quill';
//import  Utility  from '../../../../../../_helpers/utility';
//import  Utility  from '../../../_helpers/utility';
import  Utility  from '../../../_helpers/utility';

@Component({
      selector: 'app-add',
      templateUrl: './add.component.html',
      styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class AddComponent implements OnInit {
 /* 
    htmlContent = '';
 config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };
  
  
  
    propagateChange = (_: any) => { };
  propagateTouched = () => { };
  registerOnChange(fn: (_: any) => void): void { this.propagateChange = fn; }
  registerOnTouched(fn: () => void): void { this.propagateTouched = fn; }
  public value: string;
  */
  
  
    submitted = false;
    id: string;
    isAddMode: boolean;
    pagetitle: string;


    banners: any[] = [
        { name: 'Banner 1', value: 'Banner 1' },
        { name: 'Banner 2', value: 'Banner 2' },
		{ name: 'Banner 3', value: 'Banner 3' }
    ];
    
  selectedbannername: any = this.banners[0].value;
  
    bannerForm = new FormGroup({
    banner_title: new FormControl(""),
    banner_image:new FormControl(""), 
    banner_url: new FormControl(""),
	banner_content: new FormControl(""),
    status:new FormControl("")
    });
 
  


    constructor(private BannerService: BannerService, private router: Router, private route:ActivatedRoute,private formBuilder: FormBuilder,private changeDetectorRef: ChangeDetectorRef) { }



    ngOnInit() {
    this.pagetitle ='Add Banner';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
      
      if (!this.isAddMode) {
    this.pagetitle ='Edit Banner';
        this.BannerService.getBanner(this.id).subscribe(res => {
   console.log(res,"accres");
          this.bannerForm.controls.banner_title.setValue(res.banner_title);
          this.bannerForm.controls.banner_image.setValue(res.banner_image);
          this.bannerForm.controls.banner_url.setValue(res.banner_url);
		  this.bannerForm.controls.banner_content.setValue(res.banner_content);
          this.bannerForm.controls.status.setValue(res.status);
        });
      }






    }
 get f() { 
    return this.bannerForm.controls; 
    }  
  

  
  
  onSubmit() {
  console.log(this.bannerForm); 
  if (this.isAddMode) {
    this.addBanner();
  } else {
    this.updateBanner();
  }
}

addBanner(){
  this.submitted = true;
if (this.bannerForm.valid) {
  this.BannerService.addBanner(this.bannerForm.value).subscribe(res => {
    this.bannerForm.reset();
    this.router.navigate(["/admin/banner-management"]);

  });
}
}
  
     updateBanner() {
    console.log(this.bannerForm);
    console.log(this.bannerForm.value);
       this.submitted = true;
    if (this.bannerForm.valid) {
      this.BannerService.editBanner(this.bannerForm.value, this.id).subscribe(res => {
         this.router.navigate(["/admin/banner-management"]);
      });
    }
     }



cancelBanner(){
  this.router.navigate(["/admin/banner-management"]); 
}
  
 onchangeSelect(event){
    console.log(event)
    this.selectedbannername=event.value.value;
    this.changeDetectorRef.detectChanges();
  }

}
