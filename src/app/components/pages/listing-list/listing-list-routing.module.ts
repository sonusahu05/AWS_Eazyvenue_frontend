import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListingListComponent } from './listing-list.component';

const routes: Routes = [{ path: '', component: ListingListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingListRoutingModule { }
