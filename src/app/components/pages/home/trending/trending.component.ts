import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent extends ListingHelperService {
  // Settings
  settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    autoplay: true,
    prevArrow: '.top-listings .slider-prev',
    nextArrow: '.top-listings .slider-next',
    responsive: [
      {
        breakpoint: 991,
        settings: {
          arrows: false,
        }
      },
    ]
  }
}
