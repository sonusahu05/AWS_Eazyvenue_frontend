import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalyticsHomeComponent } from './analytics-home.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsHomeComponent,
  },
  {
    path: 'geography',
    loadChildren: () => import('./geography/analytics.module').then(m => m.AnalyticsModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsMainRoutingModule { }
