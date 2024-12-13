import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingDetailsV3Component } from './listing-details-v3.component';

const routes: Routes = [{ path: '', component: ListingDetailsV3Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingDetailsV3RoutingModule { }
