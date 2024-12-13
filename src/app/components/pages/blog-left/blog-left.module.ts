import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMasonryGridModule } from 'ng-masonry-grid';

import { BlogLeftRoutingModule } from './blog-left-routing.module';
import { BlogLeftComponent } from './blog-left.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    BlogLeftComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    BlogLeftRoutingModule,
    SharedModule,
    NgMasonryGridModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class BlogLeftModule { }
