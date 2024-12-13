import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AgentDetailsRoutingModule } from './agent-details-routing.module';
import { AgentDetailsComponent } from './agent-details.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';
import { AgentsComponent } from './agents/agents.component';
import { ListingsComponent } from './listings/listings.component';


@NgModule({
  declarations: [
    AgentDetailsComponent,
    ContentComponent,
    AgentsComponent,
    ListingsComponent
  ],
  imports: [
    CommonModule,
    AgentDetailsRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class AgentDetailsModule { }
