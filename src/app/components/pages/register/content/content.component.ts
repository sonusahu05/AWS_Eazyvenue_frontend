import { Component, OnInit } from '@angular/core';
import data from '../../../data/extradata.json';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  public extradata = data;
  constructor() { }
  // Settings
  settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    dots: true,
    dotsClass: "d-flex slick-dots justify-content-end",
  }

  ngOnInit(): void {
  }

}
