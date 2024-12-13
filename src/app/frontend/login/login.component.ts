import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RoleService } from 'src/app/services/role.service';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';

import { UserService } from 'src/app/services/user.service';
import { CommonService } from 'src/app/services/common.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { CustomValidators } from 'ng2-validation';
import { CalendarModule } from 'primeng/calendar';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from 'src/app/_helpers/utility';
import { ConfirmationService, MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class LoginComponent implements OnInit {

  form: any = {
    username: null,
    password: null,
    usertype: null,
  };
  // signupForm: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  userData: any = {};
  roles: string[] = [];
  userRole;
  userDetails;
  trainerRoleId;
  userType;
  permissions: any[] = [];
  permissionArray: any[] = [];
  userTypeListArray: any[] = [];
  rolelist: any[] = [];
  submitted: boolean = false;
  userTypeError: boolean = false;
  loginforms = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    usertype: new FormControl("", [Validators.required])
  });
  signupForm = new FormGroup({
    firstName: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]),
    lastName: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', Validators.required),
    mobileNumber: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
    email: new FormControl("", [Validators.required, Validators.email, CustomValidators.email]),
    userType: new FormControl("", [Validators.required])
  });
  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
      email: ['', [Validators.required, Validators.email, CustomValidators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      userType: [],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    // this.userTypeListArray = [
    //   { id: "1", type: "Trainer", status: false },
    //   { id: "2", type: "Doctor", status: false },
    //   { id: "3", type: "Clinic", status: false },
    //   { id: "4", type: "Institute", status: false },
    //   { id: "5", type: "User", status: false },
    // ];
    // this.userTypeListArray.forEach(element => {
    //   this.signupForm.addControl(element.id, new FormControl());

    // })
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.signupForm.controls;
  }
  onUserTypeSelect(event) {
    console.log(event.value);
  }
  getRoleDetails() {
    const querystring = "filterByroleName=" + this.userData.data.userdata.rolename;
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
  onSubmit(): void {
    const username = this.loginforms.value.email;
    const password = this.loginforms.value.password;
    this.userType = this.loginforms.value.usertype;
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
        this.router.navigateByUrl("/" + this.userType + "/dashboard");
      },


      err => {
        this.errorMessage = 'Login failed: Please check your login credentials...! ';
        this.isLoginFailed = true;
      }
    );
  }

  onSignupSubmit(): void {
    this.submitted = true;
    //stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }
    let userData = this.signupForm.value;
    const userType = this.signupForm.value.userType;
    if (userType == null) {
      this.userTypeError = true;
    }
    // const querystring = "filterByroleName=" + userType;
    // this.roleService.searchRoleDetails(querystring).subscribe(
    //   data => {
    //     this.rolelist = data.data.items[0];
    //   },
    //   err => {
    //     this.errorMessage = err.error.message;
    //   }
    // );
    // console.log(this.rolelist);
    // const roleidIndex = this.findIndexByIdArray(this.signupForm.value.userType , this.rolelist);
    // const roleId =this.rolelist[roleidIndex].roleid;
    // userData['role'] = roleId;

    userData['registerFrom'] = 'frontendSignup';
    this.authService.signUp(userData).subscribe(
      data => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'User Added', life: 6000 });
        setTimeout(() => {
          // console.log(this.router.navigateByUrl("/" + userType + "/dashboard"));
          this.signupForm.reset();
          this.userTypeError = false;
          this.router.navigateByUrl("/login");
        }, 2000);
      },
      ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add User Failed', life: 6000 });
      })
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



  reloadPage(): void {
    window.location.reload();
  }

}
