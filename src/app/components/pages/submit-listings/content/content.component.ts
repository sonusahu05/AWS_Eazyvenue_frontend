import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  files: File[] = [];
  options: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  onSelect(event: { addedFiles: any; }) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: File) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  ngOnInit(): void {
    // Only initialize map options in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Dynamically import Leaflet only in browser
    this.loadLeafletOptions();
  }

  private async loadLeafletOptions() {
    try {
      const L = await import('leaflet') as any;
      
      this.options = {
        layers: [
          L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 18, 
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          })
        ],
        zoom: 5,
        center: L.latLng(46.879966, -121.726909)
      };
    } catch (error) {
      console.warn('Leaflet failed to load:', error);
    }
  }
}
