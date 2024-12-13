import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentArchiveComponent } from './agent-archive.component';

const routes: Routes = [{ path: '', component: AgentArchiveComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentArchiveRoutingModule { }
