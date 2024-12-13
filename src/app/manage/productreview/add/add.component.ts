import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { TreeNode } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductreviewService } from '../service/productreview.service';
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
  reviewImage: FormArray;
  deletedattachments: any[] = [];
  filename: any = '';
  staticPath: string;
  reviewImages: any;

  category_orgs: any[];
  selectedCategoryOrg: string;
  categorylist: any = [];

  date1: Date;

  subcategorylist: any = [];
  subcategoryList: any;
  categoryList: any;
  totalRecords: any;
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  public isUpload: boolean = false;

  isMetal = false;



  productRatings: any[] = [
    { name: 'Select', value: '' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' }
  ];

  selectedratingValue: any = this.productRatings[0].value;


  productreviewForm = new FormGroup({
    sku: new FormControl("", [Validators.required]),
    reviewHeading: new FormControl(""),
    customerName: new FormControl(""),
    date: new FormControl("", [Validators.required]),
    reviewDescription: new FormControl(""),
    reviewImage: new FormArray([]),
    rating: new FormControl(""),
    email: new FormControl(""),
    status: new FormControl(false),
    approve: new FormControl(true),
  });

  constructor(
    private ProductreviewService: ProductreviewService,
    private router: Router,
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
    this.pagetitle = 'Product Review Status';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.pagetitle = 'Manage Product Review';
      this.isMetal = true;
      this.ProductreviewService.getProductreview(this.id).subscribe(res => {
        this.productreviewForm.controls.sku.setValue(res.sku);
        this.productreviewForm.controls.reviewHeading.setValue(res.reviewHeading);
        this.productreviewForm.controls.customerName.setValue(res.customerName);
        this.productreviewForm.controls.rating.setValue(res.rating);
        this.productreviewForm.controls.reviewDescription.setValue(res.reviewDescription);
        this.productreviewForm.controls.email.setValue(res.email);
        // this.productreviewForm.controls.date.setValue(res.date);
        this.date1 = new Date(res.date);
        this.productreviewForm.controls.status.setValue(res.status);
        this.productreviewForm.controls.approve.setValue(res.approve);
        this.setUploadedFiles(res.reviewImage);
      });


      const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        console.log(this.reviewImages);
        if (this.reviewImages.length > 0) {
          this.reviewImages.forEach(file => {
            console.log(file);
            //   let filePath = environment.uploadUrl + file;
            let filePath = environment.productUploadUrl + file;
            console.log(filePath);
          });
        }
        console.log(this.uploadedFiles);
        console.log(this.fileInput.files);

      }, 3000);

    }


  }
  get f() {
    return this.productreviewForm.controls;
  }

  onUpload(event, frmCrl, form) {
    this.uploadedFiles = []
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.isUpload = true;
    this.changeDetectorRef.detectChanges();
  }

  deleteFile(list, index) {
    this.deletedattachments.push(this.uploadedFiles[index]);
    this.uploadedFiles.splice(index, 1);
    this.fileInput.files.splice(index, 1);
    console.log(this.fileInput);

  }

  setUploadedFiles(fileData: any = '') {
    console.log(fileData);
    fileData.forEach(file => {
      console.log(file);
      //let filePath = environment.uploadUrl + file;
      let filePath = environment.productUploadUrl + file;
      console.log(filePath);
      this.loadFile(filePath).subscribe(i => {
        console.log(i);
        var file = new File([i], filePath.split("/").pop(), { type: i.type, lastModified: Date.now() });
        console.log(file);
        this.fileInput.files.push(file);
        this.uploadedFiles.push(file);
      });

    });
  }

  loadFile(filepath): Observable<Blob> {
    console.log(filepath)
    return this.httpClient.get(filepath, {
      responseType: "blob"
    });
  }


  onSubmit() {
    console.log(this.productreviewForm);
    this.submitted = true;
    if (this.isAddMode) {
      var count = 0;
      this.reviewImage = this.productreviewForm.get('reviewImage') as FormArray;
      this.productreviewForm.controls['reviewImage'].reset();
      console.log(this.fileInput, 'File');
      if (this.fileInput.files.length > 0) {
        this.fileInput.files.forEach(file => {
          Utility.uploadFile(file).subscribe(fileres => {
            count++;
            this.reviewImage.push(new FormControl(fileres.file));
            console.log(count);
            if (count == this.fileInput.files.length) {
              //this.generateZip();
              console.log(this.productreviewForm);
              var productreviewFormData = {
                reviewImage: this.productreviewForm.value.reviewImage
              }
              this.addProductreview();
            } else {
              this.addProductreview();
            }
          });
        });
      } else {
        this.addProductreview();
      }

    } else {

      var count = 0;
      this.reviewImage = this.productreviewForm.get('reviewImage') as FormArray;
      this.productreviewForm.controls['reviewImage'].reset();
      if (this.isUpload) {
        if (this.fileInput.files.length > 0) {
          this.fileInput.files.forEach(file => {
            console.log(file);
            Utility.uploadFile(file).subscribe(fileres => {
              console.log(fileres);
              count++;
              console.log(new FormControl(fileres.file));
              this.reviewImage.push(new FormControl(fileres.file));
              if (count == this.fileInput.files.length) {
                console.log(this.productreviewForm);
                var productreviewFormData = {
                  reviewImage: this.productreviewForm.value.reviewImage
                }
                this.updateProductreview();
              } else {
                this.updateProductreview();
              }
            });
          });
        } else {
          this.addProductreview();
        }
      } else {
        if (this.fileInput.files.length > 0) {
          this.fileInput.files.forEach(file => {
            //  console.log(file);
            //  console.log(file.name);
            count++;
            this.reviewImage.push(new FormControl(file.name));
            if (count == this.fileInput.files.length) {
              console.log(this.productreviewForm);
              var productreviewFormData = {
                reviewImage: this.productreviewForm.value.reviewImage
              }
              this.updateProductreview();
            } else {
              this.updateProductreview();
            }
          });
        } else {
          this.addProductreview();
        }
      }

    }
  }

  addProductreview() {
    this.submitted = true;
    this.isMetal = false;
    if (this.productreviewForm.valid) {
      this.ProductreviewService.addProductreview(this.productreviewForm.value).subscribe(res => {
        this.productreviewForm.reset();
        this.router.navigate(["/manage/customer/productreview"]);
      });

    }
  }

  updateProductreview() {
    // console.log(this.productForm);
    //  console.log(this.productForm.value);

    this.submitted = true;
    if (this.productreviewForm.valid) {
      this.ProductreviewService.editProductreview(this.productreviewForm.value, this.id).subscribe(res => {
        this.router.navigate(["/manage/customer/productreview"]);
      });
    }
  }



  cancelProductreview() {
    this.router.navigate(["/manage/customer/productreview"]);
  }

  onchangeSelect(event) {
    console.log(event)
    this.selectedratingValue = event.value.value;
    this.changeDetectorRef.detectChanges();
  }

}
