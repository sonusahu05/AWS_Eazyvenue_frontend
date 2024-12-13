import {Component, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from "@angular/router";
import {ConfirmationService, MessageService} from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import {LazyLoadEvent} from 'primeng/api';
import { environment } from 'src/environments/environment';
import { Dropdown } from "primeng/dropdown";
import {saveAs} from 'file-saver/src/FileSaver';
import {maxYearFunction } from '../../_helpers/utility';
import * as moment from "moment";
@Component({
    templateUrl: './subcategory.component.html',
    styleUrls: ['./subcategory.component.scss'],
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
    providers: [MessageService, ConfirmationService, TitleCasePipe]
})
export class SubcategoryComponent implements OnInit {
    errorMessage = '';
    statuses: any[];
    searchBy: any[];
    rowGroupMetadata: any;
    totalRecords: 0;
    virtualDatabase: any;
    categoryList: any;
    userdetail: any;
    public item: any[] = [];
    loading: boolean;
    paginationOption;
    private lastTableLazyLoadEvent: LazyLoadEvent;
    calvalue: Date;
    ucalvalue: Date;
    yearRange;
    minYear = environment.minYear;
    startDate:Date;
    endDate: Date;
    downloadFlg : boolean;
    downloadCategoryList: any;
    searchby;
    categoryDetail: any;
    @ViewChild("dt", { static: false }) public dt: Table;
    @ViewChild("pDropDownId", {static: false}) pDropDownId: Dropdown;
    constructor(
        private categoryService: CategoryService, 
        private titlecasePipe: TitleCasePipe, 
        private router: Router,
        private route:ActivatedRoute, 
        private messageService: MessageService, 
        private confirmationService: ConfirmationService) {}

    ngOnInit() {
        this.paginationOption= environment.pagination;
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            {label: 'Active', value: true},
            {label: 'In-Active', value: false}
        ];
        this.searchBy = [
            {label: 'Created On', value: "created_at"},
            {label: 'Last Modified On', value: "updated_at"}
        ];
        this.downloadFlg = false;
    }

    clear() {
        this.startDate = null;
        this.endDate = null;
        this.searchby = '';
        this.dt.filter('', 'name', 'contains');
        this.dt.filter('', 'parent_category', 'contains');
        this.dt.filter('', 'created_at', 'dateIs');
        this.dt.filter('', 'createdby', 'contains');
        this.dt.filter('', 'updated_at', 'dateIs');
        this.dt.filter('', 'updatedby', 'contains');
        this.calvalue=null;
        this.ucalvalue=null;
        this.pDropDownId.clear(null);
        if (this.pDropDownId) {
            this.pDropDownId.value = '';
        }
    }

    loadCategory(event: LazyLoadEvent){
        this.lastTableLazyLoadEvent = event;
        var query="?filterByDisable=false&filterByLevel=2";
        var pagenumber;
        var params="";
        var rows;
        if(event.first != undefined && event.first == 0) {
            pagenumber = event.first + 1;
        } else if(event.first != undefined && event.first > 0){
            pagenumber = (event.first / event.rows) + 1;
        } else {
            pagenumber = 1;
        }
        if(event.rows != undefined) {
            rows= event.rows;
        } else {
            rows = 10;
        }

        if (this.searchby != undefined && this.startDate != undefined && this.endDate != undefined){
            params += "&filterByDate="+this.searchby.value;
            params += "&filterByStartDate="+moment(this.startDate).format("YYYY-MM-DD");
            params += "&filterByEndDate="+moment(this.endDate).format("YYYY-MM-DD");
        }
        if (event.filters != undefined && event.filters["name"] != undefined){
            params += "&filterByname="+event.filters["name"].value;
        }
        if (event.filters != undefined && event.filters["parent_category"] != undefined){
            params += "&filterByParentCategory="+event.filters["parent_category"].value;
        }
        if (event.filters != undefined && event.filters["status"] != undefined){
            params += "&filterByStatus="+event.filters["status"].value;
        }
        if (event.filters != undefined && event.filters["created_at"] != undefined){
            const createdAt = moment(event.filters["created_at"].value).format("YYYY-MM-DD");
            params += "&filterByCreatedAt="+createdAt;
        }
        if (event.filters != undefined && event.filters["createdby"] != undefined){
            params += "&filterByCreatedby="+event.filters["createdby"].value;
        }
        if (event.filters != undefined && event.filters["updated_at"] != undefined){
            const createdAt = moment(event.filters["updated_at"].value).format("YYYY-MM-DD");
            params += "&filterByUpdatedAt="+createdAt;
        }
        if (event.filters != undefined && event.filters["updatedby"] != undefined){
            params += "&filterByUpdatedby="+event.filters["updatedby"].value;
        }
         // at the time of download hide pagination option
         if(this.downloadFlg == false) {
            if(params != undefined && params!="") {
                query += "&pageSize="+rows+"&pageNumber="+pagenumber+params;
            } else {
                query += "&pageSize="+rows+"&pageNumber="+pagenumber;
            }
        } else {
            if(params != undefined && params!="") {
                query += params;
            }
        }

        if(event.sortField != undefined && event.sortOrder!= undefined) {
            var orderBy="";
            if(event.sortOrder == 1) {
                orderBy = "DESC";
            } else {
                orderBy = "ASC";
            }
            query += "&sortBy="+event.sortField+"&orderBy="+orderBy;
        }
        this.categoryService.getCategoryList(query).subscribe(
            data => {
                this.loading = false;
                this.categoryList = data.data.items;
                this.totalRecords = data.data.totalCount;
                this.categoryList.forEach(element => {
                    element.created_at = new Date(element.created_at);
                    element.updated_at = new Date(element.updated_at);

                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    deleteCategory(category) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(category.name)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var disableStatus;
                if(category.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                var userData = '{"disable":'+disableStatus+'}';
                this.categoryService.updateCategory(category.id,userData).subscribe(
                    data => {
                        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000});
                        this.loadCategory(this.lastTableLazyLoadEvent);
                    },
                    err => {
                    this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {

            }
        });
    }

    func(prop, val) {
        var jsonStr = '{"'+prop+'":"'+val+'"}';
        return JSON.parse(jsonStr);
    }

    addNewCategory(){
        this.router.navigate(['/manage/category/subcategory/add']);
    }

    editCategory(id) {
        this.router.navigate(['/manage/category/subcategory/'+id]);
    }


    viewCategory(id) {
        this.router.navigate(['/manage/category/subcategory/view/'+id]);
    }
    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.categoryList.length; i++) {
            if (this.categoryList[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    setDownloadFlag() {
        this.downloadFlg = false;
    }

    exportExcel() {
        this.downloadFlg = true;
        this.loadCategory(this.lastTableLazyLoadEvent);
        var propertiesRemove = ['id','role', 'profilepic', 'createdby', 'updatedby', 'disable', 'countrycode', 'statecode'];
        this.downloadCategoryList = this.categoryList;
        this.downloadCategoryList.forEach(function(item){
            propertiesRemove.forEach(function(prop){
                delete item[prop];
            });
        });
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.downloadCategoryList);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            this.saveAsExcelFile(excelBuffer, "Subcategory");
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
            filename = fileName+"_export_" + new Date().getTime() + EXCEL_EXTENSION;
            saveAs(data, filename);
        });
    }

    changeStatus(category){
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(category.name)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {

                var categoryData = '{"status":'+category.status+'}';
                this.categoryService.updateCategory(category.id,categoryData).subscribe(
                    data => {
                        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Category Status Updated', life: 3000});
                        this.getCategoryDetails(category.id);
                    },
                    err => {
                    this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                this.getCategoryDetails(category.id);
            }
        });
    }

    getCategoryDetails(id) {
        this.categoryService.getCategoryDetails(id).subscribe(
            data => {
                this.categoryDetail = data;
                this.categoryDetail.created_at = new Date(this.categoryDetail.created_at);
                if(this.categoryDetail.status ==true) {
                    this.categoryDetail.statusactive= true;
                } else {
                    this.categoryDetail.statusactive= false;
                }
                this.categoryDetail[this.findIndexById(id)] = this.categoryDetail;
            },
            err => {
              this.errorMessage = err.error.message;
            }
          );
    }
}
