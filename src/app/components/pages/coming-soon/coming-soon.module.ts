import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { ComingSoonRoutingModule } from './coming-soon-routing.module';
import { ComingSoonComponent } from './coming-soon.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ComingSoonComponent
  ],
  imports: [
    CommonModule,
    ComingSoonRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule
  ]
})
export class ComingSoonModule { }
