import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsTestComponent } from './analytics-test.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
  },
  {
    path: 'test',
    component: AnalyticsTestComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
