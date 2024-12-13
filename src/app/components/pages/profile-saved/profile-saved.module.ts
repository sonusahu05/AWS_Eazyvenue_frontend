import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProfileSavedRoutingModule } from './profile-saved-routing.module';
import { ProfileSavedComponent } from './profile-saved.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ProfileSavedComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ProfileSavedRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class ProfileSavedModule { }
