import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgSelect2Module } from "ng-select2";
import { CountUpModule } from "ngx-countup";

import { HomeV3RoutingModule } from './home-v3-routing.module';
import { HomeV3Component } from './home-v3.component';
import { SharedModule } from '../../shared/shared.module';
import { BannerComponent } from './banner/banner.component';
import { WhyUsComponent } from './why-us/why-us.component';
import { AboutTextComponent } from './about-text/about-text.component';
import { LocationsComponent } from './locations/locations.component';
import { RecentBlockComponent } from './recent-block/recent-block.component';
import { FindBlockComponent } from './find-block/find-block.component';
import { AgentsComponent } from './agents/agents.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { ClientsComponent } from './clients/clients.component';


@NgModule({
  declarations: [
    HomeV3Component,
    BannerComponent,
    WhyUsComponent,
    AboutTextComponent,
    LocationsComponent,
    RecentBlockComponent,
    FindBlockComponent,
    AgentsComponent,
    TestimonialsComponent,
    ClientsComponent
  ],
  imports: [
    CommonModule,
    HomeV3RoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule,
    NgSelect2Module,
    CountUpModule
  ]
})
export class HomeV3Module { }
