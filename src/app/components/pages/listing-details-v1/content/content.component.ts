import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent extends ListingHelperService {
  // Settings
  settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    fade: true,
    prevArrow: '.banner .slider-prev',
    nextArrow: '.banner .slider-next',
  };

}
