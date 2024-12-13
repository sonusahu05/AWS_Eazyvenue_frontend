import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CountUpModule } from 'ngx-countup';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { SharedModule } from '../../shared/shared.module';
import { AboutTextComponent } from './about-text/about-text.component';
import { CounterComponent } from './counter/counter.component';
import { AgentsComponent } from './agents/agents.component';
import { VideoComponent } from './video/video.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
 

@NgModule({
  declarations: [
    AboutComponent,
    AboutTextComponent,
    CounterComponent,
    AgentsComponent,
    VideoComponent,
    TestimonialsComponent
  ],
  imports: [
    CommonModule,
    AboutRoutingModule,
    SharedModule,
    SlickCarouselModule,
    NgbModule,
    CountUpModule
  ]
})
export class AboutModule { }
