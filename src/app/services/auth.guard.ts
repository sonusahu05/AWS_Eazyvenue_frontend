import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
  rolelist: any[];
  roleId;
  userRole;
  constructor(private authService: AuthService, private tokenStorageService: TokenStorageService, private router: Router) { }
  canActivate(
    // next: ActivatedRouteSnapshot,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    var roleArray = route.data.role;
    if (!this.tokenStorageService.isLoggedIn()) {

      this.router.navigate(['/manage/login']); // go to login if not authenticated

      return false;

    }
    var userDetails = this.tokenStorageService.getUser();
    this.userRole = userDetails.userdata.rolename;
    // Authenticate routes on the basis of role.
    if (roleArray.includes(this.userRole) != true) {
      this.router.navigate(['/access']);
      return false;
    }
    
    return true;
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
}
