import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
//import * as moment from 'moment';
import * as moment from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
@Component({
    selector: 'app-admin-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class AdminViewComponent implements OnInit {
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
    public imageProfile;
    showProfile = false;
    statuses: any = [];
    genders: any = [];
    userstatus: any;
    usergender: any;
    selectedStatus: any;
    countryname;
    countrycode;
    statename;
    statecode;
    cityname;
    citycode;
    bDate;
    minYear = environment.minYear;
    yearRange;
    adminId;
    timeZoneArray = [];
    timeZoneOffset;
    timeZone;
    dobdt: Date;
    constructor(private userService: UserService, private commonService: CommonService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute) { }

    ngOnInit(): void {
        const timeZones = moment.tz.names();
        for (const timezone of timeZones) {
            this.timeZoneArray.push({ name: timezone, code: moment().tz(timezone).format('Z') });
        }
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
        this.getCountry();
        this.userForm = this.formBuilder.group({
            firstName: [''],
            lastName: [''],
            email: [''],
            mobileNumber: [''],
            address: [''],
            country: [''],
            state: [''],
            city: [''],
            zipcode: [''],
            status: [{ label: 'Active', value: true, disabled: true }],
            gender: [''],
            dob: [''],
            timeZone: []
        });
    }

    getUserDetails(id) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.item = data;
                console.log("🚀 ~ file: view.component.ts:94 ~ AdminViewComponent ~ getUserDetails ~ data", data)
                if (this.item) {
                    this.getStates("false", this.item['countrycode']);
                    this.userForm.get('country').setValue({ name: this.item['countryname'], code: this.item['countrycode'] });
                    if (this.item['statecode']) {
                        this.getCities("false", this.item['statecode']);
                        this.userForm.get('state').setValue({ name: this.item['statename'], code: this.item['statecode'] });
                    }
                    if (this.item['citycode']) {
                        this.userForm.get('city').setValue({ name: this.item['cityname'], code: this.item['citycode'] });
                    }
                    var bDate = moment(this.item['dob'], 'DD-MM-YYYY');
                    this.bDate = bDate.format('DD-MM-YYYY');
                    this.userForm.patchValue({
                        firstName: this.item['firstName'],
                        lastName: this.item['lastName'],
                        email: this.item['email'],
                        mobileNumber: this.item['mobileNumber'],
                        // country: this.item['country'],
                        // state: this.item['state'],
                        // city: this.item['city'],
                        zipcode: this.item['zipcode'],
                        address: this.item['address'],
                        //dob: this.item['dob'],
                    });

                    this.countrycode = this.item['countrycode'];
                    this.countryname = this.item['countryname'];
                    this.statecode = this.item['statecode'];
                    this.statename = this.item['statename'];
                    this.citycode = this.item['citycode'];
                    this.cityname = this.item['cityname'];
                    if (this.item['dob'] != null) {
                        this.userForm.get('dob').setValue(moment(this.item['dob']).format('DD/MM/YYYY'));
                        this.dobdt = this.item['dob'];
                    }
                    var statusobj;
                    if (this.item['status'] == true) {
                        statusobj = { label: 'Active', value: true };
                    } else {
                        statusobj = { label: 'In-Active', value: false };
                    }
                    this.userForm.get('status').setValue(statusobj);
                    this.userForm.get('gender').setValue({ name: this.item['gender'], code: this.item['gender'] });
                    this.userForm.get('timeZone').setValue({ name: this.item['timeZone'], code: this.item['timeZoneOffset'] });
                    if (this.item['profilepic'] != undefined) {
                        this.imageProfile = this.item['profilepic'];
                        this.showProfile = true;
                    } else {
                        this.showProfile = false;
                    }
                }
                this.userForm.get('email').disable();
                this.userForm.get('country').disable();
                this.userForm.get('state').disable();
                this.userForm.get('city').disable();
                this.userForm.get('dob').disable();
                this.userForm.get('gender').disable();
                this.userForm.get('status').disable();
                this.userForm.get('timeZone').disable();
                this.adminId = id;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    get f() {
        return this.userForm.controls;
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

    getStates(fromForm, event) {
        this.citylist = [];
        this.statecode = "";
        this.statename = "";
        this.citycode = "";
        this.cityname = "";

        if (fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.countrycode = event.value.code;
            this.countryname = event.value.name;
        } else {
            this.countrycode = event;
        }

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
        this.citycode = "";
        this.cityname = "";
        if (fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.statecode = event.value.code;
            this.statename = event.value.name;
        } else {
            this.statecode = event;
        }


        this.commonService.getCityList(this.statecode).subscribe(
            data => {
                this.citylist = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }


    backLink() {
        this.router.navigate(['/manage/admin']);
    }

    editAdmin(id) {
        this.router.navigate(['/manage/admin/' + id]);
    }

}
