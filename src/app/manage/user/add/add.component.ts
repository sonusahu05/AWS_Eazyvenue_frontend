import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { CommonService } from '../../../services/common.service';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { CustomValidators } from 'ng2-validation';
import {CalendarModule} from 'primeng/calendar';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';

@Component({
    selector: 'app-user-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class UserAddComponent implements OnInit {
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
    userRoleId;
    statuses:any=[];
    genders:any=[];
    userstatus: any;
    usergender: any;
    countryname;
    countrycode;
    statename;
    statecode;
    cityname;
    citycode;
    dob: Date;
    minYear = environment.minYear;
    yearRange;
    constructor(private roleService: RoleService, private commonService: CommonService, private userService: UserService, private formBuilder: FormBuilder, 
        private confirmationService: ConfirmationService, private messageService: MessageService, 
        private router: Router) { }

    ngOnInit(): void {
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            {label: 'Active', value: true},
            {label: 'In-Active', value: false}
        ];
        this.genders = [
            {name: 'Male', code: 'Male'},
            {name: 'Female', code: 'Female'},
            {name: 'Other', code: 'Other'},
        ];
        this.userstatus = true;
        this.userForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            email: ['', [Validators.required, Validators.email, CustomValidators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            address: [''],
            country: ['', Validators.required],
            state: [''],
            city: [''],
            zipcode: [''],
            status:[{label: 'Active', value: true}, Validators.required],
            disable:[false],
            gender:['', Validators.required],
            dob:['', Validators.required]
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
        for(let file of event.files) {
            this.uploadedFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadedFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
               this.profilepic = reader.result;
            }   
        }
    }
    
    getRoleid() {
        var querystring = "filterByroleName=user";
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

    getStates(event) {
        //var countrycode = event.value.code;
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
        if(event) {            
            this.userstatus = event.value;
        }
    }

    onGenderSelect(event) {
        if(event) {            
            this.usergender = event.name;
        }
    }

    onCitySelect(event) {
        this.cityname = event.value.name;
        this.citycode = event.value.code;     
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.userForm.invalid) {
            return;
        }
        var userData = this.userForm.value;
        userData['profilepic'] =this.profilepic;
        userData['role'] =this.userRoleId;
        userData['status'] =this.userstatus;
        userData['gender'] =this.usergender;
        userData['countrycode'] =this.countrycode;
        userData['countryname'] =this.countryname;
        userData['statecode'] =this.statecode;
        userData['statename'] =this.statename;
        userData['citycode'] =this.citycode;
        userData['cityname'] =this.cityname;
        userData['dob'] = moment(this.dob).format("YYYY-MM-DD");
        
        //alert(this.countrycode+" "+this.countryname+"  "+this.statecode+" "+this.statename);
        //display form values on success
        console.log(JSON.stringify(this.userForm.value, null, 4));
        //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.userForm.value, null, 4));
        //return;
        userData = JSON.stringify(userData, null, 4);
        this.userService.addUser(userData).subscribe(
            data => {
                this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'User Added', life: 6000});
                setTimeout(() => {
                    this.router.navigate(['/manage/user']);
                }, 2000);    
            },
            ((err) => {
                this.messageService.add({key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add User failed', life: 6000 });
            })
        );
    }

    onReset() {
        this.submitted = false;
        this.userForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/user']);
    }
}
