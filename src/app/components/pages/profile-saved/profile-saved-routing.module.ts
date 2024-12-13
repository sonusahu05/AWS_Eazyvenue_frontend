import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileSavedComponent } from './profile-saved.component';

const routes: Routes = [{ path: '', component: ProfileSavedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileSavedRoutingModule { }
