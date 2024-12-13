import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';

@Component({
  selector: 'app-recent-block',
  templateUrl: './recent-block.component.html',
  styleUrls: ['./recent-block.component.css']
})
export class RecentBlockComponent extends ListingHelperService {
  // Settings
  settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '.listings .slider-prev',
    nextArrow: '.listings .slider-next',
    dots: false,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  }
}
