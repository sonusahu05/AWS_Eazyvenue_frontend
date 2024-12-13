import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsLetterListComponent } from './list/list.component';

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
  {path: '',
  component: NewsLetterListComponent,},
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsLetterRoutingModule { }
