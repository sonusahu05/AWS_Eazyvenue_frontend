import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactUsListComponent } from './list/list.component';

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
  component: ContactUsListComponent,},
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactUsRoutingModule { }
