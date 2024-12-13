import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RoleService } from 'src/app/services/role.service';
@Component({
  selector: 'admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  userData: any = {};
  roles: string[] = [];
  userType;
  public roleId;
  public permissions;
  public rolelist: any[];
  loginform = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])

  });

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
  ) { }

  ngOnInit(): void {


    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
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

  getRoleDetails() {
    const querystring = "filterByroleName=" + this.userData.data.userdata.rolename;
    this.roleService.searchRoleDetails(querystring).subscribe(
      data => {
        this.roleId = data.data.items[0]['id'];
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
    const username = this.loginform.value.email;
    const password = this.loginform.value.password;
    const userType = 'admin';
    this.authService.login(username, password, userType).subscribe(
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

        this.router.navigateByUrl("/manage/dashboard");
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }

  cancel() {

  }

  reloadPage(): void {
    window.location.reload();
  }

}
