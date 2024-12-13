import { Component, OnInit } from '@angular/core';

import { CmsmoduleService } from '../service/cmsmodule.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Cmsmodule } from '../model/cmsmodule';
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
  providers: [CmsmoduleService, ConfirmationService, TitleCasePipe, MessageService]
})
export class ListComponent implements OnInit {
  paginationOption;

  errorMessage: '';
  cmsmoduleDialog: boolean;
  cmsmodules: Cmsmodule[];
  submitted: boolean;
  cols: any[];
  staticPath: string;
  userRoles: any;
  cmsmoduleAdd: any;
  cmsmoduleEdit: any;
  cmsmoduleView: any;
  cmsmoduleDelete: any;
  // picPath: any;

  constructor(private CmsmoduleService: CmsmoduleService, private messageService: MessageService, private router: Router, private titlecasePipe: TitleCasePipe, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.paginationOption = environment.pagination;

    //this.staticPath =environment.productUploadUrl;
    this.cols = [
      { field: 'cmsTitle', header: 'Title' },
      { field: 'cmspageTitle', header: 'Page Title' },
      { field: 'cmsContent', header: 'Content' },
      { field: 'cmsDescription', header: 'Description' },
      { field: 'cmsImage', header: 'Image' },
      { field: 'metaKeyword', header: 'Meta Keyword' },
      { field: 'metaDescription', header: 'Meta Description' },
      { field: 'status', header: 'Status' }
    ];

    this.refreshCmsmoduleList();
    this.userRoles = JSON.parse(sessionStorage.getItem("userRoles"));
    // console.log(this.userRoles.casestudy,"RRWW");  
    // this.cmsmoduleAdd = this.userRoles.cmsmodule.add;
    // this.cmsmoduleEdit = this.userRoles.cmsmodule.edit;
    // this.cmsmoduleView = this.userRoles.cmsmodule.view;
    // this.cmsmoduleDelete = this.userRoles.cmsmodule.delete;

  }

  refreshCmsmoduleList() {
    var query = "?filterByDisable=false";
    this.CmsmoduleService.getcmsmoduleList(query).subscribe((data) => {
      this.cmsmodules = data.data.items;
    })


  }

  openNew() {
    this.router.navigateByUrl('/manage/cmsmodule/add');
  }

  onEdit(cmsmodule) {
    this.router.navigateByUrl('/manage/cmsmodule/edit/' + cmsmodule._id);
  }

  onDelete(cmsmodule) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete record ' + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var cmsData = '{"disable":true}';
        // console.log(cmsmodule._id);
        this.CmsmoduleService.editCmsmodule(cmsData, cmsmodule._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'CMS Deleted', life: 3000 });
            this.refreshCmsmoduleList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshCmsmoduleList();
      }
    });
  }

  changeStatus(cmsmodule) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(cmsmodule.cmsTitle)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var cmsData = '{"status":' + cmsmodule.status + '}';
        // console.log(cmsmodule._id);
        this.CmsmoduleService.editCmsmodule(cmsData, cmsmodule._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'CMS Status Updated', life: 3000 });
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshCmsmoduleList();
      }
    });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.cmsmodules.length; i++) {
      if (this.cmsmodules[i]['_id'] === id) {
        index = i;
        break;
      }
    }
    return index;
  }

}
