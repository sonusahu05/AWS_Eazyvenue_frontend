import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CountUpModule } from 'ngx-countup';
import { NgSelect2Module } from "ng-select2";

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module';
import { BannerComponent } from './banner/banner.component';
import { CategoryComponent } from './category/category.component';
import { RecentBlockComponent } from './recent-block/recent-block.component';
import { TrendingComponent } from './trending/trending.component';
import { SingleAgentComponent } from './single-agent/single-agent.component';
import { AgentsComponent } from './agents/agents.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';


@NgModule({
  declarations: [
    HomeComponent,
    BannerComponent,
    CategoryComponent,
    RecentBlockComponent,
    TrendingComponent,
    SingleAgentComponent,
    AgentsComponent,
    BlogPostComponent,
    TestimonialsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule,
    CountUpModule,
    NgSelect2Module
  ]
})
export class HomeModule { }
