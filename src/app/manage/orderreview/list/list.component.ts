import { Component, OnInit } from '@angular/core';

import { OrderreviewService } from '../service/orderreview.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Orderreview } from '../model/orderreview';
import { environment } from "./../../../../environments/environment";
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
  providers: [OrderreviewService, MessageService, TitleCasePipe, ConfirmationService]
})
export class ListComponent implements OnInit {
  paginationOption;
  orderreviewDialog: boolean;
  orderreviews: Orderreview[];
  submitted: boolean;
  cols: any[];
  staticPath: string;
  userRoles: any;
  orderreviewAdd: any;
  orderreviewEdit: any;
  orderreviewView: any;
  orderreviewDelete: any;
  // picPath: any;
  public errorMessage;
  constructor(private OrderreviewService: OrderreviewService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.paginationOption = environment.pagination;
    this.staticPath = environment.productUploadUrl;
    this.cols = [
      { field: 'sku', header: 'Sku' },
      { field: 'reviewHeading', header: 'Review Heading' },
      { field: 'customerName', header: 'Customer Name' },
      { field: 'reviewDescription', header: 'reviewDescription' },
      { field: 'reviewImage', header: 'Image' },
      { field: 'rating', header: 'Rating' },
      { field: 'email', header: 'Email' },
      { field: 'date', header: 'Date' },
      { field: 'status', header: 'Status' }
    ];


    this.refreshOrderreviewList();
    this.userRoles = JSON.parse(sessionStorage.getItem("userRoles"));
    // console.log(this.userRoles.casestudy,"RRWW");  
    // this.orderreviewAdd = this.userRoles.orderreview.add;
    // this.orderreviewEdit = this.userRoles.orderreview.edit;
    // this.orderreviewView = this.userRoles.orderreview.view;
    // this.orderreviewDelete = this.userRoles.orderreview.delete;

  }

  refreshOrderreviewList() {
    var query = 'filterByDisable=false';
    this.OrderreviewService.getorderreviewList(query).subscribe((data) => {
      this.orderreviews = data;
    })


  }

  openNew() {
    this.router.navigateByUrl('/manage/customer/orderreview/add');
  }

  onEdit(orderreview) {
    this.router.navigateByUrl('/manage/customer/orderreview/edit/' + orderreview._id);
  }

  onDelete(orderReview) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(orderReview.customerName)) + ' review ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (orderReview.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var orderReviewData = '{"disable":' + disableStatus + '}';
        this.OrderreviewService.editOrderreview(orderReviewData, orderReview._id).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Order review Deleted', life: 3000 });
          this.refreshOrderreviewList();
        })
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }

  changeStatus(orderReview) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(orderReview.reviewHeading)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var orderReviewData = '{"status":' + orderReview.status + '}';
        this.OrderreviewService.editOrderreview(orderReviewData, orderReview._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Order Review Status Updated', life: 3000 });
            this.refreshOrderreviewList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshOrderreviewList();
      }
    });
  }
}
