import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FaqsRoutingModule } from './faqs-routing.module';
import { FaqsComponent } from './faqs.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    FaqsComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    FaqsRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class FaqsModule { }
