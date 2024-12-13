import { Component, OnInit } from '@angular/core';
import { EventplannerService } from '../service/eventmanager.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-eventplanner-list',
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
  providers: [EventplannerService, EventplannerService, ConfirmationService, TitleCasePipe,MessageService]
})
export class EventplannerListComponent implements OnInit {
  productDialog: boolean;
  eventPlannerList: [];
  submitted: boolean;
  cols: any[];
  errorMessage: string;
  loading: boolean;
  totalRecords = 0;
  constructor(private eventplannerService: EventplannerService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService) { }
  ngOnInit() {
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'message', header: 'Message' },
      { field: 'phoneNumber', header: 'Phone Number' },
      { field: 'status', header: 'Status' }
    ];
    this.loadEventplannerList();
  }

  loadEventplannerList() {
    var query = "?filterByDisable=false";
    this.eventplannerService.getEventplannerList(query).subscribe(
      data => {
        this.loading = false;
        this.eventPlannerList = data.data.items;
        this.totalRecords = data.data.totalCount;
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }


    onDelete(eventplanner) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(eventplanner.name)) + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          var disableStatus;
          if (eventplanner.disable == false) {
            disableStatus = true;
          } else {
            disableStatus = false;
          }
          var eventplannerData = '{"disable":' + disableStatus + '}';
          this.eventplannerService.updateEventplanner(eventplanner.id, eventplannerData).subscribe((res) => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Event Planner Deleted', life: 3000 });
            this.loadEventplannerList();
          })
        },
        reject: () => {
          //this.getUserDetails(user.id);
        }
      });
    }
}
