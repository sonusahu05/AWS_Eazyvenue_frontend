import {Component, OnDestroy} from '@angular/core';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { TokenStorageService } from './services/token-storage.service';
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnDestroy{
    subscription: Subscription;
    public loggedInUserId;
    items: MenuItem[];
    errorMessage = '';
    loggedInUser;
    username;
    profilepic;
    constructor(public app: AppComponent, public appMain: AppMainComponent, public tokenStorage: TokenStorageService, public router: Router) {}
    ngOnInit(): void {
        this.loggedInUser = this.tokenStorage.getUser();
        this.loggedInUserId = this.loggedInUser.userdata.id;
        this.username = this.loggedInUser.userdata.firstname+" "+this.loggedInUser.userdata.lastname;
        this.profilepic = this.loggedInUser.userdata.profilepic;
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    logout() {
        this.tokenStorage.isLoggedOut();
        this.router.navigateByUrl("/manage/login" );
        return false;
    }
}
