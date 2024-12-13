import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster'
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { SubmitListingsRoutingModule } from './submit-listings-routing.module';
import { SubmitListingsComponent } from './submit-listings.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';


@NgModule({
  declarations: [
    SubmitListingsComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
    SubmitListingsRoutingModule,
    SharedModule,
    NgbModule,
    NgxDropzoneModule,
    LeafletMarkerClusterModule,
    LeafletModule
  ]
})
export class SubmitListingsModule { }
