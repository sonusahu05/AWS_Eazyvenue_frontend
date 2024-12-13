import { Component, OnInit, ElementRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { BannerService } from '../../../services/banner.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
const api = environment.api;
const frontEnd = environment.frontEnd;
const picture = environment.picture;
import * as moment from 'moment';
@Component({
    selector: 'app-banner-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class BannerEditComponent implements OnInit {
    id;
    bannerForm: FormGroup;
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
    public bannerImage;
    public bannerImages;
    public imageBanner;
    showProfile = false;
    statuses: any = [];
    bannerStatus: any;
    banner_title;
    banner_content;
    banner_url;
    selectedStatus: any;
    displayCustom: boolean;
    activeIndex: number = 0;
    removeImagesArr: any[] = [];
    removedImage;
    updatedBannerImages: any[] = [];
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
    updatedBannerImagesArray: any;
    constructor(private bannerService: BannerService, private commonService: CommonService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute, private elementRef: ElementRef) { }

    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            { name: 'Active', code: 'Active' },
            { name: 'In-Active', code: 'In-Active' }
        ];

        this.getBannerDetails(this.id);
        this.bannerForm = this.formBuilder.group({
            banner_title: ['', [Validators.required, Validators.pattern('^[A-Za-z_ ][A-Za-z_ ]*$')]],
            slug: [''],
            // banner_content: [''],
            // banner_url : ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],            
            status: ['', Validators.required],
        });


    }
    getBannerDetails(id) {
        this.bannerService.getBannerDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.bannerForm.patchValue({
                        banner_title: this.item['banner_title'],
                        // banner_content: this.item['banner_content'],
                        slug: this.item['slug'],
                        //banner_url: this.item['banner_url']
                    });
                    this.bannerForm.get('status').setValue(this.item['status']);
                    this.bannerForm.controls['slug'].disable();
                    if (this.item['banner_image'] != undefined) {
                        this.bannerImages = this.item['banner_image'];
                        this.bannerImages.forEach((element, index) => {
                            this.bannerForm.addControl("default_name_" + index, new FormControl());
                            element['id'] = index;
                            if (element.default == true) {
                                this.bannerForm.get("default_name_" + index).setValue(false);
                                console.log(this.bannerForm.get("default_name_" + index));
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
        return this.bannerForm.controls;
    }
    changeDefault(event, banner) {
        console.log(banner);

        let id = banner.id;
        this.bannerImages.forEach((item, index) => {
            let obj = { id: item.id, banner_image_src: item.banner_image_src, alt: item.alt, default: item.default };
            console.log('item.id == id', item.id == id);
            if (item.id == id) {
                obj = { id: item.id, banner_image_src: item.banner_image_src, alt: item.alt, default: true };
                let removeDefault = this.findIndexByName(item.banner_image_src, this.bannerImages);
                if (removeDefault != -1) {
                    this.bannerImages[removeDefault] = obj;
                    this.bannerForm.get("default_name_" + item.id).setValue(false);
                }
            } else {
                obj = { id: item.id, banner_image_src: item.banner_image_src, alt: item.alt, default: false };
                const defaultIndex = this.findIndexByName(item.banner_image_src, this.bannerImages);
                this.bannerImages[defaultIndex] = obj;
                this.bannerForm.get("default_name_" + item.id).setValue(true);
            }

        });
        // console.log(this.updatedBannerImages);
        // this.updatedBannerImages.forEach((element, index) => {
        //     index++;
        //     this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).checked = false;
        //     // this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).addEventListener("click", this.changeDefaultBanner(index), false)
        // })
    }
    findIndexByName(name, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].banner_image_src === name) {
                index = i;
                break;
            }
        }
        return index;
    }

    picUploader(event) {
        this.updatedBannerImages = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => { // called once readAsDataURL is completed
                if (reader.result != null) {
                    this.updatedBannerImages.push({ 'file': reader.result });
                    index++;
                    // let bannerImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=banner_image_' + index + '> <label>Default:</label> <input type="radio" id=banner_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    // this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).addEventListener("click", () => {
                    //     let click = this.changeDefaultBanner.bind(this, index);
                    //     document.addEventListener('click', click)
                    //     //el.nativeElement.addEventListener('mouseup', this.mouseUpRef)
                    // }, false);

                }
            }
        }
    }
    ngAfterViewInit(): void {

        this.updatedBannerImages.forEach((element, index) => {
            index++;
            let clickStream;
            //this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).checked = false;
            this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).addEventListener("click", () => {
                let click = this.changeDefaultBanner(this, index);
                this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).addEventListener('click', click)
                //el.nativeElement.addEventListener('mouseup', this.mouseUpRef)
            }, false);
        })
    }

    changeDefaultBanner(event, index) {
        console.log('index', index);
        this.bannerImages.forEach((item, index) => {
            let obj = { id: item.id, banner_image_src: item.banner_image_src, alt: item.alt, default: false };
            const defaultIndex = this.findIndexByName(item.banner_image_src, this.bannerImages);
            this.bannerImages[defaultIndex] = obj;
            this.bannerForm.get("default_name_" + item.id).setValue(true);
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
            this.bannerStatus = event.name;
        }
    }
    onSubmit() {
        this.submitted = true;
        if (this.bannerForm.invalid) {
            return;
        }
        var bannerData = this.bannerForm.value;
        this.updatedBannerImagesArray = [];
        if (this.updatedBannerImages != undefined) {
            this.updatedBannerImages.forEach((element, index) => {
                index = index + 1;
                let bannerImageAlt;
                let bannerImageDefault;
                // let bannerImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_image_" + index).value;
                // let bannerImageDefault = this.elementRef.nativeElement.querySelector(".p-fileupload-content .banner-images #banner_default_" + index).checked;
                this.updatedBannerImagesArray.push({ 'file': element.file, 'alt': bannerImageAlt, 'default': bannerImageDefault });

            });
        }
        bannerData['banner_images'] = this.updatedBannerImagesArray;
        bannerData['deleted_images'] = this.deletedImages;
        bannerData = JSON.stringify(bannerData, null, 4);
        // console.log(bannerData); return;
        this.bannerService.updateBanner(this.id, bannerData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Banner Data Updated Successfully!!', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/banner']);
                }, 2000);
            },
            err => {
                //this.errorMessage = err.error.message;
            }
        );
    }
    onReset() {
        this.submitted = false;
        this.bannerForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/banner']);
    }
    imageClick(index: number) {
        this.activeIndex = index;
        this.displayCustom = true;
    }

    removeBannerImages(bannerImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedImages.push(bannerImage);
                for (let removedImage of this.bannerImages) {
                    this.bannerImages = this.bannerImages.filter((item) => item.banner_image_src !== bannerImage);
                }
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });


    }
}
