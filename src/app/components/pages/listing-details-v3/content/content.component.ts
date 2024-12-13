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
    arrows: true,
    dots: false,
    prevArrow: '.listing-banner-inner .slider-prev',
    nextArrow: '.listing-banner-inner .slider-next',
  }
}
