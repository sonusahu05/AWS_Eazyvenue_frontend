import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

import { ListingListRoutingModule } from './listing-list-routing.module';
import { ListingListComponent } from './listing-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ListingListComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ListingListRoutingModule,
    SharedModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class ListingListModule { }
