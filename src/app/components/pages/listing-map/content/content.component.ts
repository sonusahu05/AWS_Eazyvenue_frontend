import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';
import mapdata from '../../../data/listings/listing.json';
import 'leaflet';
declare let L: { icon: (arg0: { iconSize: number[]; iconAnchor: number[]; popupAnchor: number[]; iconUrl: string; }) => any; map: (arg0: string, arg1: { style: string; center: number[]; zoom: number; pitch: number; container: string; antialias: boolean; }) => any; tileLayer: (arg0: string, arg1: { attribution: string; }) => { (): any; new(): any; addTo: { (arg0: any): void; new(): any; }; }; marker: (arg0: any, arg1: { icon: any; }) => { (): any; new(): any; addTo: { (arg0: any): any; new(): any; }; }; };


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent extends ListingHelperService {
  public mapdata = mapdata;

  public icon = {
    icon: L.icon({
      iconSize: [50, 50],
      iconAnchor: [22, 41],
      popupAnchor: [2, -40],
      iconUrl: 'assets/img/misc/marker.png'
    })
  };

  ngOnInit() {
    const map = L.map('map', {
      style: 'mapbox://styles/mapbox/light-v10',
      center: [38.907, -77.04],
      zoom: 11.5,
      pitch: 45,
      container: 'map',
      antialias: true
    });
    var marker;
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
 
    for (let i = 0; i < this.mapdata.length - 1; i++) {
      marker = L.marker(this.mapdata[i].coordinates, this.icon).addTo(map);
      marker.bindPopup('<div class="mapboxgl-popup mapboxgl-popup-anchor-top"><div class="mapboxgl-popup-tip"></div><img src="' + this.mapdata[i].gridimg + '" alt="' + this.mapdata[i].title + '"/> ' +
        '<div class="acr-listing-popup-body"><h5><a href="/listing-details-v1/' + this.mapdata[i].id + '" title="' + this.mapdata[i].title + '">' + this.mapdata[i].title + '</a></h5> <span class="listing-price">' + Intl.NumberFormat().format((this.mapdata[i].price).toFixed(2)) + '$/Person</span>' +
        '<p><i class="fas fa-map-signs"></i> ' + this.mapdata[i].location + '</p> <div class="location-popup-meta"> <span><i class="flaticon-price-tags"></i>' + this.mapdata[i].model + '</span>' +
        '<span><i class="flaticon-guest"></i>' + this.mapdata[i].guest + '</span><span><i class="flaticon-seller"></i>' + this.mapdata[i].vendor + '</span> </div></div> </div>');
    }

  }
  advanceMethod: boolean = true;
  advanceBtn() {
    this.advanceMethod = !this.advanceMethod;
  }

}
