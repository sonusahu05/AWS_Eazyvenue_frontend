import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/api';
import { Dropdown } from "primeng/dropdown";
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver/src/FileSaver';
import { maxYearFunction } from '../../../_helpers/utility';
import * as moment from "moment";
@Component({
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
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
export class ListComponent implements OnInit {
    errorMessage = '';
    statuses: any[];
    searchBy: any[];
    rowGroupMetadata: any;
    totalRecords: 0;
    virtualDatabase: any;
    userlist: any;
    userRoleId;
    userdetail: any;
    public item: any[] = [];
    genders: any = [];
    loading: boolean;
    paginationOption;
    private lastTableLazyLoadEvent: LazyLoadEvent;
    calvalue: Date;
    ucalvalue: Date;
    dcalvalue: Date;
    yearRange;
    minYear = environment.minYear;
    startDate: Date;
    endDate: Date;
    downloadFlg: boolean;
    downloadUserList: any;
    searchby;
    wdcalvalue;
    @ViewChild("dt", { static: false }) public dt: Table;
    @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;
    constructor(private el: ElementRef, private userService: UserService, private roleService: RoleService, private titlecasePipe: TitleCasePipe, private router: Router, private route: ActivatedRoute, private messageService: MessageService, private confirmationService: ConfirmationService) { }

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
        this.genders = [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
        ];
        this.downloadFlg = false;
        //this.getUserlist();
    }

    clear() {
        this.startDate = null;
        this.endDate = null;
        this.searchby = '';
        this.dt.filter('', 'fullName', 'contains');
        this.dt.filter('', 'firstName', 'contains');
        this.dt.filter('', 'lastName', 'contains');
        this.dt.filter('', 'countryname', 'contains');
        this.dt.filter('', 'statename', 'contains');
        this.dt.filter('', 'cityname', 'contains');
        this.dt.filter('', 'zipcode', 'contains');
        this.dt.filter('', 'gender', 'contains');
        this.dt.filter('', 'dob', 'dateIs');
        this.dt.filter('', 'weddingDate', 'dateIs');
        this.dt.filter('', 'created_at', 'dateIs');
        this.dt.filter('', 'createdby', 'contains');
        this.dt.filter('', 'updated_at', 'dateIs');
        this.dt.filter('', 'updatedby', 'contains');
        this.calvalue = null;
        this.ucalvalue = null;
        this.dcalvalue = null;
        this.wdcalvalue = null;
        this.pDropDownId.clear(null);
        if (this.pDropDownId) {
            this.pDropDownId.value = '';
        }
    }

    loadVendors(event: LazyLoadEvent) {
        //console.log(event);
        this.lastTableLazyLoadEvent = event;
        var query = "?filterByDisable=false";
        var pagenumber = 1;
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
            console.log(params);
        }
        if (event.filters != undefined && event.filters["fullName"] != undefined) {
            params += "&filterByfullName=" + event.filters["fullName"].value;
        }
        if (event.filters != undefined && event.filters["firstName"] != undefined) {
            params += "&filterByFirstName=" + event.filters["firstName"].value;
        }
        if (event.filters != undefined && event.filters["lastName"] != undefined) {
            params += "&filterByLastName=" + event.filters["lastName"].value;
        }
        if (event.filters != undefined && event.filters["email"] != undefined) {
            params += "&filterByemail=" + event.filters["email"].value;
        }
        // if (event.filters != undefined && event.filters["countryname"] != undefined){
        //     params += "&filterByCountryName="+event.filters["countryname"].value;            
        // }
        // if (event.filters != undefined && event.filters["statename"] != undefined){
        //     params += "&filterByStateName="+event.filters["statename"].value;            
        // }
        // if (event.filters != undefined && event.filters["cityname"] != undefined){
        //     params += "&filterByCityName="+event.filters["cityname"].value;            
        // }
        // if (event.filters != undefined && event.filters["zipcode"] != undefined){
        //     params += "&filterByZipcode="+event.filters["zipcode"].value;            
        // }
        if (event.filters != undefined && event.filters["status"] != undefined) {
            params += "&filterByStatus=" + event.filters["status"].value;
        }
        if (event.filters != undefined && event.filters["gender"] != undefined) {
            params += "&filterByGender=" + event.filters["gender"].value;
        }
        if (event.filters != undefined && event.filters["dob"] != undefined) {
            const dob = moment(event.filters["dob"].value).format("YYYY-MM-DD");
            params += "&filterByDob=" + dob;
        }
        if (event.filters != undefined && event.filters["weddingDate"] != undefined) {
            const weddingDate = moment(event.filters["weddingDate"].value).format("YYYY-MM-DD");
            params += "&filterByWeddingDate=" + weddingDate;
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
        // return this.userService.getUserList(query).subscribe(
        //     data => {
        //         this.loading = false;
        //         this.userlist = data.data.items;
        //         this.totalRecords = data.data.totalCount;
        //         this.userlist.forEach(element => {
        //             element.created_at = new Date(element.created_at);
        //         });
        //     },
        //     err => {
        //         this.errorMessage = err.error.message;
        //     }
        // );        
        var querystring = "filterByroleName=caterer";
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.userRoleId = data.data.items[0]['id'];
                query += "&filterByrollId=" + this.userRoleId;
                this.userService.getUserList(query).subscribe(
                    data => {
                        this.loading = false;
                        this.userlist = data.data.items;
                        this.totalRecords = data.data.totalCount;
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    deleteVendor(user) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(user.fullName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var disableStatus;
                if (user.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                var userData = '{"disable":' + disableStatus + '}';
                this.userService.updateUser(user.id, userData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Caterer Deleted', life: 3000 });
                        this.loadVendors(this.lastTableLazyLoadEvent);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });
    }

    func(prop, val) {
        var jsonStr = '{"' + prop + '":"' + val + '"}';
        return JSON.parse(jsonStr);
    }

    addNewCaterer() {
        this.router.navigate(['/manage/caterer/add']);
    }

    viewCaterer(id) {
        this.router.navigate(['/manage/caterer/view/' + id]);
    }

    editCaterer(id) {
        this.router.navigate(['/manage/caterer/edit/' + id]);
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.userlist.length; i++) {
            if (this.userlist[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    changeStatus(user) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(user.fullName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {

                var userData = '{"status":' + user.status + '}';
                this.userService.updateUser(user.id, userData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Caterer Status Updated', life: 3000 });
                        this.getUserDetails(user.id);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                this.getUserDetails(user.id);
            }
        });
    }

    getUserDetails(id) {
        this.userService.getUserDetails(id).subscribe(
            data => {
                this.userdetail = data;
                this.userdetail.created_at = new Date(this.userdetail.created_at);
                this.userdetail.name = this.userdetail.firstName + ' ' + this.userdetail.lastName;
                if (this.userdetail.status == true) {
                    this.userdetail.statusactive = true;
                } else {
                    this.userdetail.statusactive = false;
                }
                this.userlist[this.findIndexById(id)] = this.userdetail;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }
    /** 
     * Use to add more columns in the table.
    */
    addColumns() {
        var showp1Table = this.el.nativeElement.querySelector(".p1-table-columns");
        showp1Table.classList.remove('hide-columns');
        showp1Table.classList.add('show-columns');
        var hidep2Table = this.el.nativeElement.querySelector(".p2-table-columns");
        hidep2Table.classList.remove('show-columns');
        hidep2Table.classList.add('hide-columns');
    }

    /** 
    * Use to remove more columns in the table.
    */
    removeColumns() {
        var showp2Table = this.el.nativeElement.querySelector(".p2-table-columns");
        showp2Table.classList.remove('hide-columns');
        showp2Table.classList.add('show-columns');
        var hidep1Table = this.el.nativeElement.querySelector(".p1-table-columns");
        hidep1Table.classList.add('hide-columns');
        hidep1Table.classList.remove('show-columns');
    }

    setDownloadFlag() {
        this.downloadFlg = false;
    }

    exportExcel() {
        this.downloadFlg = true;
        this.loadVendors(this.lastTableLazyLoadEvent);
        var propertiesRemove = ['id', 'country_id', 'state_id', 'mobileNumber', 'city_id', 'zipcode', 'created_at', 'dob', 'weddingDate', 'role', 'profilepic', 'createdby', 'updatedby', 'disable', 'updated_at'];
        this.downloadUserList = this.userlist;
        this.downloadUserList.forEach(function (item) {
            if (item.updated_at != '') {
                item['Modification_Date'] = moment(item.updated_at).format('DD/MM/YYYY');
            }
            if (item.dob != '') {
                item['Date_Of_Birth'] = moment(item.dob).format('DD/MM/YYYY');
            }
            if (item.weddingDate != '') {
                item['Wedding_Date'] = moment(item.weddingDate).format('DD/MM/YYYY');
            }
            propertiesRemove.forEach(function (prop) {
                delete item[prop];
            });
        });
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.downloadUserList);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            this.saveAsExcelFile(excelBuffer, "User");
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
