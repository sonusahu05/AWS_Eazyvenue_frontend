import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';
import { SharedModule } from '../../shared/shared.module';
import { AboutTextComponent } from './about-text/about-text.component';
import { ServiceBlockComponent } from './service-block/service-block.component';
import { GalleryComponent } from './gallery/gallery.component';


@NgModule({
  declarations: [
    ServicesComponent,
    AboutTextComponent,
    ServiceBlockComponent,
    GalleryComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class ServicesModule { }
