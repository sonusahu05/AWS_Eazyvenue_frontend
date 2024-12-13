import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompareRoutingModule } from './compare-routing.module';
import { CompareComponent } from './compare.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    CompareComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    CompareRoutingModule,
    SharedModule
  ]
})
export class CompareModule { }
