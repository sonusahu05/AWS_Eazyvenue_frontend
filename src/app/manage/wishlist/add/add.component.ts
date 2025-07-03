import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { WishlistService } from '../../../services/wishlist.service';
import { FileUpload } from 'primeng/fileupload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../environments/environment";
import { Observable } from 'rxjs';
@Component({
  selector: 'app-wishlist-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  providers: [ConfirmationService, MessageService, WishlistService]
})
export class WishlistAddComponent implements OnInit {
  uploadedFiles: any[] = [];
  wishlist_image: FormArray;
  deletedattachments: any[] = [];
  filename: any = '';
  staticPath: string;
  wishlistImage: any;
  statuses: any;
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  public isUpload: boolean = false;
  wishlist_content;
  wishlist_title;
  wishlist_url;
  wishlistStatus: any;
  wishlistImagesArray: any;
  wishlists: any[] = [
    { name: 'Wishlist 1', value: 'Wishlist 1' },
    { name: 'Wishlist 2', value: 'Wishlist 2' },
    { name: 'Wishlist 3', value: 'Wishlist 3' }
  ];
  selectedWishlistName: any = this.wishlists[0].value;
  wishlistForm: FormGroup;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private wishlistService: WishlistService,
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
    this.pagetitle = 'Add Wishlist';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
    this.statuses = [
      { name: 'Active', code: 'Active' },
      { name: 'In-Active', code: 'In-Active' }
    ];
    //this.wishlistStatus = "Active";
    this.wishlistForm = this.formBuilder.group({
      wishlist_title: ['', [Validators.required, Validators.pattern('^[A-Za-z_ ][A-Za-z_ ]*$')]],
      slug: ['', [Validators.required, Validators.pattern('^[A-Za-z_][A-Za-z_]*$')]],
      // wishlist_content: [''],
      // wishlist_url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      status: [true, Validators.required],
      disable: [false],
    });
  }
  get f() {
    return this.wishlistForm.controls;
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
    if (this.wishlistForm.invalid) {
      return;
    }
    var wishlistData = this.wishlistForm.value;
    //wishlistData['status'] =this.wishlistStatus;
    //console.log(this.wishlistImage);
    this.wishlistImagesArray = [];
    if (this.wishlistImage != undefined) {
      this.wishlistImage.forEach((element, index) => {
        index = index + 1;
        let wishlistImageAlt;
        let wishlistImageDefault;
        // let wishlistImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_image_" + index).value;
        // let wishlistImageDefault = this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).checked;
        this.wishlistImagesArray.push({ 'file': element.file, 'alt': wishlistImageAlt, 'default': wishlistImageDefault });

      });
    }
    //console.log('this.wishlistImagesArray', this.wishlistImagesArray);

    wishlistData['wishlist_images'] = this.wishlistImagesArray;
    //console.log(wishlistData['wishlist_images']); return;
    //display form values on success
    // console.log(JSON.stringify(this.wishlistForm.value, null, 4));
    wishlistData = JSON.stringify(wishlistData, null, 4);
    this.wishlistService.addWishlist(wishlistData).subscribe(
      data => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Wishlist Added Successfully!!', life: 6000 });
        setTimeout(() => {
          this.router.navigate(['/manage/wishlist']);
        }, 2000);
      },
      ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: "Error", detail: err.error.message, life: 6000 });
      })
    );
  }
  onchangeSelect(event) {
    this.selectedWishlistName = event.value.value;
    this.changeDetectorRef.detectChanges();
  }
  onStatusSelect(event) {
    if (event) {
      this.wishlistStatus = event.name;
    }
  }
  picUploader(event) {
    if (isPlatformBrowser(this.platformId)) {
      this.wishlistImage = [];
      let index = 0;
      for (let file of event.files) {
        this.uploadedFiles.push(file);
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          console.log(file.name);// called once readAsDataURL is completed
          if (reader.result != null) {
            this.wishlistImage.push({ 'file': reader.result });
            index++;
            //let wishlistImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=wishlist_image_' + index + '> <label>Default:</label> <input type="radio" id=wishlist_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
            //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
          }
        }
      }
    }
  }
  onReset() {
    this.submitted = false;
    this.wishlistForm.reset();
  }
  backLink() {
    this.router.navigate(['/manage/wishlist']);
  }
}
