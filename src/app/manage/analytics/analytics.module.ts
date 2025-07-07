import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { AnalyticsMainRoutingModule } from './analytics-routing.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    AnalyticsMainRoutingModule
  ]
})
export class AnalyticsMainModule { }
