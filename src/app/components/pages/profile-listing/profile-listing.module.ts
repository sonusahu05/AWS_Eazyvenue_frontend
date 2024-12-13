import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProfileListingRoutingModule } from './profile-listing-routing.module';
import { ProfileListingComponent } from './profile-listing.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ProfileListingComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ProfileListingRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class ProfileListingModule { }
