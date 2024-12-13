import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
// import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'src/app/services/auth.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { TokenStorageService } from '../../services/token-storage.service';
import { RoleService } from 'src/app/services/role.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from 'src/app/_helpers/utility';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  providers: [ConfirmationService, MessageService, HeaderComponent],
})

export class SignInComponent implements OnInit {
  signUpForm: FormGroup;
  loginForm: FormGroup;
  submitted: boolean = false;
  loginFormSubmitted: boolean = false;
  genders;
  message;
  showMessage: boolean = false;
  selectedGender: any = null;
  userType;
  userData;
  isLoginFailed: boolean;
  isLoggedIn: boolean;
  roles;
  trainerRoleId;
  permissions: any[] = [];
  permissionArray: any[] = [];
  userTypeListArray: any[] = [];
  rolelist: any[] = [];
  errorMessage;;
  ipAddress;
  yearRange;
  minDateValue: Date;
  minYear = environment.minYear;
  showGenderError;
  //@ViewChild('headerComponent', { static: false }) refreshChild: HeaderComponent;
  constructor(private router: Router, private formBuilder: FormBuilder, private roleService: RoleService, private http: HttpClient, private headerComponent: HeaderComponent,
    private cd: ChangeDetectorRef,
    private tokenStorage: TokenStorageService, private authService: AuthService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.minDateValue = new Date();
    this.yearRange = this.minYear + ":" + maxYearFunction();
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.signUpForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('[A-Za-z][A-Za-z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('[A-Za-z][A-Za-z]*$')]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      password: ['', [Validators.required, Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['',],
      role: ['user'],
      userType: ['user']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
    this.genders = [
      { id: '1', name: 'Male', code: 'Male' },
      { id: '2', name: 'Female', code: 'Female' },
      { id: '3', name: 'Other', code: 'Other' },
    ];
    this.selectedGender = this.genders[0];
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.signUpForm.controls;
  }
  get loginf() {
    return this.loginForm.controls;
  }
  onGenderSelect(gender, event) {
    this.selectedGender = '';
    if (event.isTrusted) {
      this.selectedGender = gender;
    }
  }
  getRoleDetails() {
    const querystring = "filterByroleId=" + this.userData.data.userdata.role;
    this.roleService.searchRoleDetails(querystring).subscribe(
      data => {
        this.trainerRoleId = data.data.items[0]['id'];
        this.permissions = data.data.items[0]['permissions'];
        this.tokenStorage.saveUserPermissions(this.permissions);
        this.rolelist = data.data.items[0];
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }
  findIndexByIdArray(name, arrayName) {
    let index = -1;
    for (let i = 0; i < arrayName.length; i++) {
      if (arrayName[i].rolename === name) {
        index = i;
        break;
      }
    }
    return index;
  }
  getRoleList() {
    var querystring = "filterByDisable=false&filterByStatus=true";
    var rolearray = [];
    this.roleService.getRoleList(querystring).subscribe(
      data => {
        var rolelist = data.data.items;
        rolelist.forEach(element => {
          rolearray.push({ "roleid": element.id, "rolename": element.user_role_name });
        });
        if (rolearray.length > 0) {
          this.tokenStorage.saveRolelist(rolearray);
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  onSubmit(): void {
    this.loginFormSubmitted = true;
    //stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    const username = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.userType = 'user';
    //this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
    //this.ipAddress = res.ip;
    this.authService.login(username, password, this.userType).subscribe(
      data => {
        this.userData = data;
        this.tokenStorage.saveToken(this.userData.data.access_token);
        this.tokenStorage.saveUser(this.userData.data);
        this.tokenStorage.getAuthStatus(this.userData.data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.getRoleDetails();
        this.getRoleList();
        let currentUrl = '/';
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
      },


      err => {
        this.errorMessage = 'Login failed: Please check your login credentials...! ';
        this.isLoginFailed = true;
      }
    );
    //});

  }

  onSignupSubmit(): void {
    this.submitted = true;
    //stop here if form is invalid
    if (this.signUpForm.invalid) {
      return;
    }
    let userData = this.signUpForm.value;

    if (this.selectedGender == null) {
      this.showGenderError = true;
      return;
    }
    userData['gender'] = this.selectedGender.name;
    userData['role'] = 'user';
    this.authService.signUp(userData).subscribe(
      data => {
        //this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'User Added', life: 6000 });
        // setTimeout(() => {
        this.showMessage = true;
        this.message = 'User Added';
        setTimeout(() => {
          this.showMessage = false;
        }, 5000);
        this.signUpForm.reset();
        // this.userTypeError = false;
        //this.selectedGender = this.genders[0];
        this.router.navigateByUrl("/sign-in");

        //}, 5000);
      },
      ((err) => {
        this.showMessage = true;
        this.message = err.error.error;
        setTimeout(() => {
          this.showMessage = false;
        }, 5000);
        //this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add User Failed', life: 6000 });
      })
    );
  }
  // reset() {
  //   this.submitted = false;
  // }
}

