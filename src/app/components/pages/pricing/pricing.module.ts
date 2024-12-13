import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PricingRoutingModule } from './pricing-routing.module';
import { PricingComponent } from './pricing.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';
import { FaqsComponent } from './faqs/faqs.component';


@NgModule({
  declarations: [
    PricingComponent,
    ContentComponent,
    FaqsComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class PricingModule { }
