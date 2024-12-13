import { Injectable, HostListener, Inject, AfterViewInit, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import $ from 'jquery';
import 'magnific-popup';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(@Inject(DOCUMENT) private document: Document) { }
  // Sticky Nav
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(_e: any) {
    if (window.pageYOffset > 100) {
      let element = <HTMLElement>document.getElementById('can-sticky');
      element.classList.add('sticky');
    } else {
      let element = <HTMLElement>document.getElementById('can-sticky');
      element.classList.remove('sticky');
    }
  }
  // navigation
  navmethod: boolean = false;
  toggleNav() {
    this.navmethod = !this.navmethod;
  }
  // Canvas
  canvasMethod: boolean = false;
  toggleCanvas() {
    this.canvasMethod = !this.canvasMethod;
  }
  // Search
  searchMethod: boolean = false;
  toggleSearch() {
    this.searchMethod = !this.searchMethod;
  }
  // // Mobile 
  open: boolean = false;
  trigger(item: { open: boolean; }) {
    item.open = !item.open;
  }
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    ($('.popup-youtube') as any).magnificPopup({
      type: 'iframe'
    });
    ($('.gallery-thumb') as any).magnificPopup({
      type: 'image',
      gallery: {
        enabled: true,
      },
      mainClass: 'mfp-fade',
    });
  }
}
