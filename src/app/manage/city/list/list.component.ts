import { Component, OnInit, ViewChild } from '@angular/core';
import { CountryService } from '../../country/service/country.service';
import { StateService } from '../../state/service/state.service';
import { CityService } from '../service/city.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { environment } from "./../../../../environments/environment";
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Dropdown } from "primeng/dropdown";
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
  providers: [StateService, ConfirmationService, MessageService, TitleCasePipe]
})
export class ListComponent implements OnInit {
  cities: any = [];
  errorMessage: String;
  submitted: boolean;
  public downloadFlg: boolean = false;
  public paginationOption = environment.pagination;
  public totalRecords: 0;
  public loading: boolean;
  private lastTableLazyLoadEvent: LazyLoadEvent;
  public statuses = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  @ViewChild("dt", { static: false }) public dt: Table;
  @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;
  constructor(private CountryService: CountryService, private stateService: StateService, private router: Router, private cityService: CityService,
    private confirmationService: ConfirmationService, private messageService: MessageService, private titlecasePipe: TitleCasePipe) { }
  ngOnInit() {
  }

  clear() {
    this.dt.filter('', 'countryname', 'contains');
    this.dt.filter('', 'countrycode', 'contains');
    this.dt.filter('', 'statename', 'contains');
    this.dt.filter('', 'statecode', 'contains');
    this.dt.filter('', 'name', 'contains');
    this.pDropDownId.clear(null);
  }
  refreshCityList(event: LazyLoadEvent) {
    var query = "filterByDisable=false";
    this.lastTableLazyLoadEvent = event;
    var pagenumber = 1;
    var params = "";
    var rows;
    if (event.first != undefined && event.first == 0) {
      pagenumber = event.first + 1;
    } else if (event.first != undefined && event.first > 0) {
      pagenumber = (event.first / event.rows) + 1;
    } else {
      pagenumber = 1;
    }
    if (event.rows != undefined) {
      rows = event.rows;
    } else {
      rows = 10;
    }

    // if (this.searchby != undefined && this.startDate != undefined && this.endDate != undefined){
    //   params += "&filterByDate="+this.searchby.value;
    //   params += "&filterByStartDate="+moment(this.startDate).format("YYYY-MM-DD");
    //   params += "&filterByEndDate="+moment(this.endDate).format("YYYY-MM-DD");
    // }
    if (event.filters != undefined && event.filters["countryname"] != undefined) {
      params += "&filterByCountryName=" + event.filters["countryname"].value;
    }
    if (event.filters != undefined && event.filters["countrycode"] != undefined) {
      params += "&filterByCountryCode=" + event.filters["countrycode"].value;
    }
    if (event.filters != undefined && event.filters["statename"] != undefined) {
      params += "&filterByStateName=" + event.filters["statename"].value;
    }
    if (event.filters != undefined && event.filters["statecode"] != undefined) {
      params += "&filterByStateCode=" + event.filters["statecode"].value;
    }
    if (event.filters != undefined && event.filters["name"] != undefined) {
      params += "&filterByName=" + event.filters["name"].value;
    }
    if (event.filters != undefined && event.filters["status"] != undefined) {
      params += "&filterByStatus=" + event.filters["status"].value;
    }
    // at the time of download hide pagination option
    if (this.downloadFlg == false) {
      if (params != undefined && params != "") {
        query += "&pageSize=" + rows + "&pageNumber=" + pagenumber + params;
      } else {
        query += "&pageSize=" + rows + "&pageNumber=" + pagenumber;
      }
    } else {
      if (params != undefined && params != "") {
        query += params;
      }
    }
    if (event.sortField != undefined && event.sortOrder != undefined) {
      var orderBy = "";
      if (event.sortOrder == 1) {
        orderBy = "DESC";
      } else {
        orderBy = "ASC";
      }
      query += "&sortBy=" + event.sortField + "&orderBy=" + orderBy;
    }
    //query += "&orderBy=ASC";
    this.cityService.getcityList(query).subscribe((res) => {
      this.loading = false;
      this.totalRecords = res.data.totalCount;
      this.cities = res.data.items;
    })
  }

  /************************************************************* */
  openNew() {
    this.router.navigateByUrl('/manage/location/city/add');
  }

  onEdit(country) {
    this.router.navigateByUrl('/manage/location/city/edit/' + country.id);
  }

  changeStatus(city){
    this.confirmationService.confirm({
        message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(city.name)) + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
           
            var cityData = '{"status":'+city.status+'}';
            this.cityService.editcity(cityData, city.id).subscribe(
                data => {
                    this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'City Status Updated', life: 3000});
                    this.refreshCityList(this.lastTableLazyLoadEvent);
                },
                err => {
                this.errorMessage = err.error.message;
                }
            );
        },
        reject: () => {
          this.refreshCityList(this.lastTableLazyLoadEvent);
        }
    });  
}

  onDelete(city) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(city.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (city.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var cityData = '{"disable":' + disableStatus + '}';
        this.cityService.editcity(cityData, city.id).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'City Deleted', life: 3000 });
        })
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }
}
