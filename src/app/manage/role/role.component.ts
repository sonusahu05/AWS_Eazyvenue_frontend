import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { LazyLoadEvent } from 'primeng/api';
import { Dropdown } from "primeng/dropdown";
import { saveAs } from 'file-saver/src/FileSaver';
import { maxYearFunction } from '../../_helpers/utility';

import * as moment from "moment";

@Component({
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.scss'],
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
    providers: [MessageService, ConfirmationService, TitleCasePipe]
})
export class RoleComponent implements OnInit {
    errorMessage = '';
    selectedCustomers1: [];
    statuses: any[];
    searchBy: any[];
    roledetail: any;
    rowGroupMetadata: any;
    totalRecords: 0;
    loading: boolean;
    activityValues: number[] = [0, 100];
    rolelist: any;
    paginationOption;
    yearRange;
    minYear = environment.minYear;
    startDate: Date;
    endDate: Date;
    downloadFlg: boolean;
    downloadRoleList: any;
    searchby;
    private lastTableLazyLoadEvent: LazyLoadEvent;
    @ViewChild("dt", { static: false }) public dt: Table;
    @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;
    constructor(private roleService: RoleService, private titlecasePipe: TitleCasePipe,
        private router: Router, private route: ActivatedRoute, private messageService: MessageService, private confirmationService: ConfirmationService) { }

    ngOnInit() {
        this.paginationOption = environment.pagination;
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.searchBy = [
            { label: 'Created On', value: "created_at" },
            { label: 'Last Modified On', value: "updated_at" }
        ];
        this.downloadFlg = false;

    }

    clear() {
        this.startDate = null;
        this.endDate = null;
        this.searchby = '';
        this.dt.filter('', 'fullName', 'contains');
        this.dt.filter('', 'email', 'contains');
        this.dt.filter('', 'countryname', 'contains');
        this.dt.filter('', 'statename', 'contains');
        this.dt.filter('', 'cityname', 'contains');
        this.dt.filter('', 'zipcode', 'contains');
        this.dt.filter('', 'dob', 'dateIs');
        this.dt.filter('', 'created_at', 'dateIs');
        this.dt.filter('', 'createdby', 'contains');
        this.dt.filter('', 'updated_at', 'dateIs');
        this.dt.filter('', 'updatedby', 'contains');
        if (this.pDropDownId) {
            this.pDropDownId.value = '';
        }
    }

    loadRoles(event: LazyLoadEvent) {
        this.lastTableLazyLoadEvent = event;
        var query = "filterByDisable=false";
        var pagenumber;
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

        if (this.searchby != undefined && this.startDate != undefined && this.endDate != undefined) {
            params += "&filterByDate=" + this.searchby.value;
            params += "&filterByStartDate=" + moment(this.startDate).format("YYYY-MM-DD");
            params += "&filterByEndDate=" + moment(this.endDate).format("YYYY-MM-DD");
        }

        if (event.filters != undefined && event.filters["user_role_name"] != undefined) {
            params += "&filterByroleName=" + event.filters["user_role_name"].value;
        }
        if (event.filters != undefined && event.filters["createdBy"] != undefined) {
            params += "&filterByCreatedby=" + event.filters["createdBy"].value;
        }
        if (event.filters != undefined && event.filters["status"] != undefined) {
            params += "&filterByStatus=" + event.filters["status"].value;
        }
        if (event.filters != undefined && event.filters["created_at"] != undefined) {
            const createdAt = moment(event.filters["created_at"].value).format("YYYY-MM-DD");
            params += "&filterByCreatedAt=" + createdAt;
        }

        if (event.filters != undefined && event.filters["updated_at"] != undefined) {
            const createdAt = moment(event.filters["updated_at"].value).format("YYYY-MM-DD");
            params += "&filterByUpdatedAt=" + createdAt;
        }
        if (event.filters != undefined && event.filters["updatedBy"] != undefined) {
            params += "&filterByUpdatedby=" + event.filters["updatedBy"].value;
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

        this.roleService.getRoleList(query).subscribe(
            data => {
                this.loading = false;
                this.rolelist = data.data.items;
                this.totalRecords = data.data.totalCount;
                this.rolelist.forEach(element => {
                    // element.created_at = new Date(element.created_at);
                    //element.updated_at = new Date(element.updated_at);

                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    func(prop, val) {
        var jsonStr = '{"' + prop + '":"' + val + '"}';
        return JSON.parse(jsonStr);
    }

    addNewRole() {
        this.router.navigate(['/manage/role/add']);
    }


    viewRole(id) {
        this.router.navigate(['/manage/role/view/' + id]);
    }

    editRole(id) {
        this.router.navigate(['/manage/role/' + id]);
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.rolelist.length; i++) {
            if (this.rolelist[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    deleteRole(role) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(role.user_role_name)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var disableStatus;
                if (role.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                var roleData = '{"disable":' + disableStatus + '}';
                this.roleService.updateRole(role.id, roleData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Role Deleted', life: 3000 });
                        this.loadRoles(this.lastTableLazyLoadEvent);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            }
        });
    }
    changeStatus(role) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(role.user_role_name)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {

                var roleData = '{"status":' + role.status + '}';
                this.roleService.updateRole(role.id, roleData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Role Status Updated', life: 3000 });
                        this.getRoleDetails(role.id);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                this.getRoleDetails(role.id);
            }
        });
    }

    getRoleDetails(id) {
        this.roleService.getRoleDetails(id).subscribe(
            data => {
                this.roledetail = data;
                this.roledetail.created_at = new Date(this.roledetail.created_at);
                if (this.roledetail.status == true) {
                    this.roledetail.statusactive = true;
                } else {
                    this.roledetail.statusactive = false;
                }
                this.rolelist[this.findIndexById(id)] = this.roledetail;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    setDownloadFlag() {
        this.downloadFlg = false;
    }

    exportExcel() {
        this.downloadFlg = true;
        this.loadRoles(this.lastTableLazyLoadEvent);
        var propertiesRemove = ['id', 'role', 'profilepic', 'createdby', 'updatedby', 'disable', 'countrycode', 'statecode'];
        this.downloadRoleList = this.rolelist;
        this.downloadRoleList.forEach(function (item) {
            propertiesRemove.forEach(function (prop) {
                delete item[prop];
            });
        });

        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.downloadRoleList);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            this.saveAsExcelFile(excelBuffer, "Role");
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
            filename = fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION;
            saveAs(data, filename);
        });
    }
}
