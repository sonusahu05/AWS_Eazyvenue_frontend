
import { Component, OnInit, ViewChild } from '@angular/core';
//import { LocalDataSource } from 'ng2-smart-table';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;
import * as moment from "moment";
import { GalleriaModule } from 'primeng/galleria';
import { Table } from 'primeng/table';
import { Dropdown } from "primeng/dropdown";
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/api';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  styles: [`
        :host ::ng-deep .p-datatable-gridlines p-progressBar {
            width: 100%;
        }

        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }

    `],
  providers: [MessageService, ConfirmationService, TitleCasePipe, WishlistService]
})
export class WishlistComponent implements OnInit {

  productDialog: boolean;
  wishlist: any;
  submitted: boolean;
  cols: any[];
  staticPath: string;
  totalRecords: 0;
  errorMessage = '';
  loading: boolean;
  adminRoleId;
  calvalue: Date;
  ucalvalue: Date;
  dcalvalue: Date;
  statuses: any[];
  wishlistImagePath;
  public wishlistImage;
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  displayImages: boolean;
  displayImages1: boolean;
  displayCustom: boolean;
  activeIndex: number = 0;
  private lastTableLazyLoadEvent: LazyLoadEvent;
  @ViewChild("dt", { static: false }) public dt: Table;
  @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;
  constructor(private wishlistService: WishlistService, private router: Router, private titlecasePipe: TitleCasePipe, private roleService: RoleService, private messageService: MessageService, private confirmationService: ConfirmationService) { }


  ngOnInit() {

    this.wishlistImagePath = environment.uploadUrl;
    this.statuses = [
      { label: 'Active', value: true },
      { label: 'In-Active', value: false }
    ];
    this.cols = [
      { field: 'venueName', header: 'venueName' },
      { field: 'customerName', header: 'customerName' },
      { field: 'wishlist_url', header: 'Wishlist Url' },
      { field: 'wishlist_content', header: 'Content' },
      { field: 'Status', header: 'Status' }
    ];
  }


  addNewWishlist() {
    this.router.navigate(['/manage/wishlist/add']);
  }


  editWishlist(id) {
    this.router.navigate(['/manage/wishlist/' + id]);
  }




  loadWishlist(event: LazyLoadEvent) {
    this.lastTableLazyLoadEvent = event;
    var query = "?filterByDisable=false";
    var pagenumber;
    var params = "";
    if (event.first == 0) {
      pagenumber = event.first + 1;
    } else {
      pagenumber = (event.first / event.rows) + 1;
    }

    if (event.filters != undefined && event.filters["wishlist_title"] != undefined) {
      params += "&filterByWishlistTitle=" + event.filters["wishlist_title"].value;
    }

    if (event.filters != undefined && event.filters["wishlist_url"] != undefined) {
      params += "&filterByWishlistUrl=" + event.filters["wishlist_url"].value;
    }

    if (event.filters != undefined && event.filters["wishlist_content"] != undefined) {
      params += "&filterByWishlistContent=" + event.filters["wishlist_content"].value;
    }

    if (event.filters != undefined && event.filters["status"] != undefined) {
      params += "&filterByStatus=" + event.filters["status"].value;
    }

    if (event.filters != undefined && event.filters["created_at"] != undefined) {
      const createdAt = moment(event.filters["created_at"].value).format("YYYY-MM-DD");
      params += "&filterByCreatedAt=" + createdAt;
    }
    if (event.filters != undefined && event.filters["createdby"] != undefined) {
      params += "&filterByCreatedby=" + event.filters["createdby"].value;
    }
    if (event.filters != undefined && event.filters["updated_at"] != undefined) {
      const createdAt = moment(event.filters["updated_at"].value).format("YYYY-MM-DD");
      params += "&filterByUpdatedAt=" + createdAt;
    }
    if (event.filters != undefined && event.filters["updatedby"] != undefined) {
      params += "&filterByUpdatedby=" + event.filters["updatedby"].value;
    }
    if (params != undefined && params != "") {
      query += "&pageSize=" + event.rows + "&pageNumber=" + pagenumber + params;
    } else {
      query += "&pageSize=" + event.rows + "&pageNumber=" + pagenumber;
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

    // var querystring = "filterByroleName=admin";
    // this.roleService.searchRoleDetails(querystring).subscribe(
    //   data => {

    // this.adminRoleId = data.data.items[0]['id'];
    // // query += "&filterByrollId="+this.adminRoleId; 
    this.wishlistService.getWishlist(query).subscribe(
      data => {
        this.loading = false;
        this.wishlist = data.data.items;
        this.totalRecords = data.data.totalCount;
        this.wishlist.forEach(element => {
          element.created_at = new Date(element.created_at);
          element.updated_at = new Date(element.updated_at);
        });
      },
      err => {
        this.errorMessage = err.error.message;
      });
    //   },
    //       err => {
    //   this.errorMessage = err.error.message;
    // }
    //);
  }

  clear() {
    this.dt.filter('', 'wishlist_title', 'contains');
    this.dt.filter('', 'wishlist_url', 'contains');
    this.dt.filter('', 'wishlist_content', 'contains');
    this.dt.filter('', 'status', 'contains');
    this.dt.filter('', 'created_at', 'dateIs');
    this.dt.filter('', 'createdby', 'contains');
    this.dt.filter('', 'updated_at', 'dateIs');
    this.dt.filter('', 'updatedby', 'contains');
    this.calvalue = null;
    this.ucalvalue = null;
    this.dcalvalue = null;
    this.pDropDownId.clear(null);
    if (this.pDropDownId) {
      this.pDropDownId.value = '';
    }
  }

  deleteWishlist(wishlist) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(wishlist.wishlist_title)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (wishlist.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var wishlistData = '{"disable":' + disableStatus + '}';
        this.wishlistService.updateWishlist(wishlist.id, wishlistData).subscribe(res => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Wishlist Deleted Successfully', life: 6000 });
          setTimeout(() => {
            this.loadWishlist(this.lastTableLazyLoadEvent);
          }, 2000);
        },
          ((err) => {
            this.messageService.add({ key: 'toastmsg', severity: 'error', summary: "Error", detail: err.error.message, life: 6000 });
          }));
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

}
