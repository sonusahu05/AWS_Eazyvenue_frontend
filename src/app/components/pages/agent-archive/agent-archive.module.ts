import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

import { AgentArchiveRoutingModule } from './agent-archive-routing.module';
import { AgentArchiveComponent } from './agent-archive.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    AgentArchiveComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    AgentArchiveRoutingModule,
    SharedModule,
    NgbModule,
    NgxPaginationModule
  ]
})
export class AgentArchiveModule { }
