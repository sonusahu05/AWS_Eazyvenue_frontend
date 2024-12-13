import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingMapComponent } from './listing-map.component';

const routes: Routes = [{ path: '', component: ListingMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingMapRoutingModule { }
