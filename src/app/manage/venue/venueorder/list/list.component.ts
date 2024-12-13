import { Component, OnInit } from '@angular/core';
import { VenueorderService } from '../service/venueorder.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import {formatDate} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Venueorder } from '../model/venueorder';
import { saveAs } from 'file-saver/src/FileSaver';
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
    providers: [VenueorderService, MessageService, ConfirmationService, TitleCasePipe]
})
export class VenueorderListComponent implements OnInit {
    productDialog: boolean;
    venueOrderlist: Venueorder[];
    donwloadVenueOrderList: any[];
    submitted: boolean;
    cols: any[];
    errorMessage: string;
    loading: boolean;
    public downloadFlg: boolean = false;
    totalRecords = 0;
    public venueName: string;
    public venueId;
    constructor(private venueorderService: VenueorderService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService, private activatedRoute: ActivatedRoute) { }
    ngOnInit() {
        this.venueId = this.activatedRoute.snapshot.paramMap.get("venueid");
        this.cols = [
            { field: 'firstName', header: 'First Name' },
            { field: 'lastName', header: 'Lasts Name' },
            { field: 'email', header: 'email' },
            { field: 'status', header: 'Status' }
        ];
        this.loadVenueOrderList();
    }

    loadVenueOrderList() {
        var query = "?filterByDisable=false&filterByVenueId=" + this.venueId;
        this.venueorderService.getVenueorderList(query).subscribe(
            data => {
                this.loading = false;
                this.venueOrderlist = data.data.items;
                this.totalRecords = data.data.totalCount;
                if (this.totalRecords > 0) {
                    this.venueName = this.venueOrderlist[0]['venueName'];
                }
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }

    exportExcel() {
        this.downloadFlg = true;
        this.loadVenueOrderList();
        var propertiesRemove = ['_id', 'disable', 'created_by', 'updated_at', '__v', 'updated_by'];
        this.donwloadVenueOrderList = this.venueOrderlist;
        this.donwloadVenueOrderList.forEach(function (item) {
            if (item.status == true) {
                item.status = "Active";
            } else {
                item.status = "In-Active";
            }
            if (item.firstName != undefined) {
                item.firstName = item.firstName;
            } else {
                item.firstName = "";
            }
            if (item.lastName != undefined) {
                item.lastName = item.lastName;
            } else {
                item.lastName = "";
            }
            propertiesRemove.forEach(function (prop) {
                delete item[prop];
            });
        });
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.donwloadVenueOrderList);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            this.saveAsExcelFile(excelBuffer, "subscriber");
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        import("file-saver").then(FileSaver => {
            let EXCEL_TYPE =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            let EXCEL_EXTENSION = ".xlsx";
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE
            });

            let filename;
            filename = fileName + "_export_" + new Date().toLocaleDateString() + EXCEL_EXTENSION;
            // filename = fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION;
            saveAs(data, filename);
        });
    }

    onDelete(venueorder) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(venueorder.customerName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var disableStatus;
                if (venueorder.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                var venueorderData = '{"disable":' + disableStatus + '}';
                this.venueorderService.updateVenueorder(venueorder.id, venueorderData).subscribe((res) => {
                    this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Venue Order Deleted', life: 3000 });
                    this.loadVenueOrderList();
                })
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });
    }
    changeStatus(venueorder) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(venueorder.customerName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {

                var venueorderData = '{"status":' + venueorder.status + '}';
                this.venueorderService.updateVenueorder(venueorder.id, venueorderData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Venue Order Status Updated', life: 3000 });
                        this.loadVenueOrderList();
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                this.loadVenueOrderList();
            }
        });
    }
    onView(venueorder) {
        this.router.navigateByUrl('/manage/venue/order/view/' + venueorder.id);
    }
}
