import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { BannerService } from '../../../services/banner.service';
import { FileUpload } from 'primeng/fileupload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../environments/environment";
import { Observable } from 'rxjs';
@Component({
  selector: 'app-banner-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  providers: [ConfirmationService, MessageService, BannerService]
})
export class BannerAddComponent implements OnInit {
  uploadedFiles: any[] = [];
  banner_image: FormArray;
  deletedattachments: any[] = [];
  filename: any = '';
  staticPath: string;
  bannerImage: any;
  statuses: any;
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  public isUpload: boolean = false;
  banner_content;
  banner_title;
  banner_url;
  bannerstatus: any;
  bannerImagesArray: any;
  banners: any[] = [
    { name: 'Banner 1', value: 'Banner 1' },
    { name: 'Banner 2', value: 'Banner 2' },
    { name: 'Banner 3', value: 'Banner 3' }
  ];
  selectedbannername: any = this.banners[0].value;
  bannerForm: FormGroup;
  constructor(
    private BannerService: BannerService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private messageService: MessageService,
    private elementRef: ElementRef
  ) { }
  @ViewChild('fileInput') fileInput: FileUpload;
  ngOnInit() {
    this.staticPath = environment.uploadUrl;
    this.pagetitle = 'Add Banner';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
    this.statuses = [
      { name: 'Active', code: 'Active' },
      { name: 'In-Active', code: 'In-Active' }
    ];
    //this.bannerstatus = "Active";
    this.bannerForm = this.formBuilder.group({
      banner_title: ['', [Validators.required, Validators.pattern('^[A-Za-z_ ][A-Za-z_ ]*$')]],
      slug: ['', [Validators.required, Validators.pattern('^[A-Za-z_][A-Za-z_]*$')]],
      // banner_content: [''],
      // banner_url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      status: [true, Validators.required],
      disable: [false],
    });
  }
  get f() {
    return this.bannerForm.controls;
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
  }
  setUploadedFiles(fileData: any = '') {
    fileData.forEach(file => {
      console.log(file);
      let filePath = environment.uploadUrl + file;
      this.loadFile(filePath).subscribe(i => {
        var file = new File([i], filePath.split("/").pop(), { type: i.type, lastModified: Date.now() });
        this.fileInput.files.push(file);
        this.uploadedFiles.push(file);
      });
    });
  }
  loadFile(filepath): Observable<Blob> {
    return this.httpClient.get(filepath, {
      responseType: "blob"
    });
  }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.bannerForm.invalid) {
      return;
    }
    var bannerData = this.bannerForm.value;
    //bannerData['status'] =this.bannerstatus;
    //console.log(this.bannerImage);
    this.bannerImagesArray = [];
    if (this.bannerImage != undefined) {
      this.bannerImage.forEach((element, index) => {
        index = index + 1;
        let bannerImageAlt;
        let bannerImageDefault;
        // let bannerImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_image_" + index).value;
        // let bannerImageDefault = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).checked;
        this.bannerImagesArray.push({ 'file': element.file, 'alt': bannerImageAlt, 'default': bannerImageDefault });

      });
    }
    //console.log('this.bannerImagesArray', this.bannerImagesArray);

    bannerData['banner_images'] = this.bannerImagesArray;
    //console.log(bannerData['banner_images']); return;
    //display form values on success
    // console.log(JSON.stringify(this.bannerForm.value, null, 4));
    bannerData = JSON.stringify(bannerData, null, 4);
    this.BannerService.addBanner(bannerData).subscribe(
      data => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Banner Added Successfully!!', life: 6000 });
        setTimeout(() => {
          this.router.navigate(['/manage/banner']);
        }, 2000);
      },
      ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: "Error", detail: err.error.message, life: 6000 });
      })
    );
  }
  onchangeSelect(event) {
    this.selectedbannername = event.value.value;
    this.changeDetectorRef.detectChanges();
  }
  onStatusSelect(event) {
    if (event) {
      this.bannerstatus = event.name;
    }
  }
  picUploader(event) {
    this.bannerImage = [];
    let index = 0;
    for (let file of event.files) {
      this.uploadedFiles.push(file);
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log(file.name);// called once readAsDataURL is completed
        if (reader.result != null) {
          this.bannerImage.push({ 'file': reader.result });
          index++;
          //let bannerImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=banner_image_' + index + '> <label>Default:</label> <input type="radio" id=banner_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
          //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
        }
      }
    }
  }
  onReset() {
    this.submitted = false;
    this.bannerForm.reset();
  }
  backLink() {
    this.router.navigate(['/manage/banner']);
  }
}
