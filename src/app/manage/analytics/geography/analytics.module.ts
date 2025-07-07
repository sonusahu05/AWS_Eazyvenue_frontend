import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsTestComponent } from './analytics-test.component';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    AnalyticsTestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AnalyticsRoutingModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    CalendarModule,
    ChartModule,
    TagModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    SidebarModule,
    TooltipModule,
    RippleModule,
    DialogModule
  ]
})
export class AnalyticsModule { }
