import { Component, OnInit, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { WishlistService } from '../../../services/wishlist.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
const api = environment.api;
const frontEnd = environment.frontEnd;
const picture = environment.picture;
import * as moment from 'moment';
@Component({
    selector: 'app-wishlist-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class WishlistEditComponent implements OnInit {
    id;
    wishlistForm: FormGroup;
    submitted = false;
    uploadedFiles: any[] = [];
    file: File;
    reader: FileReader;
    public profilepic;
    errorMessage = '';
    public item: any[] = [];
    countrylist: any = [];
    statelist: any = [];
    citylist: any = [];
    genders: any = [];
    public wishlistImage;
    public wishlistImages;
    public imageWishlist;
    showProfile = false;
    statuses: any = [];
    wishlistStatus: any;
    wishlist_title;
    wishlist_content;
    wishlist_url;
    selectedStatus: any;
    displayCustom: boolean;
    activeIndex: number = 0;
    removeImagesArr: any[] = [];
    removedImage;
    updatedWishlistImages: any[] = [];
    responsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];
    deletedImages: any[] = [];
    updatedWishlistImagesArray: any;
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private wishlistService: WishlistService, 
        private commonService: CommonService, 
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, 
        private messageService: MessageService,
        private router: Router, 
        private activeroute: ActivatedRoute, 
        private elementRef: ElementRef) { }

    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            { name: 'Active', code: 'Active' },
            { name: 'In-Active', code: 'In-Active' }
        ];

        this.getWishlistDetails(this.id);
        this.wishlistForm = this.formBuilder.group({
            wishlist_title: ['', [Validators.required, Validators.pattern('^[A-Za-z_ ][A-Za-z_ ]*$')]],
            slug: [''],
            // wishlist_content: [''],
            // wishlist_url : ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],            
            status: ['', Validators.required],
        });
    }
    getWishlistDetails(id) {
        this.wishlistService.getWishlistDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.wishlistForm.patchValue({
                        wishlist_title: this.item['wishlist_title'],
                        // wishlist_content: this.item['wishlist_content'],
                        slug: this.item['slug'],
                        //wishlist_url: this.item['wishlist_url']
                    });
                    this.wishlistForm.get('status').setValue(this.item['status']);
                    this.wishlistForm.controls['slug'].disable();
                    if (this.item['wishlist_image'] != undefined) {
                        this.wishlistImages = this.item['wishlist_image'];
                        this.wishlistImages.forEach((element, index) => {
                            this.wishlistForm.addControl("default_name_" + index, new FormControl());
                            element['id'] = index;
                            if (element.default == true) {
                                this.wishlistForm.get("default_name_" + index).setValue(false);
                                console.log(this.wishlistForm.get("default_name_" + index));
                            }
                        });
                        this.showProfile = true;
                    } else {
                        this.showProfile = false;
                    }
                }
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    get f() {
        return this.wishlistForm.controls;
    }
    changeDefault(event, wishlist) {
        console.log(wishlist);

        let id = wishlist.id;
        this.wishlistImages.forEach((item, index) => {
            let obj = { id: item.id, wishlist_image_src: item.wishlist_image_src, alt: item.alt, default: item.default };
            console.log('item.id == id', item.id == id);
            if (item.id == id) {
                obj = { id: item.id, wishlist_image_src: item.wishlist_image_src, alt: item.alt, default: true };
                let removeDefault = this.findIndexByName(item.wishlist_image_src, this.wishlistImages);
                if (removeDefault != -1) {
                    this.wishlistImages[removeDefault] = obj;
                    this.wishlistForm.get("default_name_" + item.id).setValue(false);
                }
            } else {
                obj = { id: item.id, wishlist_image_src: item.wishlist_image_src, alt: item.alt, default: false };
                const defaultIndex = this.findIndexByName(item.wishlist_image_src, this.wishlistImages);
                this.wishlistImages[defaultIndex] = obj;
                this.wishlistForm.get("default_name_" + item.id).setValue(true);
            }

        });
        // console.log(this.updatedWishlistImages);
        // this.updatedWishlistImages.forEach((element, index) => {
        //     index++;
        //     this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).checked = false;
        //     // this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).addEventListener("click", this.changeDefaultWishlist(index), false)
        // })
    }
    findIndexByName(name, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].wishlist_image_src === name) {
                index = i;
                break;
            }
        }
        return index;
    }

    picUploader(event) {
        if (isPlatformBrowser(this.platformId)) {
            this.updatedWishlistImages = [];
            let index = 0;
            for (let file of event.files) {
                this.uploadedFiles.push(file);
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => { // called once readAsDataURL is completed
                    if (reader.result != null) {
                        this.updatedWishlistImages.push({ 'file': reader.result });
                        index++;
                        // Note: Direct DOM manipulation removed for SSR compatibility
                        // Alternative: Use Angular ViewChild and Renderer2 for DOM operations
                    }
                }
            }
        }
    }
    ngAfterViewInit(): void {
        this.updatedWishlistImages.forEach((element, index) => {
            index++;
            let clickStream;
            //this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).checked = false;
            // Note: DOM manipulation commented out for SSR compatibility
            // this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).addEventListener("click", () => {
            //     let click = this.changeDefaultWishlist(this, index);
            //     this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).addEventListener('click', click)
            //     //el.nativeElement.addEventListener('mouseup', this.mouseUpRef)
            // }, false);
        })
    }

    changeDefaultWishlist(event, index) {
        console.log('index', index);
        this.wishlistImages.forEach((item, index) => {
            let obj = { id: item.id, wishlist_image_src: item.wishlist_image_src, alt: item.alt, default: false };
            const defaultIndex = this.findIndexByName(item.wishlist_image_src, this.wishlistImages);
            this.wishlistImages[defaultIndex] = obj;
            this.wishlistForm.get("default_name_" + item.id).setValue(true);
        });
    }
    getCountry() {
        this.commonService.getCountryList().subscribe(
            data => {
                this.countrylist = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    onStatusSelect(event) {
        if (event) {
            this.wishlistStatus = event.name;
        }
    }
    onSubmit() {
        this.submitted = true;
        if (this.wishlistForm.invalid) {
            return;
        }
        var wishlistData = this.wishlistForm.value;
        this.updatedWishlistImagesArray = [];
        if (this.updatedWishlistImages != undefined) {
            this.updatedWishlistImages.forEach((element, index) => {
                index = index + 1;
                let wishlistImageAlt;
                let wishlistImageDefault;
                // let wishlistImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_image_" + index).value;
                // let wishlistImageDefault = this.elementRef.nativeElement.querySelector(".p-fileupload-content .wishlist-images #wishlist_default_" + index).checked;
                this.updatedWishlistImagesArray.push({ 'file': element.file, 'alt': wishlistImageAlt, 'default': wishlistImageDefault });

            });
        }
        wishlistData['wishlist_images'] = this.updatedWishlistImagesArray;
        wishlistData['deleted_images'] = this.deletedImages;
        wishlistData = JSON.stringify(wishlistData, null, 4);
        // console.log(wishlistData); return;
        this.wishlistService.updateWishlist(this.id, wishlistData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Wishlist Data Updated Successfully!!', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/wishlist']);
                }, 2000);
            },
            err => {
                //this.errorMessage = err.error.message;
            }
        );
    }
    onReset() {
        this.submitted = false;
        this.wishlistForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/wishlist']);
    }
    imageClick(index: number) {
        this.activeIndex = index;
        this.displayCustom = true;
    }

    removeWishlistImages(wishlistImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedImages.push(wishlistImage);
                for (let removedImage of this.wishlistImages) {
                    this.wishlistImages = this.wishlistImages.filter((item) => item.wishlist_image_src !== wishlistImage);
                }
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });
    }
}
