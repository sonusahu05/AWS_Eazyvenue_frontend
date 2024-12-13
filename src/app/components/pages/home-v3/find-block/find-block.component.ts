import { Component, OnInit } from '@angular/core';
import data from '../../../data/services/services.json';

@Component({
  selector: 'app-find-block',
  templateUrl: './find-block.component.html',
  styleUrls: ['./find-block.component.css']
})
export class FindBlockComponent implements OnInit {
  public services = data;
  constructor() { }

  ngOnInit(): void {
  }

}
