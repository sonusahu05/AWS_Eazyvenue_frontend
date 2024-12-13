import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileListingComponent } from './profile-listing.component';

const routes: Routes = [{ path: '', component: ProfileListingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileListingRoutingModule { }
