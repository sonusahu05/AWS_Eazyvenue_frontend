import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CareersComponent } from './careers.component';

@NgModule({
  declarations: [
    CareersComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CareersComponent }
    ]),
    ReactiveFormsModule
  ]
})
export class CareersModule { }
