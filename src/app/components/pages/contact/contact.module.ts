import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

import { ContactRoutingModule } from './contact-routing.module';
import { ContactComponent } from './contact.component';
import { SharedModule } from '../../shared/shared.module';
import { ContentComponent } from './content/content.component';
import { IconsComponent } from './icons/icons.component';


@NgModule({
  declarations: [
    ContactComponent,
    ContentComponent,
    IconsComponent
  ],
  imports: [
    CommonModule,
    ContactRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    RecaptchaModule, RecaptchaFormsModule
  ]
})
export class ContactModule { }
