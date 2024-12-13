import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingDetailsV1Component } from './listing-details-v1.component';

const routes: Routes = [{ path: '', component: ListingDetailsV1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingDetailsV1RoutingModule { }
