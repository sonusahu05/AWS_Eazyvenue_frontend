import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeV2Component } from './home-v2.component';

const routes: Routes = [{ path: '', component: HomeV2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeV2RoutingModule { }
