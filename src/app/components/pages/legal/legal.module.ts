import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegalRoutingModule } from './legal-routing.module';
import { LegalComponent } from './legal.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    LegalComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    LegalRoutingModule,
    SharedModule
  ]
})
export class LegalModule { }
