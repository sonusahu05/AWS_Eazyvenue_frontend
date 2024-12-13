import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { ListingDetailsV1RoutingModule } from './listing-details-v1-routing.module';
import { ListingDetailsV1Component } from './listing-details-v1.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ListingDetailsV1Component,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ListingDetailsV1RoutingModule,
    SharedModule,
    NgbModule,
    SlickCarouselModule
  ]
})
export class ListingDetailsV1Module { }
