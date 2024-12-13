import { Component, OnInit } from '@angular/core';
import listingcategory from '../../../assets/demo/data/category.json';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class FrontendCategoryComponent implements OnInit {
  public category = listingcategory;
  ngOnInit(): void {
  }
}
