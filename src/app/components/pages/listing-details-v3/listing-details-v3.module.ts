import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { ListingDetailsV3RoutingModule } from './listing-details-v3-routing.module';
import { ListingDetailsV3Component } from './listing-details-v3.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ListingDetailsV3Component,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ListingDetailsV3RoutingModule,
    SharedModule,
    NgbModule,
    SlickCarouselModule
  ]
})
export class ListingDetailsV3Module { }
