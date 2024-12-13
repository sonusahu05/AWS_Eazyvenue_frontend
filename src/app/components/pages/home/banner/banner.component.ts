import { Component } from '@angular/core';
import { ListingHelperService } from 'src/app/components/helper/listing-helper.service';
import data from '../../../data/banner.json';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent extends ListingHelperService {
  public bannerpost = data;
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
