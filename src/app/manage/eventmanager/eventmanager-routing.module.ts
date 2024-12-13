import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventplannerListComponent } from './list/list.component';

// const routes: Routes = [
// {
//   path: '',
//   component: ContactUsListComponent,
// },
// {
//   path: 'add',
//   component: AddComponent,
// },

// {path: 'edit/:id',
// component: EditComponent,},
 
// ];

const routes: Routes = [
  {path: '',
  component: EventplannerListComponent,},
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventplannerRoutingModule { }
