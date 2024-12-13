import { Component, Injectable, AfterContentInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import agents from '../../../assets/demo/data/agents.json';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.css']
})
export class AgentsComponent  implements AfterContentInit, OnInit {
  page: number = 1;
  public agentblock = agents;
  public agentdetails = agents;
  settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '.agents .slider-prev',
    nextArrow: '.agents .slider-next',
    dots: false,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }
  constructor( private route: ActivatedRoute) {

  }
  // Agent Details
  public setAgent(id: any) {
    this.agentdetails = agents.filter((item: { id: any; }) => { return item.id == id });
  }
  ngAfterContentInit(): void {
    this.setAgent(this.route.snapshot.params.id);
  }
  ngOnInit(): void {
  }
}
