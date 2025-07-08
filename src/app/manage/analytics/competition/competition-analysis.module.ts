import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Routing
import { CompetitionAnalysisRoutingModule } from './competition-analysis-routing.module';

// Components
import { CompetitionAnalysisComponent } from './competition-analysis.component';

@NgModule({
  declarations: [
    CompetitionAnalysisComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    BadgeModule,
    TooltipModule,
    ProgressSpinnerModule,
    CardModule,
    PanelModule,
    ToastModule,
    ConfirmDialogModule,
    
    // Routing
    CompetitionAnalysisRoutingModule
  ]
})
export class CompetitionAnalysisModule { }
