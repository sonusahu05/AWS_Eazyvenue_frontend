import { Component, OnInit } from '@angular/core';
import { CountryService } from '../service/country.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Countrylocation } from '../model/countrylocation';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  styles: [`
      :host ::ng-deep .p-dialog .product-image {
          width: 150px;
          margin: 0 auto 2rem auto;
          display: block;
      }

      @media screen and (max-width: 960px) {
          :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:last-child {
              text-align: center;
          }

          :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:nth-child(6) {
              display: flex;
          }
      }

  `],
  providers: [CountryService, ConfirmationService, MessageService, TitleCasePipe]
})
export class ListComponent implements OnInit {
  errorMessage = '';
  productDialog: boolean;
  countries: Countrylocation[];
  submitted: boolean;
  cols: any[];
  totalCountries = 0;

  constructor(private CountryService: CountryService, private router: Router, private confirmationService:ConfirmationService, private messageService: MessageService, private titlecasePipe:TitleCasePipe) { }

  ngOnInit() {


    this.cols = [
      { field: 'countryName', header: 'Name' },
      { field: 'status', header: 'Status' }
    ];

    this.refreshCountryList();
  }

  refreshCountryList() {
    var query = "filterByDisable=false";
    this.CountryService.getcountryList(query).subscribe((res) => {
      this.totalCountries = res.data.totalCount;
      this.countries = res.data.items;
    })
  }

  openNew() {
    this.router.navigateByUrl('/manage/location/country/add');

  }

  onEdit(country) {
    this.router.navigateByUrl('/manage/location/country/edit/' + country._id);
  }


  changeStatus(country){
    this.confirmationService.confirm({
        message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(country.name)) + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
           
            var countryData = '{"status":'+country.status+'}';
            this.CountryService.editCountry(countryData,country._id).subscribe(
                data => {
                    this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Country Status Updated', life: 3000});
                    this.refreshCountryList();
                },
                err => {
                this.errorMessage = err.error.message;
                }
            );
        },
        reject: () => {
          this.refreshCountryList();
        }
    });  
}

  onDelete(country) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(country.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (country.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var countryData = '{"disable":' + disableStatus + '}';
        this.CountryService.editCountry(countryData, country._id).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Country Deleted', life: 3000 });
          this.refreshCountryList();
        })
      },
      reject: () => {
      }
    });
  }
}
