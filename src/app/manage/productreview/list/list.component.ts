import { Component, OnInit } from '@angular/core';

import { ProductreviewService } from '../service/productreview.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Productreview } from '../model/productreview';
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
  providers: [ProductreviewService, MessageService, TitleCasePipe, ConfirmationService]
})
export class ListComponent implements OnInit {
  paginationOption;
  productreviewDialog: boolean;
  productreviews: Productreview[];
  submitted: boolean;
  cols: any[];
  staticPath: string;
  userRoles: any;
  productreviewAdd: any;
  productreviewEdit: any;
  productreviewView: any;
  productreviewDelete: any;
  // picPath: any;
  public errorMessage;

  constructor(private ProductreviewService: ProductreviewService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService) { }

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
      { field: 'status', header: 'Status' },
      { field: 'approve', header: 'Approve' }
    ];


    this.refreshProductreviewList();
    this.userRoles = JSON.parse(sessionStorage.getItem("userRoles"));
    this.productreviewAdd = this.userRoles.productreview.add;
    this.productreviewEdit = this.userRoles.productreview.edit;
    this.productreviewView = this.userRoles.productreview.view;
    this.productreviewDelete = this.userRoles.productreview.delete;

  }

  refreshProductreviewList() {
    var query = 'filterByDisable=false';
    this.ProductreviewService.getproductreviewList(query).subscribe((data) => {
      this.productreviews = data;
    })


  }

  openNew() {
    this.router.navigateByUrl('/manage/customer/productreview/add');
  }

  onEdit(productreview) {
    this.router.navigateByUrl('/manage/customer/productreview/edit/' + productreview._id);
  }

  onDelete(productReview) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(productReview.customerName)) + ' review ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (productReview.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var productReviewData = '{"disable":' + disableStatus + '}';
        this.ProductreviewService.editProductreview(productReviewData, productReview._id).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Product review Deleted', life: 3000 });
          this.refreshProductreviewList();
        })
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }


  changeStatus(productReview) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(productReview.reviewHeading)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var productReviewData = '{"status":' + productReview.status + '}';
        this.ProductreviewService.editProductreview(productReviewData, productReview._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Product Review Status Updated', life: 3000 });
            this.refreshProductreviewList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshProductreviewList();
      }
    });
  }
  changeApproveStatus(productReview) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the approve status of  ' + (this.titlecasePipe.transform(productReview.reviewHeading)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var productReviewData = '{"approve":' + productReview.approve + '}';
        this.ProductreviewService.editProductreview(productReviewData, productReview._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Product Review Approve Status Updated', life: 3000 });
            this.refreshProductreviewList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshProductreviewList();
      }
    });
  }
}
