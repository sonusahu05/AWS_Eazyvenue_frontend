import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelect2Module } from "ng-select2";
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

import { HomeV2RoutingModule } from './home-v2-routing.module';
import { HomeV2Component } from './home-v2.component';
import { SharedModule } from '../../shared/shared.module';
import { BannerComponent } from './banner/banner.component';
import { AboutTextComponent } from './about-text/about-text.component';
import { CategoryComponent } from './category/category.component';
import { ListingListComponent } from './listing-list/listing-list.component';
import { ServicesComponent } from './services/services.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { ContactBlockComponent } from './contact-block/contact-block.component';


@NgModule({
  declarations: [
    HomeV2Component,
    BannerComponent,
    AboutTextComponent,
    CategoryComponent,
    ListingListComponent,
    ServicesComponent,
    BlogPostComponent,
    ContactBlockComponent
  ],
  imports: [
    CommonModule,
    HomeV2RoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule,
    NgSelect2Module,
    FormsModule,
    NgxPaginationModule,
    RecaptchaModule, RecaptchaFormsModule
  ]
})
export class HomeV2Module { }
