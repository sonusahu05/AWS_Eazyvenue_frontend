import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent extends ListingHelperService {
  // settings
  settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true, 
    asNavFor: '.listing-thumbnail-slider-nav'
  }
  settingsThumb = {
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.listing-thumbnail-slider-main',
    dots: false,
    arrows: false,
    centerMode: false,
    focusOnSelect: true,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
    ]
  }
}
