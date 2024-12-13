import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'angular-crumbs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgSelect2Module } from "ng-select2";


import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { NavigationComponent } from './navigation/navigation.component';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { AppCtaComponent } from './app-cta/app-cta.component';
import { BlueCtaComponent } from './blue-cta/blue-cta.component';
import { BlockCtaComponent } from './block-cta/block-cta.component';
import { BlogSidebarComponent } from './blog-sidebar/blog-sidebar.component';
import { UserBreadcrumbsComponent } from './user-breadcrumbs/user-breadcrumbs.component';
import { ListingSidebarComponent } from './listing-sidebar/listing-sidebar.component';
import { CanvasComponent } from './canvas/canvas.component';


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    BreadcrumbsComponent,
    NavigationComponent,
    MobileMenuComponent,
    AppCtaComponent,
    BlueCtaComponent,
    BlockCtaComponent,
    BlogSidebarComponent,
    UserBreadcrumbsComponent,
    ListingSidebarComponent,
    CanvasComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    BreadcrumbModule,
    FormsModule,
    NgSelect2Module
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    BreadcrumbsComponent,
    AppCtaComponent,
    BlueCtaComponent,
    BlockCtaComponent,
    BlogSidebarComponent,
    UserBreadcrumbsComponent,
    ListingSidebarComponent
  ],
})
export class SharedModule { }
