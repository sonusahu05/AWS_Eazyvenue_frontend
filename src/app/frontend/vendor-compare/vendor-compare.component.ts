import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { CategoryService } from 'src/app/services/category.service';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-vendor-compare',
  templateUrl: './vendor-compare.component.html',
  styleUrls: ['./vendor-compare.component.scss','../compare/compare.component.css','../navigation/navigation.component.css']
})
export class VendorCompareComponent implements OnInit {

  public categoryMenuList;
  errorMessage = '';
  vendorCompareIds: string[]
  compareVendorData:any[] = [];
  constructor(private venueService: VenueService, private vendorService: VendorService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getOccasionsCategory();
    this.route.queryParams.subscribe((params) =>{
      this.vendorCompareIds = Object.values(params);
    })
    let query = "?";
    for (let index = 0; index < this.vendorCompareIds.length; index++) {
      const element = this.vendorCompareIds[index];
      if(index === 0){
        query += "id="+element;
      }else{
        query += "&id="+element;
      }
    }
    this.vendorService.getVendorsForCompare(query).subscribe(data =>{
      console.log(data);
      this.compareVendorData = data.data;
    },err =>{
      console.log(err);
      
    })
  }
  getOccasionsCategory(){
    this.venueService.getOccastionCategoryList().subscribe(res =>{
      // console.log(res);
      this.categoryMenuList = res.data
    },err => {
      this.errorMessage = err.message;
    })
  }
}