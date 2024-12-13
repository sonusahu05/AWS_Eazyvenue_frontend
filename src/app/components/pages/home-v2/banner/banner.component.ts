import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent extends ListingHelperService {
  settings = {
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: false,
    dots: true,
    dotsClass: "slick-dots d-flex",
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }
}
