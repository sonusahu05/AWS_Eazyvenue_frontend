import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmitListingsComponent } from './submit-listings.component';

const routes: Routes = [{ path: '', component: SubmitListingsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubmitListingsRoutingModule { }
