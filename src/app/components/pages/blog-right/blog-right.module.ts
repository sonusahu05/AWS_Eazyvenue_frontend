import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMasonryGridModule } from 'ng-masonry-grid';

import { BlogRightRoutingModule } from './blog-right-routing.module';
import { BlogRightComponent } from './blog-right.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    BlogRightComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    BlogRightRoutingModule,
    SharedModule,
    NgMasonryGridModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class BlogRightModule { }
