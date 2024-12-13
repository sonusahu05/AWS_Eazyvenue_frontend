import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

import { ListingGridRoutingModule } from './listing-grid-routing.module';
import { ListingGridComponent } from './listing-grid.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ListingGridComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ListingGridRoutingModule,
    SharedModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class ListingGridModule { }
