import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueService } from '../service/venue.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonService } from 'src/app/services/common.service';
import { SubareaService } from 'src/app/services/subarea.service';
import { FileUpload } from 'primeng/fileupload';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CustomValidators } from 'ng2-validation';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../environments/environment";
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class EditComponent implements OnInit {
    shorthtmlContent = '';
    htmlContent = '';
    //featured = '';
    assured = '';
    vendorImage: any[] = [];
    venueImage: any;
    notprofile: boolean;
    decor2Image: any;
    decor3Image: any;
    public decor1Image: any;
    public decor1Images: any = [];
    public profilepic;
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
    videoFiles: any[] = [];
    catList: any[] = [];
    propertyList: any[] = [];
    foodList: any[] = [];
    staticPath: String;
    submitted = false;
    id: string;
    errorMessage: string;
    countryname;
    countrycode;
    statename;
    statecode;
    cityname;
    citycode;
    subareaid;
    isAddMode: boolean;
    pagetitle: string;
    categories: any = [];
    public isUpload: boolean = false;
    public imageProfile;
    statelist: any = [];
    item: any = [];
    subarealist: any = [];
    citylist: any = [];
    deletedattachments: any[] = [];
    venueImages: any[] = [];
    decor2Images: any[] = [];
    decor3Images: any[] = [];
    public showProfile;
    public showDecor2Profile;
    public showDecor3Profile;
    venueForm: FormGroup;
    public uploadedpic;
    public showUploadedpic = false;
    public venueVideo;
    public videoSize = environment.videoSize;
    public imageSize = environment.imageSize;
    public videoLink: string;
    public showVideo: boolean;
    public venueImagesArray: any;
    public decor2ImagesArray: any;
    public decor3ImagesArray: any;
    //public deletedImages: any[] = [];
    public deletedDecor1Images: any[] = [];
    public deletedDecor2Images: any[] = [];
    public deletedDecor3Images: any[] = [];
    public decor1ImagesArray: any[] = [];
    public deletedVenueImages: any = [];
    public googleRating = environment.googleRating;
    public eazyVenueRating = environment.eazyVenueRating;
    public genders: any = [];
    public rolelist: any = [];
    public usergender: any;
    public venueownerRoleid;
    cpassword: boolean;
    newPasswordCheck: boolean;
    newPasswordDisable: boolean;
    public userid;
    renewPasswordCheck: boolean;
    public selectedGoogleRating;
    public selectedEazyVenueRating;
    constructor(
        private VenueService: VenueService,
        private tokenStorageService: TokenStorageService,
        private commonService: CommonService,
        private categoryService: CategoryService,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private httpClient: HttpClient,
        private elementRef: ElementRef,
        private confirmationService: ConfirmationService,
        private subareaService: SubareaService
    ) { }

    @ViewChild('fileInput') fileInput: FileUpload;

    ngOnInit() {
        this.rolelist = this.tokenStorageService.getRolelist();
        let obj = this.rolelist.find(o => o.rolename === "venueowner");
        if (obj.roleid) {
            this.venueownerRoleid = obj.roleid;
        }
        this.staticPath = environment.productUploadUrl;
        this.genders = [
            { name: 'Male', code: 'Male' },
            { name: 'Female', code: 'Female' },
            { name: 'Other', code: 'Other' },
        ];
        this.venueForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            category: ['', [Validators.required]],
            propertyType: ['', [Validators.required]],
            foodType: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            shortdescription: [''],
            description: [''],
            googleRating: ['', [Validators.required]],
            eazyVenueRating: ['', [Validators.required]],
            peopleBooked: ['', [Validators.required]],
            views: [''],
            minRevenue: ['', [Validators.required]],
            mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            capacity: ['', [Validators.required]],
            area: ['', [Validators.required]],
            venuePrice: ['', [Validators.required]],
            decor1Price: ['', [Validators.required]],
            decor2Price: ['', [Validators.required]],
            decor3Price: ['', [Validators.required]],
            roundTable: ['', [Validators.required]],
            theaterSitting: ['', [Validators.required]],
            address: ['', [Validators.required]],
            country: [''],
            state: ['', [Validators.required]],
            city: ['', [Validators.required]],
            subarea: ['', [Validators.required]],
            capacityDescription: [''],
            zipcode: ['', [Validators.required, Validators.pattern("^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$")]],
            acdetails: [''],
            parkingdetails: [''],
            kitchendetails: [''],
            decorationdetails: [''],
            amenities: [''],
            disable: [false],
            //featured: [false],
            assured: [false],
            ownerfirstName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]*$')]], //changed pattern
            ownerlastName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]*$')]], //changed pattern
            owneremailId: [''], //removed validation field is disabled
            currentPassword: [''],
            password: [''],
            confirmPassword: [''],
            ownermobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            ownergender: ['', Validators.required],
        }
            , {
                validator: MustMatch('password', 'confirmPassword')
            }
        );
        this.cpassword = false;
        this.newPasswordCheck = false;
        this.newPasswordDisable = true;
        this.pagetitle = 'Add Venue';
        this.id = this.route.snapshot.paramMap.get("id");
        this.isAddMode = !this.id;
        this.getStates();
        this.getCategory();
        if (!this.isAddMode) {
            this.pagetitle = 'Edit Venue';
            this.VenueService.getvenue(this.id).subscribe(res => {
                console.log(res);

                this.item = res;
                this.userid = res['venueownerId'];
                this.venueForm.controls.name.setValue(res['name']);
                this.venueForm.controls.email.setValue(res['email']);
                this.venueForm.controls.area.setValue(res['area']);
                this.venueForm.controls.capacity.setValue(res['capacity']);
                this.venueForm.controls.roundTable.setValue(res['roundTable']);
                this.venueForm.controls.theaterSitting.setValue(res['theaterSitting']);
                this.venueForm.controls.shortdescription.setValue(res['shortdescription']);
                this.venueForm.controls.description.setValue(res['description']);
                this.venueForm.controls.mobileNumber.setValue(res['mobileNumber']);
                this.venueForm.controls.zipcode.setValue(res['zipcode']);
                this.venueForm.controls.address.setValue(res['address']);
                this.venueForm.controls.category.setValue(res['category']);
                this.venueForm.controls.propertyType.setValue(res['propertyType']);
                this.venueForm.controls.foodType.setValue(res['foodType']);
                this.venueForm.controls.capacityDescription.setValue(res['capacityDescription']);
                this.venueForm.controls.acdetails.setValue(res['acdetails']);
                this.venueForm.controls.parkingdetails.setValue(res['parkingdetails']);
                this.venueForm.controls.kitchendetails.setValue(res['kitchendetails']);
                this.venueForm.controls.decorationdetails.setValue(res['decorationdetails']);
                this.venueForm.controls.peopleBooked.setValue(res['peopleBooked']);
                this.venueForm.controls.minRevenue.setValue(res['minRevenue']);
                this.venueForm.controls.views.setValue(res['views']);
                this.venueForm.controls.amenities.setValue(res['amenities']);
                this.venueForm.controls.eazyVenueRating.setValue({ name: res['eazyVenueRating'], value: res['eazyVenueRating'] });
                this.venueForm.controls.googleRating.setValue({ name: res['googleRating'], value: res['googleRating'] });
                //this.venueForm.controls.featured.setValue(res['featured']);
                this.venueForm.controls.assured.setValue(res['assured']);
                this.venueForm.get('password').disable()
                this.venueForm.get('confirmPassword').disable()
                this.venueForm.controls.venuePrice.setValue(res['venuePrice']);
                this.venueForm.controls.decor1Price.setValue(res['decor1Price']);
                this.venueForm.controls.decor2Price.setValue(res['decor2Price']);
                this.venueForm.controls.decor3Price.setValue(res['decor3Price']);

                this.venueForm.controls.ownerfirstName.setValue(res['venueownerFname']);
                this.venueForm.controls.ownerlastName.setValue(res['venueownerLname']);
                this.venueForm.controls.owneremailId.setValue(res['venueownerEmail']);
                this.venueForm.get('owneremailId').disable()
                this.venueForm.controls.ownermobileNumber.setValue(res['venueownerMobile']);
                this.venueForm.get('ownergender').setValue({ name: res['venueownerGender'], code: res['venueownerGender'] },);
                if (res['profilepic'] != undefined) {
                    this.imageProfile = res['profilepic'];
                    this.showUploadedpic = true;
                } else {
                    this.showUploadedpic = false;
                }
                if (res['statecode']) {
                    this.getCities(false, res['statecode']);
                    this.venueForm.get('state').setValue({ name: res['statename'], code: res['statecode'] });
                }
                // if (res['citycode']) {
                //   this.venueForm.get('city').setValue({ name: res['cityname'], code: res['citycode'] });
                // }
                // if (res['venueImage'] != undefined) {
                //   this.imageProfile = res['venueImage'];
                //   this.showUploadedpic = true;
                // } else {
                //   this.showUploadedpic = false;
                // }
                if (res['venueVideo'] != undefined && res['venueVideo'] != "") {
                    this.videoLink = res['venueVideo'];
                    this.showVideo = true;
                } else {
                    this.showVideo = false;
                }
                if (res['venueImage'] != undefined) {
                    this.venueImages = res['venueImage'];
                    this.showProfile = true;
                } else {
                    this.showProfile = false;
                }
                if (res['decor1Image'] != undefined) {
                    this.decor1Images = res['decor1Image'];
                    this.showProfile = true;
                } else {
                    this.showProfile = false;
                }
                if (res['decor2Image'] != undefined) {
                    this.decor2Images = res['decor2Image'];
                    this.showDecor2Profile = true;
                } else {
                    this.showDecor2Profile = false;
                }
                if (res['decor3Image'] != undefined) {
                    this.decor3Images = res['decor3Image'];
                    this.showDecor3Profile = true;
                } else {
                    this.showDecor3Profile = false;
                }
                console.log(this.getInvalidControls());

            });
        }
    }
    get f() {
        return this.venueForm.controls;
    }
    getInvalidControls() {
        const invalidControls = [];
        const formControls = this.venueForm.controls;

        for (const controlName in formControls) {
            if (formControls.hasOwnProperty(controlName)) {
                if (!formControls[controlName].valid) {
                    invalidControls.push(controlName);
                }
            }
        }

        return invalidControls;
    }
    newPassword(event) {
        if (this.venueForm.controls['password'].value != '' && this.venueForm.controls['currentPassword'].value == '') {
            this.venueForm.controls['currentPassword'].setValidators([Validators.required]);
            this.cpassword = true;
            this.newPasswordCheck = false;
            this.renewPasswordCheck = true;
        } else {
            this.cpassword = false;
        }
    }
    newRePassword(event) {
        if (this.venueForm.controls['confirmPassword'].value == '') {
            this.venueForm.controls['confirmPassword'].setValidators([Validators.required]);
            this.renewPasswordCheck = true;
        } else {
            this.renewPasswordCheck = false;
        }
    }
    newPasswordValidation(event) {
        this.venueForm.get('password').enable()
        this.venueForm.get('confirmPassword').enable()
        if (this.venueForm.controls['currentPassword'].value != '' && this.venueForm.controls['password'].value == '') {
            this.venueForm.controls['password'].setValidators([Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]);
            this.newPasswordCheck = true;
            this.renewPasswordCheck = true;
            this.cpassword = false;
        } else {
            this.newPasswordCheck = false;
        }
    }
    videoUploader(event) {
        for (let file of event.files) {
            this.videoFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.videoFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
                this.venueVideo = reader.result;
            }
        }
    }

    picVenueOwnerUploader(event) {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadedFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
                this.profilepic = reader.result;
            }
        }
    }

    picUploader(event) {
        this.venueImage = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                //console.log(file.name);// called once readAsDataURL is completed
                if (reader.result != null) {
                    this.venueImage.push({ 'file': reader.result });
                    index++;
                    //let venueImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=venue_image_' + index + '> <label>Default:</label> <input type="radio" id=venue_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
                }
            }
        }
    }
    picUploader1(event) {
        this.decor1Image = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                //console.log(file.name);// called once readAsDataURL is completed
                if (reader.result != null) {
                    this.decor1Image.push({ 'file': reader.result });
                    index++;
                    //let venueImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .decor-one-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=decor_one_' + index + '> <label>Default:</label> <input type="radio" id=decor_one_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
                }
            }
        }
    }
    picUploader2(event) {
        this.decor2Image = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                //console.log(file.name);// called once readAsDataURL is completed
                if (reader.result != null) {
                    this.decor2Image.push({ 'file': reader.result });
                    index++;
                    //let venueImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .decor-two-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=decor_two_' + index + '> <label>Default:</label> <input type="radio" id=decor_two_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
                }
            }
        }
    }
    picUploader3(event) {
        this.decor3Image = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                //console.log(file.name);// called once readAsDataURL is completed
                if (reader.result != null) {
                    this.decor3Image.push({ 'file': reader.result });
                    index++;
                    //let venueImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .decor-three-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=decor_three_' + index + '> <label>Default:</label> <input type="radio" id=decor_three_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
                }
            }
        }
    }
    deleteFile(list, index) {
        this.deletedattachments.push(this.uploadedFiles[index]);
        this.uploadedFiles.splice(index, 1);
        this.fileInput.files.splice(index, 1);
    }

    onGenderSelect(event) {
        if (event) {
            this.usergender = event.name;
        }
    }

    getCategory() {
        var parentlist = this.tokenStorageService.getCategorylist();
        let obj = parentlist.find(o => o.slug === "parent_category");
        if (obj.id) {
            var query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + obj.id + "&sortBy=created_at&orderBy=1";
            this.categoryService.getCategoryList(query).subscribe(
                data => {
                    var catlist = data.data.items;
                    catlist.forEach(element => {
                        this.catList.push({ id: element.id, name: element.name });
                    })
                },
                err => {
                    this.errorMessage = err.error.message;
                }
            );
        }
        let propertyObj = parentlist.find(o => o.slug === "property_type");
        if (propertyObj.id) {
            var query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + propertyObj.id + "&sortBy=name&orderBy=ASC";
            this.categoryService.getCategoryList(query).subscribe(
                data => {
                    var propertylist = data.data.items;
                    propertylist.forEach(element => {
                        this.propertyList.push({ id: element.id, name: element.name });
                    })
                },
                err => {
                    this.errorMessage = err.error.message;
                }
            );
        }
        let foodObj = parentlist.find(o => o.slug === "food");
        if (foodObj.id) {
            var query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + foodObj.id + "&sortBy=name&orderBy=ASC";
            this.categoryService.getCategoryList(query).subscribe(
                data => {
                    var foodlist = data.data.items;
                    foodlist.forEach(element => {
                        this.foodList.push({ id: element.id, name: element.name, slug: element.slug });
                    })
                },
                err => {
                    this.errorMessage = err.error.message;
                }
            );
        }
    }
    getStates() {
        //var countrycode = event.value.code;
        this.countryname = "India";
        this.countrycode = 'IN';
        this.commonService.getStateList(this.countrycode).subscribe(
            data => {
                this.statelist = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getCities(fromForm, event) {
        if (fromForm == true) {
            this.statecode = event.value.code;
            this.statename = event.value.name;
        } else {
            this.statecode = event;
        }
        var query = "?filterByDisable=false&filterByStatus=true&filterByStateId=" + this.statecode + "&sortBy=name&orderBy=ASC";
        this.commonService.getCities(query).subscribe(
            data => {
                this.citylist = [];
                var cities = data.data.items;
                cities.forEach(city => {
                    this.citylist.push({ name: city.name, id: city.id });
                    if (city.id == this.item['citycode']) {
                        this.venueForm.get('city').setValue({ name: city.name, id: city.id });
                        this.citycode = this.item['citycode'];
                        this.getSubareas();
                    }
                })
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    onCitySelect(event) {
        this.cityname = event.value.name;
        this.citycode = event.value.id;
        console.log(`city code : ${this.citycode} ----- city : ${this.cityname} `);

        this.getSubareas();
    }

    getSubareas() {
        var query = "?filterByDisable=false&filterByStatus=true&filterByCityId=" + this.citycode;
        this.subareaService.getSubareaList(query).subscribe(
            data => {
                this.subarealist = [];
                var subareas = data.data.items;
                subareas.forEach(subarea => {
                    this.subarealist.push({ name: subarea.name, id: subarea.id });
                    if (subarea.name == this.item['subarea']) {
                        this.venueForm.get('subarea').setValue({ name: subarea.name, id: subarea.id });
                    }
                })
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    onSubareaSelect(event) {
        this.subareaid = event.value.id;
    }

    onSubmit() {
        this.updateVenue();
    }

    updateVenue() {
        this.submitted = true;
        if (this.venueForm.invalid) {
            console.log(this.getInvalidControls());

            return;
        }
        if (this.venueForm.controls['currentPassword'].value == '' && this.venueForm.controls['password'].value == '') {
            this.cpassword = false;
            this.newPasswordCheck = false;
        } else if (this.venueForm.controls['currentPassword'].value == '') {
            this.cpassword = true;
            return;
        } else if (this.venueForm.controls['password'].value == '') {
            this.newPasswordCheck = true;
            return;
        }
        if (this.cpassword == true) {
            if (this.venueForm.controls['currentPassword'].value == '') {
                this.cpassword = true;
                return;
            } else {
                this.cpassword = false;
                this.newPasswordCheck = true;
            }
        }
        if (this.newPasswordCheck == true) {
            if (this.venueForm.controls['password'].value == '') {
                return;
            } else {
                this.venueForm.controls['password'].setValidators([]);
                this.newPasswordCheck = false;
                this.cpassword = true;
            }
        }
        if (this.renewPasswordCheck == true) {
            if (this.venueForm.controls['confirmPassword'].value == '') {
                return;
            } else {
                this.venueForm.controls['confirmPassword'].setValidators([]);
                this.renewPasswordCheck = false;
                this.newPasswordCheck = false;
                this.cpassword = false;
            }
        }
        if (this.venueForm.valid) {
            var venueData = this.venueForm.value;
            this.venueImagesArray = [];
            if (this.venueImage != undefined) {
                this.venueImage.forEach((element, index) => {
                    index = index + 1;
                    let venueImageAlt = '';//this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #venue_image_" + index).value;
                    let venueImageDefault = false;
                    //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #venue_default_" + index).checked;
                    this.venueImagesArray.push({ 'file': element.file, 'alt': venueImageAlt, 'default': venueImageDefault });
                });
            }
            venueData['venueImage'] = this.venueImagesArray;
            venueData.venuePrice = this.venueForm.get('venuePrice').value;
            venueData.decor1Price = this.venueForm.get('decor1Price').value;
            venueData.decor2Price = this.venueForm.get('decor2Price').value;
            venueData.decor3Price = this.venueForm.get('decor3Price').value;

            this.decor1ImagesArray = [];
            if (this.decor1Image != undefined) {
                this.decor1Image.forEach((element, index) => {
                    index = index + 1;
                    let venueImageAlt = ''; //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_one_" + index).value;
                    let venueImageDefault = false;
                    //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_one_default_" + index).checked;
                    this.decor1ImagesArray.push({ 'file': element.file, 'alt': venueImageAlt, 'default': venueImageDefault });

                });
            }
            venueData['decor1Image'] = this.decor1ImagesArray;

            this.decor2ImagesArray = [];
            if (this.decor2Image != undefined) {
                this.decor2Image.forEach((element, index) => {
                    index = index + 1;
                    let venueImageAlt = ''; //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_two_" + index).value;
                    let venueImageDefault = false;
                    //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_two_default_" + index).checked;
                    this.decor2ImagesArray.push({ 'file': element.file, 'alt': venueImageAlt, 'default': venueImageDefault });

                });
            }
            venueData['decor2Image'] = this.decor2ImagesArray;

            this.decor3ImagesArray = [];
            if (this.decor3Image != undefined) {
                this.decor3Image.forEach((element, index) => {
                    index = index + 1;
                    let venueImageAlt = ''; //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_three_" + index).value;
                    let venueImageDefault = false;
                    //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #decor_three_default_" + index).checked;
                    this.decor3ImagesArray.push({ 'file': element.file, 'alt': venueImageAlt, 'default': venueImageDefault });

                });
            }
            venueData['decor3Image'] = this.decor3ImagesArray;
            venueData['venue_deleted_images'] = this.deletedVenueImages;
            venueData['decor_1_deleted_images'] = this.deletedDecor1Images;
            venueData['decor_2_deleted_images'] = this.deletedDecor2Images;
            venueData['decor_3_deleted_images'] = this.deletedDecor3Images;

            venueData['venueVideo'] = this.venueVideo;
            venueData['countrycode'] = this.countrycode;
            venueData['statecode'] = this.statecode;
            venueData['statename'] = this.statename;
            venueData['citycode'] = this.citycode;
            venueData['cityname'] = this.cityname;
            venueData['subareaid'] = this.subareaid;
            venueData['userid'] = this.userid;
            venueData['profilepic'] = this.profilepic;
            venueData['eazyVenueRating'] = this.selectedEazyVenueRating;
            venueData['googleRating'] = this.selectedGoogleRating;
            delete venueData['subarea'];
            delete venueData['city'];
            delete venueData['state'];
            venueData = JSON.stringify(venueData, null, 4);

            this.VenueService.updateVenue(this.id, venueData).subscribe(res => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Venue Updated', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/venue']);
                }, 2000);
            }, ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.error, detail: 'Update Venue failed', life: 6000 });
            }));
        }
    }
    changeDefault(event, venue) {
        let id = venue.id;
        this.venueImages.forEach((item, index) => {
            let obj = { id: item.id, venue_image_src: item.venue_image_src, alt: item.alt, default: item.default };
            if (item.id == id) {
                obj = { id: item.id, venue_image_src: item.venue_image_src, alt: item.alt, default: true };
                let removeDefault = this.findIndexByName(item.venue_image_src, this.venueImages);
                if (removeDefault != -1) {
                    this.venueImages[removeDefault] = obj;
                    this.venueForm.get("default_name_" + item.id).setValue(false);
                }
            } else {
                obj = { id: item.id, venue_image_src: item.venue_image_src, alt: item.alt, default: false };
                const defaultIndex = this.findIndexByName(item.venue_image_src, this.venueImages);
                this.venueImages[defaultIndex] = obj;
                this.venueForm.get("default_name_" + item.id).setValue(true);
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
    removeVenueImages(venueImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this venue image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedVenueImages.push(venueImage);
                for (let removedImage of this.venueImages) {
                    this.venueImages = this.venueImages.filter((item) => item.venue_image_src !== venueImage);
                }
            },
            reject: () => {

            }
        });


    }
    removeDecor1Images(decorImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this decor one image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedDecor1Images.push(decorImage);
                for (let removedImage of this.decor1Images) {
                    this.decor1Images = this.decor1Images.filter((item) => item.venue_image_src !== decorImage);
                }
            },
            reject: () => {

            }
        });


    }
    removeDecor2Images(decorImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this  decor two image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedDecor2Images.push(decorImage);
                for (let removedImage of this.decor2Images) {
                    this.decor2Images = this.decor2Images.filter((item) => item.venue_image_src !== decorImage);
                }
            },
            reject: () => {

            }
        });


    }
    removeDecor3Images(decorImage: any): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this decor three image ?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deletedDecor3Images.push(decorImage);
                for (let removedImage of this.decor3Images) {
                    this.decor3Images = this.decor3Images.filter((item) => item.venue_image_src !== decorImage);
                }
            },
            reject: () => {

            }
        });


    }
    cancelvenue() {
        this.router.navigate(["/manage/venue"]);
    }
    onSelectGoogleRating(event) {
        this.selectedGoogleRating = event.value.value;
    }
    onSelectEazyVenueRating(event) {
        this.selectedEazyVenueRating = event.value.value;
    }

    onReset() {
        this.submitted = false;
        this.venueForm.reset();
    }
}
