import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { ListingDetailsV2RoutingModule } from './listing-details-v2-routing.module';
import { ListingDetailsV2Component } from './listing-details-v2.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ListingDetailsV2Component,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ListingDetailsV2RoutingModule,
    SharedModule,
    NgbModule,
    SlickCarouselModule
  ]
})
export class ListingDetailsV2Module { }
