import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VenueorderListComponent } from './list/list.component';
import { ViewvenueorderComponent } from './view/view.component';

// const routes: Routes = [
// {
//   path: '',
//   component: NewsLetterListComponent,
// },
// {
//   path: 'add',
//   component: AddComponent,
// },

// {path: 'edit/:id',
// component: EditComponent,},
 
// ];

const routes: Routes = [
  {path: '', component: VenueorderListComponent},
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VenueorderRoutingModule { }
