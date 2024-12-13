import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
import * as moment from 'moment';
@Component({
    selector: 'app-user-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class UserEditComponent implements OnInit {
    id;
    userForm: FormGroup;
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
    public imageProfile;
    showProfile = false;
    statuses: any = [];
    userstatus: any;
    usergender: any;
    selectedStatus: any;
    countryname;
    countrycode;
    statename;
    statecode;
    cityname;
    citycode;
    dob: Date;
    dobdt: Date;
    weddingDt: Date;
    minYear = environment.minYear;
    yearRange;
    bDate;
    constructor(private userService: UserService, private commonService: CommonService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute) { }

    ngOnInit(): void {
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.genders = [
            { name: 'Male', code: 'Male' },
            { name: 'Female', code: 'Female' },
            { name: 'Other', code: 'Other' },
        ];
        this.getUserDetails(this.id);

        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            // password: ['', [Validators.required, Validators.minLength(6)]],
            // confirmPassword: ['', Validators.required],
            // mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            // address: [''],
            // country: ['', Validators.required],
            // state: [''],
            // city: [''],
            // zipcode: [''],
            status: [''],
            gender: [''],
            dob: [],
            //weddingDate: [],
        }, {
            //validator: MustMatch('password', 'confirmPassword')
        });
    }

    getUserDetails(id) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    //this.countrycode = this.item['country_id'];
                    // this.getCountry();
                    // if(this.item['state_id'] != undefined && this.item['city_id'] != undefined) {
                    //     this.getStates("false", this.item['country_id']);
                    //     this.statecode = this.item['state_id'];
                    //     this.getCities("false", this.item['state_id']);
                    //     this.citycode = this.item['city_id'];
                    // }

                    this.userForm.patchValue({
                        firstName: this.item['firstName'],
                        lastName: this.item['lastName'],
                        email: this.item['email'],
                        // mobileNumber: this.item['mobileNumber'],
                        // country: this.item['country'],
                        // state: this.item['state'],
                        // city: this.item['city'],
                        // zipcode: this.item['zipcode'],
                        // address: this.item['address'],
                    });

                    if (this.item['dob'] != '' && this.item['dob'] != undefined) {
                        this.userForm.get('dob').setValue(moment(this.item['dob']).format('DD/MM/YYYY'));
                        this.dobdt = this.item['dob'];
                    }
                    // if(this.item['weddingDate'] != '' && this.item['weddingDate'] != undefined) {
                    //     this.userForm.get('weddingDate').setValue(moment(this.item['weddingDate']).format('DD/MM/YYYY'));
                    //     this.weddingDt = this.item['weddingDate'];
                    // }

                    var statusobj;
                    if (this.item['status'] == true) {
                        statusobj = { label: 'Active', value: true };
                    } else {
                        statusobj = { label: 'In-Active', value: false };
                    }

                    this.userForm.get('status').setValue(statusobj);
                    this.userForm.get('gender').setValue({ name: this.item['gender'], code: this.item['gender'] });
                    if (this.item['profilepic'] != undefined) {
                        this.imageProfile = this.item['profilepic'];
                        this.showProfile = true;
                    } else {
                        this.showProfile = false;
                    }
                }
                this.userForm.get('email').disable()
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    get f() {
        return this.userForm.controls;
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

    getCountry() {
        this.commonService.getCountryList().subscribe(
            data => {
                this.countrylist = data.data.items;
                this.countrylist.forEach(element => {
                    if (element.id == this.countrycode) {
                        this.userForm.get('country').setValue({ name: element.name, id: element.id });
                    }
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getStates(fromForm, event) {
        this.citylist = [];
        this.statecode = "";
        this.statename = "";
        this.citycode = "";
        this.cityname = "";

        if (fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.countrycode = event.value.id;
            this.countryname = event.value.name;
        } else {
            this.countrycode = event;
        }

        this.commonService.getStateList(this.countrycode).subscribe(
            data => {
                this.statelist = data.data.items;
                this.statelist.forEach(element => {
                    if (element.id == this.statecode) {
                        this.userForm.get('state').setValue({ name: element.name, id: element.id });
                    }
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getCities(fromForm, event) {
        this.citycode = "";
        this.cityname = "";
        if (fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.statecode = event.value.id;
            this.statename = event.value.name;
        } else {
            this.statecode = event;
        }


        this.commonService.getCityList(this.statecode).subscribe(
            data => {
                this.citylist = data.data.items;
                this.citylist.forEach(element => {
                    if (element.id == this.citycode) {
                        this.userForm.get('city').setValue({ name: element.name, id: element.id });
                    }
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    onCitySelect(event) {
        this.cityname = event.value.name;
        this.citycode = event.value.id;
        this.userForm.get('zipcode').reset();
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

    setDOB($event) {
        this.dobdt = $event; //moment($event).format("MM/DD/YYYY");
    }
    setWeddingDate($event) {
        this.weddingDt = $event; //moment($event).format("MM/DD/YYYY");
    }

    onSubmit() {
        this.submitted = true;
        if (this.userForm.invalid) {
            return;
        }
        var userData = this.userForm.value;
        //userData['profilepic'] =this.profilepic;
        userData['status'] = this.userstatus;
        userData['gender'] = this.usergender;

        if (this.dobdt != undefined) {
            userData['dob'] = moment(this.dobdt).toDate();
        }
        // if (this.weddingDt != undefined) {
        //     userData['weddingDate'] = moment(this.weddingDt).toDate();
        // }

        // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.userForm.value, null, 4));
        // return;
        //var userData = JSON.stringify(this.userForm.value, null, 4);
        userData = JSON.stringify(userData, null, 4);
        //return;
        this.userService.updateUser(this.id, userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'User Data Updated Successfully!!', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/customer/user']);
                }, 2000);
            },
            err => {
                //this.errorMessage = err.error.message;
            }
        );
    }

    onReset() {
        this.submitted = false;
        this.userForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/customer/user']);
    }
}
