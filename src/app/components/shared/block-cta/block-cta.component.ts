import { Component, OnInit } from '@angular/core';
import data from '../../data/blockcta.json';

@Component({
  selector: 'app-block-cta',
  templateUrl: './block-cta.component.html',
  styleUrls: ['./block-cta.component.css']
})
export class BlockCtaComponent implements OnInit {

  constructor() { }
  public ctablock = data;

  ngOnInit(): void {
  }

}
