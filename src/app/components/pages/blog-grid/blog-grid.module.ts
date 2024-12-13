import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMasonryGridModule } from 'ng-masonry-grid';

import { BlogGridRoutingModule } from './blog-grid-routing.module';
import { BlogGridComponent } from './blog-grid.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    BlogGridComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    BlogGridRoutingModule,
    SharedModule,
    NgMasonryGridModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class BlogGridModule { }
