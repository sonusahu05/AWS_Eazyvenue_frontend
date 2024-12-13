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
    selector: 'app-vendor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class EditComponent implements OnInit {
    userForm: FormGroup;
    errorMessage = '';
    id: string;
    submitted = false;
    uploadedFiles: any[] = [];
    portfolioImages: any[] = [];
    portfolioImage: any[] = [];
    file: File;
    countrylist: any = [];
    catList: any[] = [];
    statelist: any = [];
    citylist: any = [];
    reader: FileReader;
    public deletedImages: any[] = [];
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
    item: any = [];
    dobdt: Date;
    cpassword: boolean;
    newPasswordCheck: boolean;
    renewPasswordCheck:boolean;
    newPasswordDisable: boolean;
    public defaultDate: Date = new Date(environment.defaultDate);
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
        this.pagetitle = 'Edit Caterer';
        this.id = this.route.snapshot.paramMap.get("id");
        this.userstatus = true;

        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            currentPassword: [''],
            password: [''],
            confirmPassword: [''],
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

        this.userService.getUser(this.id).subscribe(res => {
            this.item = res;
            this.userForm.controls.firstName.setValue(res['firstName']);
            this.userForm.controls.lastName.setValue(res['lastName']);
            this.userForm.controls.email.setValue(res['email']);
            this.userForm.controls.mobileNumber.setValue(res['mobileNumber']);
            this.userForm.controls.address.setValue(res['address']);
            this.userForm.controls.country.setValue(res['country']);
            this.userForm.controls.zipcode.setValue(res['zipcode']);
            this.userForm.get('gender').setValue({ name: this.item['gender'], code: this.item['gender'] });
            this.userForm.controls.status.setValue(res['status']);
            if (this.item['dob'] != '' && this.item['dob'] != undefined) {
                this.userForm.get('dob').setValue(moment(this.item['dob']).format('DD/MM/YYYY'));
                this.dobdt = this.item['dob'];
            }
            if (this.item['status'] == true) {
                this.userForm.get('status').setValue({ label: 'Active', value: true });
            } else {
                this.userForm.get('status').setValue({ label: 'In-Active', value: false });
            }
            this.catList.forEach(element => {
                if (element.id == this.item['category']) {
                    this.userForm.get('category').setValue({ id: element.id, name: element.name });
                }
            })

            if (res['statecode']) {
                this.getCities(false, res['statecode']);
                this.userForm.get('state').setValue({ name: res['statename'], code: res['statecode'] });
            }
            this.userForm.controls['email'].disable();
            //this.setUploadedFiles(res.cmsImage);
            if (res['profilepic'] != undefined) {
                this.imageProfile = res['profilepic'];
                this.showUploadedpic = true;
            } else {
                this.showUploadedpic = false;
            }
            if (res['portfolioImages'] != undefined) {
                this.portfolioImages = res['portfolioImages'];
                // this.portfolioImages.forEach((element, index) => {
                //   this.userForm.addControl("default_name_" + index, new FormControl());
                //   element['id'] = index;
                //   if (element.default == true) {
                //     this.userForm.get("default_name_" + index).setValue(false);
                //     //console.log(this.venueForm.get("default_name_" + index));
                //   }
                // });
                this.showProfile = true;
            } else {
                this.showProfile = false;
            }
        })

    }
    newPassword(event) {
        if (this.userForm.controls['password'].value != '' && this.userForm.controls['currentPassword'].value == '') {
            this.userForm.controls['currentPassword'].setValidators([Validators.required]);
            this.cpassword = true;
            this.newPasswordCheck = false;
            this.renewPasswordCheck = true;
        } else {
            this.cpassword = false;
        }
    }
    newRePassword(event) {
        if (this.userForm.controls['confirmPassword'].value == '') {
            this.userForm.controls['confirmPassword'].setValidators([Validators.required]);            
            this.renewPasswordCheck = true;
        } else {
            this.renewPasswordCheck = false;
        }
    }
    newPasswordValidation(event) {
        this.userForm.get('password').enable()
        this.userForm.get('confirmPassword').enable()
        if (this.userForm.controls['currentPassword'].value != '' && this.userForm.controls['password'].value == '') {
            this.userForm.controls['password'].setValidators([Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]);
            this.newPasswordCheck = true;
            this.renewPasswordCheck = true;
            this.cpassword = false;
        } else {
            this.newPasswordCheck = false;
        }
    }
    // convenience getter for easy access to form fields
    get f() {
        return this.userForm.controls;
    }
    setDOB($event) {
        this.dobdt = $event; //moment($event).format("MM/DD/YYYY");
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

    removeportfolioPicImages(venueImage: any): void {        
        this.confirmationService.confirm({
          message: 'Are you sure you want to delete this image ?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.deletedImages.push(venueImage);
            for (let removedImage of this.portfolioImages) {
              this.portfolioImages = this.portfolioImages.filter((item) => item.venue_image_src !== venueImage);
            }
          },
          reject: () => {
            //this.getUserDetails(user.id);
          }
        });
    
    
      }
    getRoleid() {
        var querystring = "filterByroleName=caterer";
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
        // stop here if form is invalid
        if (this.userForm.invalid) {
            return;
        }
        if (this.userForm.controls['currentPassword'].value == '' && this.userForm.controls['password'].value == '') {
            this.cpassword = false;
            this.newPasswordCheck = false;
        } else if (this.userForm.controls['currentPassword'].value == '') { 
            this.cpassword = true;
            return;
        } else if(this.userForm.controls['password'].value == '') {
            this.newPasswordCheck = true;
            return;
        }
        if (this.cpassword == true) {
            if (this.userForm.controls['currentPassword'].value == '') {
                this.cpassword = true;
                return;
            } else {
                this.cpassword = false;
                this.newPasswordCheck = true;
            }
        }
        if (this.newPasswordCheck == true) {
            if (this.userForm.controls['password'].value == '') {
                return;
            } else {
                this.userForm.controls['password'].setValidators([]);
                this.newPasswordCheck = false;
                this.cpassword = true;
            }
        }
        if (this.renewPasswordCheck == true) {
            if (this.userForm.controls['confirmPassword'].value == '') {
                return;
            } else {
                this.userForm.controls['confirmPassword'].setValidators([]);
                this.renewPasswordCheck = false;
                this.newPasswordCheck = false;
                this.cpassword = false;
            }
        }
        var userData = this.userForm.value;
        userData['profilepic'] = this.profilepic;
        userData['status'] = this.userstatus;
        userData['gender'] = this.usergender;
        userData['countrycode'] = this.countrycode;
        userData['countryname'] = this.countryname;
        userData['statecode'] = this.statecode;
        userData['statename'] = this.statename;
        userData['citycode'] = this.citycode;
        userData['cityname'] = this.cityname;
        userData['category'] = this.categoryId;
        //userData['dob'] = moment(this.dob).format("YYYY-MM-DD");
        if (this.userForm.value.dob instanceof Date) {
            userData['dob'] = moment(this.userForm.value.dob, "DD-MM-YYYY").format("YYYY-MM-DD");
        } else {
            var dt = moment(this.userForm.value.dob, "DD-MM-YYYY").format("YYYY-MM-DD");
            userData['dob'] = dt;
        }

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
        userData['deleted_images'] = this.deletedImages;

        //console.log(JSON.stringify(this.userForm.value, null, 4));
        userData = JSON.stringify(userData, null, 4);
        this.userService.updateUser(this.id, userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Caterer Updated', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/caterer/list']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Update Caterer failed', life: 6000 });
            })
        );
    }

    onReset() {
        this.submitted = false;
        this.userForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/caterer/list']);
    }
}
