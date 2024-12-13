import { Component, OnInit, ViewChild } from '@angular/core';
import { CountryService } from '../../country/service/country.service';
import { StateService } from '../../state/service/state.service';
import { CityService } from '../../city/service/city.service';
import { SubareaService } from 'src/app/services/subarea.service';
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
  subareas: any = [];
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
  constructor(private CountryService: CountryService, private stateService: StateService, private router: Router, private cityService: CityService, private subareaService: SubareaService,
    private confirmationService: ConfirmationService, private messageService: MessageService, private titlecasePipe: TitleCasePipe) { }
  ngOnInit() {
  }

  clear() {
    this.dt.filter('', 'cityname', 'contains');
    this.dt.filter('', 'statename', 'contains');
    this.dt.filter('', 'statecode', 'contains');
    this.dt.filter('', 'name', 'contains');
    this.pDropDownId.clear(null);
  }
  refreshSubareaList(event: LazyLoadEvent) {
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
    if (event.filters != undefined && event.filters["cityname"] != undefined) {
      params += "&filterByCityName=" + event.filters["cityname"].value;
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
    this.subareaService.getSubareaList(query).subscribe((res) => {
      this.loading = false;
      this.totalRecords = res.data.totalCount;
      this.subareas = res.data.items;
    })
  }

  /************************************************************* */
  openNew() {
    this.router.navigateByUrl('/manage/location/subarea/add');
  }

  onEdit(country) {
    this.router.navigateByUrl('/manage/location/subarea/edit/' + country.id);
  }

  changeStatus(subarea) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(subarea.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var subareaData = '{"status":' + subarea.status + '}';
        this.subareaService.updateSubarea(subarea.id,subareaData).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Subarea Status Updated', life: 3000 });
            this.refreshSubareaList(this.lastTableLazyLoadEvent);
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshSubareaList(this.lastTableLazyLoadEvent);
      }
    });
  }

  onDelete(subarea) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(subarea.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (subarea.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var subareaData = '{"disable":' + disableStatus + '}';
        this.subareaService.updateSubarea(subarea.id,subareaData).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Subarea Deleted', life: 3000 });
          this.refreshSubareaList(this.lastTableLazyLoadEvent);
        })
      },
      reject: () => {
        this.refreshSubareaList(this.lastTableLazyLoadEvent);
      }
    });
  }
}
