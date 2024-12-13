import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    RegisterComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule
  ]
})
export class RegisterModule { }
