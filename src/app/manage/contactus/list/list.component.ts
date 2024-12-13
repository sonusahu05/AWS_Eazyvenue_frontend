import { Component, OnInit } from '@angular/core';
import { ContactUsService } from '../service/contactus.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ContactUs } from '../model/contactus';
import { environment } from "./../../../../environments/environment";

@Component({
  selector: 'app-news-letter-list',
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
  providers: [ContactUsService, MessageService, ConfirmationService, TitleCasePipe]
})
export class ContactUsListComponent implements OnInit {
  paginationOption;
  productDialog: boolean;
  contactUsList: ContactUs[];
  submitted: boolean;
  cols: any[];
  errorMessage: string;
  loading: boolean;
  totalRecords = 0;
  constructor(private contactUsService: ContactUsService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService) { }
  ngOnInit() {
    this.paginationOption = environment.pagination;

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'message', header: 'Message' },
      { field: 'phoneNumber', header: 'Phone Number' },
      { field: 'status', header: 'Status' }
    ];
    this.loadNewsLetterList();
  }

  loadNewsLetterList() {
    var query = "?filterByDisable=false";
    this.contactUsService.getContactUsList(query).subscribe(
      data => {
        this.loading = false;
        this.contactUsList = data.data.items;
        this.totalRecords = data.data.totalCount;
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }


    onDelete(contactUs) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(contactUs.email)) + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          var disableStatus;
          if (contactUs.disable == false) {
            disableStatus = true;
          } else {
            disableStatus = false;
          }
          var contactUsData = '{"disable":' + disableStatus + '}';
          this.contactUsService.deleteContactUs(contactUs._id, contactUsData).subscribe((res) => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Contact Us Deleted', life: 3000 });
            this.loadNewsLetterList();
          })
        },
        reject: () => {
          //this.getUserDetails(user.id);
        }
      });
    }
}
