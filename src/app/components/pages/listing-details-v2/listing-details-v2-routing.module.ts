import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingDetailsV2Component } from './listing-details-v2.component';

const routes: Routes = [{ path: '', component: ListingDetailsV2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingDetailsV2RoutingModule { }
