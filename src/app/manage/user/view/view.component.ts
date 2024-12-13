import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CustomValidators } from 'ng2-validation';
import { CommonService } from '../../../services/common.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
@Component({
  selector: 'app-user-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class UserViewComponent implements OnInit {
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
    statuses:any=[];
    genders:any=[];
    userstatus: any;
    usergender: any;
    selectedStatus:any;
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
    userId;
    constructor(private userService: UserService, private commonService: CommonService, private formBuilder: FormBuilder, 
        private confirmationService: ConfirmationService, private messageService: MessageService, 
        private router: Router, private activeroute:ActivatedRoute) { }

    ngOnInit(): void {
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            {label: 'Active', value: true},
            {label: 'In-Active', value: false}
        ];
        this.genders = [
            {name: 'Male', code: 'Male'},
            {name: 'Female', code: 'Female'},
            {name: 'Other', code: 'Other'},
        ];
        this.getUserDetails(this.id);
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
                status:[{label: 'Active', value: true,  disabled: true}],
                gender:[''],
                dob:[''],
                weddingDate:[],
            });
    }
    
    getUserDetails(id) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.item = data;
                if(this.item){
                    this.countrycode = this.item['country_id'];
                    this.getCountry();
                    if(this.item['state_id'] != undefined && this.item['city_id'] != undefined) {
                        this.getStates("false", this.item['country_id']);
                        this.statecode = this.item['state_id'];
                        this.getCities("false", this.item['state_id']);
                        this.citycode = this.item['city_id'];
                    }
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
                    if(this.item['dob'] != null) {
                        this.userForm.get('dob').setValue(moment(this.item['dob']).format('DD/MM/YYYY'));
                        this.dobdt = this.item['dob'];
                    }
                    if(this.item['weddingDate'] != null) {
                        this.userForm.get('weddingDate').setValue(moment(this.item['weddingDate']).format('DD/MM/YYYY'));
                        this.weddingDt = this.item['weddingDate'];
                    }
                    var statusobj;
                    if(this.item['status'] == true) {                        
                        statusobj  ={label: 'Active', value: true};
                    } else {
                        statusobj  ={label: 'In-Active', value: false};
                    }
                    this.userForm.get('status').setValue(statusobj);
                    this.userForm.get('gender').setValue({name:  this.item['gender'], code:  this.item['gender']});
                    if(this.item['profilepic']!=undefined){
                        this.imageProfile = this.item['profilepic'];
                        this.showProfile = true;
                    } else {
                        this.showProfile = false;
                    }
                    //console.log(this.showProfile);
                }
                this.userForm.get('email').disable();
                this.userForm.get('country').disable();
                this.userForm.get('state').disable();
                this.userForm.get('city').disable();
                this.userForm.get('dob').disable();
                this.userForm.get('gender').disable();
                this.userForm.get('status').disable();
                this.userForm.get('weddingDate').disable();
                this.userId = id;
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
                this.countrylist.forEach(element => {  
                    if(element.id == this.countrycode) {
                        this.userForm.get('country').setValue({name:  element.name, id:  element.id});
                    }
                });
            },
            err => {
              this.errorMessage = err.error.message;
            }
        );        
    }

    getStates(fromForm, event) {
        this.citylist=[];
        this.statecode = "";
        this.statename = "";
        this.citycode = "";
        this.cityname = "";
        
        if(fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.countrycode = event.value.code;
            this.countryname = event.value.name;
        } else {
            this.countrycode = event;
        }
        
        this.commonService.getStateList(this.countrycode).subscribe(
            data => {
                this.statelist = data.data.items;
                this.statelist.forEach(element => { 
                    if(element.id == this.statecode) {
                        this.userForm.get('state').setValue({name:  element.name, id:  element.id});
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
        if(fromForm == "true") {
            this.userForm.get('zipcode').reset();
            this.statecode = event.value.code;  
            this.statename = event.value.name;
        } else {
            this.statecode = event;
        }
        
         
        this.commonService.getCityList(this.statecode).subscribe(
            data => {
                this.citylist = data.data.items;
                this.citylist.forEach(element => { 
                    if(element.id == this.citycode) {
                        this.userForm.get('city').setValue({name:  element.name, id:  element.id});
                    }
                });
            },
            err => {
              this.errorMessage = err.error.message;
            }
        );  
    }

    
    backLink() {
        this.router.navigate(['/manage/customer/user']);
    }
    
    editUser(id) {
        this.router.navigate(['/manage/user/'+id]);
    }

}
