import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
import { MustMatch } from '../../../_helpers/must-match.validator';
//import * as moment from 'moment';
import * as moment from 'moment-timezone';
import { isPlatformBrowser } from '@angular/common';
@Component({
    selector: 'app-admin-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class AdminEditComponent implements OnInit {
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
    bDate;
    dobdt: Date;
    yearRange;
    public defaultDate: Date = new Date(environment.defaultDate);
    minYear = environment.minYear;
    timeZoneArray = [];
    timeZoneOffset;
    timeZone;
    cpassword: boolean;
    newPasswordCheck: boolean;
    newPasswordDisable: boolean;
    services: any[] = [
        {
            name: '',
            actualPrice: 0,
            fullDayPrice: 0,
            hours4Price: 0,
            hours8Price: 0,
            hours12Price: 0,
            slug: '',
            price: ''
        }
    ];
    constructor(private userService: UserService, private commonService: CommonService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit(): void {
        const timeZones = moment.tz.names();
        for (const timezone of timeZones) {
            this.timeZoneArray.push({ name: timezone, code: moment().tz(timezone).format('Z') });
        }
        this.defaultDate.setDate(this.defaultDate.getDate() - 5);
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
        this.timeZone = moment.tz.guess();
        this.timeZoneOffset = moment().tz(this.timeZone).format('Z');
        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            // password: ['', [Validators.required, Validators.minLength(6)]],
            // confirmPassword: ['', Validators.required],
            mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            address: [''],
            country: ['', Validators.required],
            state: [''],
            city: [''],
            zipcode: [''],
            status: [''],
            gender: ['', Validators.required],
            dob: ['', Validators.required],
            timeZone: [{ name: this.timeZone, code: this.timeZoneOffset }, Validators.required],
            currentPassword: [''],
            password: [''],
            confirmPassword: [''],
            name: ['', [Validators.required]],
            contact: ['', [Validators.required]],
            googleRating: [0],
            eazyvenueRating: [0],
            responseTime: [''],
            workExperience: [''],
            deal: [''],
            shortDescription: [''],
            metaUrl: ['', [Validators.required]],
            metaDescription: [''],
            metaKeywords: [''],
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
        this.cpassword = false;
        this.newPasswordCheck = false;
        this.newPasswordDisable = true;
    }
    newPassword(event) {
        if (this.userForm.controls['password'].value != '' && this.userForm.controls['currentPassword'].value == '') {
            this.userForm.controls['currentPassword'].setValidators([Validators.required]);
            this.cpassword = true;
            this.newPasswordCheck = false;
        } else {
            this.cpassword = false;
        }
    }
    newPasswordValidation(event) {
        this.userForm.get('password').enable()
        this.userForm.get('confirmPassword').enable()
        if (this.userForm.controls['currentPassword'].value != '' && this.userForm.controls['password'].value == '') {
            this.userForm.controls['password'].setValidators([Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]);
            this.newPasswordCheck = true;
            this.cpassword = false;
        } else {
            this.newPasswordCheck = false;
        }
    }
    getUserDetails(id) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.item = data;
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
                        dob: this.bDate,
                    });

                    // Add new field assignments
                    this.userForm.controls.name.setValue(this.item['name'] || '');
                    this.userForm.controls.contact.setValue(this.item['contact'] || '');
                    this.userForm.controls.googleRating.setValue(this.item['googleRating'] || 0);
                    this.userForm.controls.eazyvenueRating.setValue(this.item['eazyvenueRating'] || 0);
                    this.userForm.controls.responseTime.setValue(this.item['responseTime'] || '');
                    this.userForm.controls.workExperience.setValue(this.item['workExperience'] || '');
                    this.userForm.controls.deal.setValue(this.item['deal'] || '');
                    this.userForm.controls.shortDescription.setValue(this.item['shortDescription'] || '');
                    this.userForm.controls.metaUrl.setValue(this.item['metaUrl'] || '');
                    this.userForm.controls.metaDescription.setValue(this.item['metaDescription'] || '');
                    this.userForm.controls.metaKeywords.setValue(this.item['metaKeywords'] || '');
                    
                    // Load services
                    if (this.item['services']) {
                        this.services = this.item['services'];
                    }

                    this.countrycode = this.item['countrycode'];
                    this.countryname = this.item['countryname'];
                    this.statecode = this.item['statecode'];
                    this.statename = this.item['statename'];
                    this.citycode = this.item['citycode'];
                    this.cityname = this.item['cityname'];
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
                this.userForm.get('password').disable()
                this.userForm.get('confirmPassword').disable()
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
        // SSR-compatible file upload handling
        if (!isPlatformBrowser(this.platformId)) {
            // In SSR, we can't use FileReader, but we can still store the file reference
            // The actual file reading will happen when the component is hydrated in the browser
            console.log('File upload handling deferred for SSR compatibility');
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
        
        // Note: FileReader is browser-only API, protected with platform check for SSR compatibility
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

    onCitySelect(event) {
        this.cityname = event.value.name;
        this.citycode = event.value.code;
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

    onTimezoneSelect(event) {
        this.timeZone = event.name;
        this.timeZoneOffset = event.code;
    }

    setDOB($event) {
        this.dobdt = $event; //moment($event).format("MM/DD/YYYY");
    }

    addService() {
        this.services.push({
            name: '',
            actualPrice: 0,
            fullDayPrice: 0,
            hours4Price: 0,
            hours8Price: 0,
            hours12Price: 0,
            slug: '',
            price: ''
        });
    }

    removeService(index: number) {
        this.services.splice(index, 1);
    }

    generateSlug(serviceName: string): string {
        return serviceName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    onSubmit() {
        this.submitted = true;
        if (this.userForm.invalid) {
            return;
        }
        var userData = this.userForm.value;
        userData['name'] = this.userForm.get('name')?.value;
        userData['contact'] = this.userForm.get('contact')?.value;
        userData['googleRating'] = this.userForm.get('googleRating')?.value || 0;
        userData['eazyvenueRating'] = this.userForm.get('eazyvenueRating')?.value || 0;
        userData['responseTime'] = this.userForm.get('responseTime')?.value || '';
        userData['workExperience'] = this.userForm.get('workExperience')?.value || '';
        userData['deal'] = this.userForm.get('deal')?.value || '';
        userData['shortDescription'] = this.userForm.get('shortDescription')?.value || '';
        userData['metaUrl'] = this.userForm.get('metaUrl')?.value;
        userData['metaDescription'] = this.userForm.get('metaDescription')?.value || '';
        userData['metaKeywords'] = this.userForm.get('metaKeywords')?.value || '';
        // Process services
        userData['services'] = this.services.map(service => ({
            ...service,
            slug: this.generateSlug(service.name),
            price: `${service.fullDayPrice} Full Day`,
            hours12Price: service.actualPrice * 3 // or your calculation logic
        }));
        // Calculate min vendor price
        const prices = this.services.map(s => s.actualPrice).filter(p => p > 0);
        userData['minVendorPrice'] = prices.length > 0 ? Math.min(...prices) : 0;
        // Add missing fields with default values
        userData['availableInCities'] = [];
        userData['views'] = 0;
        userData['disable'] = false;
        userData['profilepic'] = this.profilepic;
        userData['status'] = this.userstatus;
        userData['countrycode'] = this.countrycode;
        userData['countryname'] = this.countryname;
        userData['statecode'] = this.statecode;
        userData['statename'] = this.statename;
        userData['citycode'] = this.citycode;
        userData['cityname'] = this.cityname;
        userData['gender'] = this.usergender;
        userData['timeZone'] = this.timeZone;
        userData['timeZoneOffset'] = this.timeZoneOffset;
        if (this.userForm.value.dob instanceof Date) {
            userData['dob'] = moment(this.userForm.value.dob, "DD-MM-YYYY").format("YYYY-MM-DD");
        } else {
            var dt = moment(this.userForm.value.dob, "DD-MM-YYYY").format("YYYY-MM-DD");
            userData['dob'] = dt;
        }
        userData = JSON.stringify(userData, null, 4);
        this.userService.updateUser(this.id, userData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Admin Data Updated Successfully!!', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/dashboard']);
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
        this.router.navigate(['/manage/admin']);
    }
}
