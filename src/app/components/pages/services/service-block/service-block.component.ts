import { Component, OnInit } from '@angular/core';
import data from '../../../data/services/services.json';

@Component({
  selector: 'app-service-block',
  templateUrl: './service-block.component.html',
  styleUrls: ['./service-block.component.css']
})
export class ServiceBlockComponent implements OnInit {
  public services = data;
  constructor() { }

  ngOnInit(): void {
  }

}
