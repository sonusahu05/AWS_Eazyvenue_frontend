import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompetitionAnalysisComponent } from './competition-analysis.component';

const routes: Routes = [
  {
    path: '',
    component: CompetitionAnalysisComponent,
    data: {
      title: 'Competition Analysis',
      breadcrumb: 'Competition Analysis'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitionAnalysisRoutingModule { }
