import { Component, OnInit } from '@angular/core';
import data from '../../../data/locations.json';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
  public locations = data;
  constructor() { }

  ngOnInit(): void {
  }

}
