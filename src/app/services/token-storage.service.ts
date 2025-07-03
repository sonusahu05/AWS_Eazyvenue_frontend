import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.handleStorageEvent, false);
    }
  }

  handleStorageEvent = (event: StorageEvent): void => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!localStorage.length) {
      const current = new Date().toLocaleTimeString();
      localStorage.setItem(
        'requestSyncLocalStorage',
        'request local storage' + current
      );
    }
  }

  signOut(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.clear();
  }

  public saveToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    this.requestSyncLocalStorage();
  }

  public getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public saveCompare(compare: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(COMPARE_VENUES);
    localStorage.setItem(COMPARE_VENUES, JSON.stringify(compare));
  }

  public saveUserPermissions(permission: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(USER_PERMISSIONS, JSON.stringify(permission));
  }

  public getUser(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : {};
  }

  public getCompareVenues(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const venue = localStorage.getItem(COMPARE_VENUES);
    return venue ? JSON.parse(venue) : {};
  }

  public removeCompare() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(COMPARE_VENUES);
  }

  public saveRolelist(rolelist): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(ROLE_LIST);
    localStorage.setItem(ROLE_LIST, JSON.stringify(rolelist));
  }

  public getRolelist(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const rolelist = localStorage.getItem(ROLE_LIST);
    return rolelist ? JSON.parse(rolelist) : {};
  }

  public saveCategorylist(categorylist): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(CATEGORY_LIST);
    localStorage.setItem(CATEGORY_LIST, JSON.stringify(categorylist));
  }

  public getCategorylist(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const categorylist = localStorage.getItem(CATEGORY_LIST);
    return categorylist ? JSON.parse(categorylist) : {};
  }

  public getUserPermissions(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const permission = localStorage.getItem(USER_PERMISSIONS);
    return permission ? JSON.parse(permission) : {};
  }

  public getClient(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : {};
  }

  getAuthStatus(data: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = this.getToken();
    const expiresAt = moment().add(data.expires_in, 'second');
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('currentUserData', JSON.stringify(data.userdata));
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  public isLoggedIn() {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // Not logged in during SSR
    }
    return moment().isBefore(this.getExpiration());
  }

  public isLoggedOut() {
    if (!isPlatformBrowser(this.platformId)) {
      return true; // Always logged out during SSR
    }
    localStorage.clear();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_PERMISSIONS);
    localStorage.removeItem(ROLE_LIST);
    localStorage.removeItem(CATEGORY_LIST);

    return !this.isLoggedIn();
  }

  getExpiration() {
    if (!isPlatformBrowser(this.platformId)) {
      return moment(); // Return current moment for SSR
    }
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
}
