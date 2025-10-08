import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth.service';
import { MustMatch } from '../_helpers/must-match.validator';
import { CustomValidators } from 'ng2-validation';
import * as moment from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../_helpers/utility';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-signup',
    templateUrl: './venue-signup.component.html',
    styleUrls: ['./vanue-signup.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class SignupComponent implements OnInit {
    userForm: FormGroup;
    errorMessage = '';
    submitted = false;
    uploadedFiles: any[] = [];
    file: File;
    countrylist: any = [];
    statelist: any = [];
    citylist: any = [];
    reader: FileReader;
    public profilepic;
    venueOwnerRoleId;
    statuses: any = [];
    genders: any = [];
    userstatus: any;
    usergender: any;
    countryname;
    countrycode;
    statename;
    statecode;
    cityname;
    citycode;
    public defaultDate: Date = new Date(environment.defaultDate);
    minYear = environment.minYear;
    yearRange;
    timeZoneArray = [];
    timeZoneOffset;
    timeZone;

    constructor(
        private roleService: RoleService,
        private commonService: CommonService,
        private userService: UserService,
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        const timeZones = moment.tz.names();
        for (const timezone of timeZones) {
            this.timeZoneArray.push({ name: timezone, code: moment().tz(timezone).format('Z') });
        }
        this.defaultDate.setDate(this.defaultDate.getDate() - 5);
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.genders = [
            { name: 'Male', code: 'Male' },
            { name: 'Female', code: 'Female' },
            { name: 'Other', code: 'Other' },
        ];
        this.userstatus = true;
        this.timeZone = moment.tz.guess();
        this.timeZoneOffset = moment().tz(this.timeZone).format('Z');
        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            country: ['', Validators.required],
            gender: ['', Validators.required]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
        this.getRoleid();
        this.getCountry();
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.userForm.controls;
    }

    picUploader(event) {
        // Only process file uploads in browser environment
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        for (let file of event.files) {
            this.uploadedFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadedFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
                this.profilepic = reader.result;
            }
        }
    }

    getRoleid() {
        var querystring = "filterByroleName=venueowner";
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.venueOwnerRoleId = data.data.items[0]['id'];
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

    getStates(event) {
        this.countryname = event.value.name;
        this.countrycode = event.value.code;
        this.commonService.getStateList(this.countrycode).subscribe(
            data => {
                this.statelist = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getCities(event) {
        this.statename = event.value.name;
        this.statecode = event.value.code;
        this.commonService.getCityList(this.statecode).subscribe(
            data => {
                this.citylist = data.data.items;
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

    onTimezoneSelect(event) {
        this.timeZone = event.name;
        this.timeZoneOffset = event.code;
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.userForm.invalid) {
            return;
        }

        // Prepare data in the format expected by the auth service
        var userData = {
            firstName: this.userForm.value.firstName,
            lastName: this.userForm.value.lastName,
            email: this.userForm.value.email,
            password: this.userForm.value.password,
            mobileNumber: this.userForm.value.mobileNumber,
            gender: this.usergender,
            userType: 'venueowner', // This should match the role name in your backend
            registerFrom: 'web', // Add registration source
            countrycode: this.countrycode,
            countryname: this.countryname,
        };

        this.authService.signUp(userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Registration Complete', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.error || 'Registration failed', detail: 'Please try again', life: 6000 });
            })
        );
    }

    onReset() {
        this.submitted = false;
        this.userForm.reset();
    }

    backToLogin() {
        this.router.navigate(['/manage/login']);
    }
}
