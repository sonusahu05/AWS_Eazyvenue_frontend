import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    LoginComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule
  ]
})
export class LoginModule { }
