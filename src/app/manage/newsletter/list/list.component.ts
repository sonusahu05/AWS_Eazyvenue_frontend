import { Component, OnInit } from '@angular/core';
import { NewsLetterService } from '../service/newsletter.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import {formatDate} from '@angular/common';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { NewsLetter } from '../model/newsletter';
import { saveAs } from 'file-saver/src/FileSaver';
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
  providers: [NewsLetterService, MessageService, ConfirmationService, TitleCasePipe]
})
export class NewsLetterListComponent implements OnInit {
  paginationOption;
  productDialog: boolean;
  newsLetterList: NewsLetter[];
  donwloadnewsLetterList: any[];
  submitted: boolean;
  cols: any[];
  errorMessage: string;
  loading: boolean;
  public downloadFlg: boolean = false;
  totalRecords = 0;
  constructor(private newsLetterService: NewsLetterService, private messageService: MessageService, private titlecasePipe: TitleCasePipe, private router: Router, private confirmationService: ConfirmationService) { }
  ngOnInit() {
    this.paginationOption = environment.pagination;

    this.cols = [
      { field: 'firstName', header: 'First Name' },
      { field: 'lastName', header: 'Lasts Name' },
      { field: 'email', header: 'email' },
      { field: 'status', header: 'Status' }
    ];
    this.loadNewsLetterList();
  }

  loadNewsLetterList() {
    var query = "?filterByDisable=false";
    this.newsLetterService.getNewsLetterList(query).subscribe(
      data => {
        this.loading = false;
        this.newsLetterList = data.data.items;
        this.totalRecords = data.data.totalCount;
      },
      err => {
        this.errorMessage = err.error.message;
      });
  }

  exportExcel() {
    this.downloadFlg = true;
    this.loadNewsLetterList();
    var propertiesRemove = ['_id', 'disable', 'created_by', 'updated_at', '__v', 'updated_by'];
    this.donwloadnewsLetterList = this.newsLetterList;
    this.donwloadnewsLetterList.forEach(function (item) {
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
      const worksheet = xlsx.utils.json_to_sheet(this.donwloadnewsLetterList);
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

  onDelete(newsLetter) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(newsLetter.email)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (newsLetter.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var newsLetterData = '{"disable":' + disableStatus + '}';
        this.newsLetterService.deleteNewsLetter(newsLetter._id, newsLetterData).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'News Letter Deleted', life: 3000 });
          this.loadNewsLetterList();
        })
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }
  changeStatus(newsLetter) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(newsLetter.email)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var newsLetterData = '{"status":' + newsLetter.status + '}';
        this.newsLetterService.updateNewsLetter(newsLetter._id, newsLetterData).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Newsletter Status Updated', life: 3000 });
            this.loadNewsLetterList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.loadNewsLetterList();
      }
    });
  }
}
