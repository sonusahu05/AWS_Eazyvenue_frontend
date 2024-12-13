import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeV3Component } from './home-v3.component';

const routes: Routes = [{ path: '', component: HomeV3Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeV3RoutingModule { }
