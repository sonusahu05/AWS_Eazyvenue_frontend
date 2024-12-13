import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { TokenStorageService } from '../services/token-storage.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CategoryService } from '../services/category.service';
@Component({
  selector: 'app-login',
  templateUrl: './app.login.component.html',
})
export class AppLoginComponent {
  type = 'admin';
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  userData: any = {};
  roles: string[] = [];
  loading: boolean;
  public rolelist: any[] = [];
  public permissions;
  public roleId;
  parentcatList: any[] = [];
  loginform = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])

  });

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }

  onSubmit(): void {
    const username = this.loginform.value.email;
    const password = this.loginform.value.password;
    this.loading = true;
    this.authService.login(username, password, this.type).subscribe(
      data => {
        this.userData = data;
        this.tokenStorage.saveToken(this.userData.data.access_token);
        this.tokenStorage.saveUser(this.userData.data);
        this.tokenStorage.getAuthStatus(this.userData.data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getClient();
        this.getRoleList();
        this.getRoleDetails();
        this.getParentCategory();
        setTimeout(() => {
          //this.router.navigateByUrl("/manage/dashboard");
          let currentUrl = '/manage/dashboard';
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([currentUrl]);
        }, 500);
      },
      err => {
        this.errorMessage = err.error.data.message;
        this.isLoginFailed = true;
      }
    );
  }

  getParentCategory() {
    var query = "?filterByDisable=false&filterByStatus=true&getOnlyParent=true";
    this.categoryService.getCategoryList(query).subscribe(
      data => {
        this.parentcatList = data.data.items;
        this.tokenStorage.saveCategorylist(this.parentcatList);
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
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
        //console.log(this.permissions);
        this.tokenStorage.saveUserPermissions(this.permissions);
        this.rolelist = data.data.items[0];
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }
  cancel() {

  }

  reloadPage(): void {
    window.location.reload();
  }

}
