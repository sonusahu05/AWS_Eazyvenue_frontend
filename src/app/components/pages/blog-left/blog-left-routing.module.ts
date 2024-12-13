import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogLeftComponent } from './blog-left.component';

const routes: Routes = [{ path: '', component: BlogLeftComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogLeftRoutingModule { }
