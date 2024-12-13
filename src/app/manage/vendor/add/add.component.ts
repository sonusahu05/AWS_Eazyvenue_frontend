import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { CommonService } from '../../../services/common.service';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { CustomValidators } from 'ng2-validation';
import { CategoryService } from 'src/app/services/category.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
import { TokenStorageService } from 'src/app/services/token-storage.service';
@Component({
    selector: 'app-vendor-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class AddComponent implements OnInit {
    userForm: FormGroup;
    errorMessage = '';
    id: string;
    submitted = false;
    notprofile: boolean;
    notportfolio : boolean;
    uploadedFiles: any[] = [];
    portfolioImages: any[] = [];
    portfolioImage: any[] = [];
    file: File;
    countrylist: any = [];
    catList: any[] = [];
    statelist: any = [];
    citylist: any = [];
    reader: FileReader;
    public profilepic;
    userRoleId;
    isAddMode: boolean;
    statuses: any = [];
    genders: any = [];
    userstatus: any;
    usergender: any;
    countryname;
    countrycode;
    categoryId;
    statename;
    statecode;
    cityname;
    pagetitle: string;
    portfolioImagesArray: any;
    citycode;
    dob: Date;
    minYear = environment.minYear;
    imageSize = environment.imageSize;
    yearRange;
    imageProfile;
    showUploadedpic: boolean;
    showProfile: boolean;
    public defaultDate: Date = new Date(environment.defaultDate);
    item: any = [];
    constructor(private roleService: RoleService,
        private commonService: CommonService,
        private categoryService: CategoryService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        this.yearRange = this.minYear + ":" + maxYearFunction();        
        this.defaultDate.setDate(this.defaultDate.getDate() - 5);
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.genders = [
            { name: 'Male', code: 'Male' },
            { name: 'Female', code: 'Female' },
            { name: 'Other', code: 'Other' },
        ];
        this.pagetitle = 'Add Vendor';
        this.id = this.route.snapshot.paramMap.get("id");
        this.userstatus = true;
        this.isAddMode = !this.id;
        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            address: ['', [Validators.required]],
            country: [''],
            state: ['', [Validators.required]],
            city: ['', [Validators.required]],
            zipcode: ['', [Validators.required]],
            status: [{ label: 'Active', value: true }, Validators.required],
            disable: [false],
            category: ['', [Validators.required]],
            gender: ['', Validators.required],
            dob: ['', Validators.required]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
        this.getRoleid();
        //this.getCountry();
        this.getStates();
        this.getCategory();        
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.userForm.controls;
    }
    getCategory() {
        var parentlist = this.tokenStorageService.getCategorylist();
        let obj = parentlist.find(o => o.slug === "vendor");
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
    }

    picUploader(event) {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadedFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
                this.profilepic = reader.result;
            }
        }
    }

    portfolioPicUploader(event) {
        this.portfolioImage = [];
        let index = 0;
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                //console.log(file.name);// called once readAsDataURL is completed
                if (reader.result != null) {
                    this.portfolioImage.push({ 'file': reader.result });
                    index++;
                    //let venueImageAlt = this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images").insertAdjacentHTML('beforeend', '<div class="two"><label> Alt of ' + file.name + ':<label><input type="text" id=venue_image_' + index + '> <label>Default:</label> <input type="radio" id=venue_default_' + index + ' name="groupname" value="" [(ngModel)]="selectedValue"></div>');
                    //.insertAdjacentHTML('beforeend', '<div class="two"><label>' + file.name + '</div>');
                }
            }
        }
    }

    getRoleid() {
        var querystring = "filterByroleName=vendor";
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.userRoleId = data.data.items[0]['id'];
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
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

    getStates() {
        this.countryname = "India";
        this.countrycode = 'IN';

        //this.countryname = event.value.name;
        //this.countrycode = event.value.code;
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
            //this.venueForm.get('city').reset();
            this.statecode = event;
        }
        var query = "?filterByDisable=false&filterByStatus=true&filterByStateId=" + this.statecode+"&sortBy=name&orderBy=ASC";
        this.commonService.getCities(query).subscribe(
            data => {
                this.citylist = [];
                var cities = data.data.items;
                cities.forEach(city => {
                    this.citylist.push({ name: city.name, id: city.id });                    
                    if (city.name == this.item['cityname']) {
                        this.userForm.get('city').setValue({ name: city.name, id: city.id });
                    }
                })
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    onStatusSelect(event) {
        if (event) {
            this.userstatus = event.value;
        }
    }

    onGenderSelect(event) {
        if (event) {
            this.usergender = event.name;
        }
    }

    onCitySelect(event) {
        this.cityname = event.value.name;
        this.citycode = event.value.code;
    }
    onCategorySelect(event) {
        if (event) {
            this.categoryId = event.value.id;
        }
    }

    onSubmit() {
        this.submitted = true;
        if(this.profilepic== undefined) {      
            this.notprofile=true;
            return;
        } else {
            this.notprofile=false;
        } 
        if(this.portfolioImage.length == 0) {
            this.notportfolio=true;
            return;
        } else {
            this.notportfolio=false;
        }
        
        // stop here if form is invalid
        if (this.userForm.invalid) {
            return;
        }
        var userData = this.userForm.value;
        userData['profilepic'] = this.profilepic;
        userData['role'] = this.userRoleId;
        userData['status'] = this.userstatus;
        userData['gender'] = this.usergender;
        userData['countrycode'] = this.countrycode;
        userData['countryname'] = this.countryname;
        userData['statecode'] = this.statecode;
        userData['statename'] = this.statename;
        userData['citycode'] = this.citycode;
        userData['cityname'] = this.cityname;
        userData['category'] = this.categoryId;
        userData['dob'] = moment(this.dob).format("YYYY-MM-DD");

        this.portfolioImagesArray = [];
        if (this.portfolioImage != undefined) {
            this.portfolioImage.forEach((element, index) => {
                index = index + 1;
                let venueImageAlt = ''; //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #venue_image_" + index).value;
                let venueImageDefault = false; //this.elementRef.nativeElement.querySelector(".p-fileupload-content .venue-images #venue_default_" + index).checked;
                this.portfolioImagesArray.push({ 'file': element.file, 'alt': venueImageAlt, 'default': venueImageDefault });

            });
        }
        userData['portfolioImage'] = this.portfolioImagesArray;

        //console.log(JSON.stringify(this.userForm.value, null, 4));
        userData = JSON.stringify(userData, null, 4);
        this.userService.addUser(userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Vendor Added', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/vendor/list']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add Vendor failed', life: 6000 });
            })
        );
    }

    onReset() {
        this.submitted = false;
        this.userForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/vendor/list']);
    }
}
