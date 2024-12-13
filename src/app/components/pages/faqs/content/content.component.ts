import { Component, OnInit } from '@angular/core';
import data from '../../../data/faqs.json';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  public faqs = data;
  constructor() { }

  ngOnInit(): void {
  }

}
