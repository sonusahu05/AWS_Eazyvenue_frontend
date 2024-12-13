import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { TreeNode } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CmsmoduleService } from '../service/cmsmodule.service';
import Utility from '../../../_helpers/utility';
import { uploadFile } from '../../../_helpers/utility';
import { FileUpload } from 'primeng/fileupload';
import { Observable } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';
//import { Editor } from 'primeng/editor';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../environments/environment";

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AddComponent implements OnInit {
  htmlContent = '';
  config: AngularEditorConfig = {
    editable: true,
    sanitize: false,
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
  uploadedFiles: any[] = [];
  cmsImage: FormArray;
  deletedattachments: any[] = [];
  filename: any = '';
  staticPath: string;
  cmsImages: any;
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  public isUpload: boolean = false;
  public imageProfile;  
  cmsmoduleForm = new FormGroup({
    cmsTitle: new FormControl(""),
    cmspageTitle: new FormControl(""),
    slug: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z_][A-Za-z_]*$')]),
    cmsContent: new FormControl(""),
    cmsDescription: new FormControl(""),
    cmsImage: new FormArray([]),
    metaKeyword: new FormControl(""),
    metaDescription: new FormControl(""),
    status: new FormControl(true)
  });
  public uploadedpic;
  public showUploadedpic = false;
  constructor(
    private CmsmoduleService: CmsmoduleService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient
  ) { }

  @ViewChild('fileInput') fileInput: FileUpload;

  ngOnInit() {
    // this.staticPath =environment.uploadUrl;	
    this.staticPath = environment.productUploadUrl;
    this.pagetitle = 'Add Cms';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.pagetitle = 'Edit Cms';      
      this.CmsmoduleService.getCmsmodule(this.id).subscribe(res => {
        
        this.cmsmoduleForm.controls.cmsTitle.setValue(res['cmsTitle']);
        this.cmsmoduleForm.controls.cmspageTitle.setValue(res['cmspageTitle']);
        this.cmsmoduleForm.controls.slug.setValue(res['slug']);
        this.cmsmoduleForm.controls.cmsContent.setValue(res['cmsContent']);
        this.cmsmoduleForm.controls.cmsDescription.setValue(res['cmsDescription']);
        this.cmsmoduleForm.controls.metaKeyword.setValue(res['metaKeyword']);
        this.cmsmoduleForm.controls.metaDescription.setValue(res['metaDescription']);
        this.cmsmoduleForm.controls.status.setValue(res['status']);
        this.cmsmoduleForm.controls['slug'].disable();
        //this.setUploadedFiles(res.cmsImage);
        if (res['cmsImage'] != undefined) {
          this.imageProfile = res['cmsImage'];
          this.showUploadedpic = true;
        } else {
          this.showUploadedpic = false;
        }
      });
    }
  }
  get f() {
    return this.cmsmoduleForm.controls;
  }

  picUploader(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
      var reader = new FileReader();
      reader.readAsDataURL(this.uploadedFiles[0]);
      reader.onload = () => { // called once readAsDataURL is completed
        this.uploadedpic = reader.result;
      }
    }
  }
  onSubmit() {
    if (this.isAddMode) {
      this.addCmsmodule();
    } else {
      this.updateCmsmodule();
    }
  }

  addCmsmodule() {
    this.submitted = true;    
    if (this.cmsmoduleForm.valid) {
      var cmsData = this.cmsmoduleForm.value;
      cmsData['cmsImage'] = this.uploadedpic;
      cmsData = JSON.stringify(cmsData, null, 4);      
      this.CmsmoduleService.addCmsmodule(this.cmsmoduleForm.value).subscribe(
        data => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'CMS Page Added', life: 6000 });
          setTimeout(() => {
            this.router.navigate(['/manage/cmsmodule']);
          }, 2000);
        },
        ((err) => {
          this.messageService.add({ key: 'toastmsg', severity: 'error', summary: "Error", detail: err.error.error, life: 6000 });
        })
      );
    }
  }

  updateCmsmodule() {
    this.submitted = true;
    if (this.cmsmoduleForm.valid) {
      var cmsData = this.cmsmoduleForm.value;
      cmsData['cmsImage'] = this.uploadedpic;
      cmsData = JSON.stringify(cmsData, null, 4);
      this.CmsmoduleService.editCmsmodule(cmsData, this.id).subscribe(res => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'CMS Page Updated', life: 6000 });
        setTimeout(() => {
          this.router.navigate(['/manage/cmsmodule']);
        }, 2000);
      }, ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Updae CMS Page failed', life: 6000 });
      }));
    }
  }



  cancelCmsmodule() {
    this.router.navigate(["/manage/cmsmodule"]);
  }

  onReset() {
    this.submitted = false;
    this.cmsmoduleForm.reset();
}

}
