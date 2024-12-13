import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorRoutingModule } from './error-routing.module';
import { ErrorComponent } from './error.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    ErrorComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    ErrorRoutingModule,
    SharedModule
  ]
})
export class ErrorModule { }
