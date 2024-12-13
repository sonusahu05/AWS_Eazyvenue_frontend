import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const USER_PERMISSIONS = 'auth-user-permissions';
const ROLE_LIST = 'role_list';
const CATEGORY_LIST = 'parentcategory_list';
const COMPARE_VENUES = 'compare-venues';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor(private router: Router) {
    window.addEventListener('storage', this.handleStorageEvent, false);
  }

  handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === 'requestSyncLocalStorage') {
      this.requestSyncLocalStorage();

      localStorage.setItem('localStorageData', JSON.stringify(localStorage));
      localStorage.removeItem('localStorageData');
    } else if (event.key === 'localStorageData') {
      const localStorageData = JSON.parse(event.newValue || '{}');
      for (const key in localStorageData) {
        localStorage.setItem(key, localStorageData[key]);
      }
    }
  };

  requestSyncLocalStorage(): void {
    if (!localStorage.length) {
      const current = new Date().toLocaleTimeString();
      localStorage.setItem(
        'requestSyncLocalStorage',
        'request local storage' + current
      );
    }
  }

  signOut(): void {
    localStorage.clear();
  }

  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    this.requestSyncLocalStorage();
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public saveCompare(compare: any): void {
    localStorage.removeItem(COMPARE_VENUES);
    localStorage.setItem(COMPARE_VENUES, JSON.stringify(compare));
  }

  public saveUserPermissions(permission: any): void {
    localStorage.setItem(USER_PERMISSIONS, JSON.stringify(permission));
  }

  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : {};
  }

  public getCompareVenues(): any {
    const venue = localStorage.getItem(COMPARE_VENUES);
    return venue ? JSON.parse(venue) : {};
  }

  public removeCompare() {
    localStorage.removeItem(COMPARE_VENUES);
  }

  public saveRolelist(rolelist): void {
    localStorage.removeItem(ROLE_LIST);
    localStorage.setItem(ROLE_LIST, JSON.stringify(rolelist));
  }

  public getRolelist(): any {
    const rolelist = localStorage.getItem(ROLE_LIST);
    return rolelist ? JSON.parse(rolelist) : {};
  }

  public saveCategorylist(categorylist): void {
    localStorage.removeItem(CATEGORY_LIST);
    localStorage.setItem(CATEGORY_LIST, JSON.stringify(categorylist));
  }

  public getCategorylist(): any {
    const categorylist = localStorage.getItem(CATEGORY_LIST);
    return categorylist ? JSON.parse(categorylist) : {};
  }

  public getUserPermissions(): any {
    const permission = localStorage.getItem(USER_PERMISSIONS);
    return permission ? JSON.parse(permission) : {};
  }

  public getClient(): any {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : {};
  }

  getAuthStatus(data: any) {
    const token = this.getToken();
    const expiresAt = moment().add(data.expires_in, 'second');
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('currentUserData', JSON.stringify(data.userdata));
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  public isLoggedOut() {
    localStorage.clear();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_PERMISSIONS);
    localStorage.removeItem(ROLE_LIST);
    localStorage.removeItem(CATEGORY_LIST);

    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
}
