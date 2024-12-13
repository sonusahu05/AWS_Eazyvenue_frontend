import { Component, OnInit } from '@angular/core';
import listingblock from '../../../assets/demo/data/listing.json';

@Component({
  selector: 'app-recent-block',
  templateUrl: './recent-block.component.html',
  styleUrls: ['./recent-block.component.css']
})

export class RecentBlockComponent implements OnInit {
  val1: number;

  val2: number = 3;

  val3: number = 5;

  val4: number = 5;

  val5: number;

  msg: string;
  // Settings

  public listingblock;
  ngOnInit(): void {
    this.listingblock  = listingblock;
     console.log(this.listingblock);
  }

  public getRecentListing() {
    var elems = this.listingblock.filter((listing: { timestamp: number | any; postdate: string | number | Date; }) => {
      return listing.timestamp < new Date(listing.postdate);
    });
    return elems;
  }
}
