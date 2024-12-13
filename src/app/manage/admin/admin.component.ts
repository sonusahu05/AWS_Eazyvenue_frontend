import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Table} from 'primeng/table';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from "@angular/router";
import {ConfirmationService, MessageService} from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import {LazyLoadEvent} from 'primeng/api'; 
import { Dropdown } from "primeng/dropdown";
import { environment } from 'src/environments/environment';
import * as moment from "moment";
import {saveAs} from 'file-saver/src/FileSaver';
import { maxYearFunction } from '../../_helpers/utility';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
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
export class AdminComponent implements OnInit {
    errorMessage = '';
    statuses: any[];
    searchBy: any[];
    rowGroupMetadata: any;
    totalRecords: 0;
    virtualDatabase: any;
    userlist: any;
    adminRoleId;
    userdetail: any;
    public item: any[] = [];
    genders:any=[];
    loading: boolean;
    paginationOption;
    private lastTableLazyLoadEvent: LazyLoadEvent;
    calvalue: Date;
    ucalvalue: Date;
    dcalvalue: Date;
    yearRange;
    minYear = environment.minYear;
    startDate:Date;
    endDate: Date;
    downloadFlg : boolean;
    downloadUserList: any;
    searchby;
    @ViewChild("dt", { static: false }) public dt: Table;
    @ViewChild("pDropDownId", {static: false}) pDropDownId: Dropdown;
    constructor(private el: ElementRef, private userService: UserService, private roleService: RoleService, private titlecasePipe: TitleCasePipe, private router: Router, private route:ActivatedRoute, private messageService: MessageService, private confirmationService: ConfirmationService) {}

    ngOnInit() {
        this.paginationOption = environment.pagination;
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            {label: 'Active', value: true},
            {label: 'In-Active', value: false}
        ];
        this.searchBy = [
            {label: 'DOB', value: "dob"},
            {label: 'Created On', value: "created_at"},            
            {label: 'Last Modified On', value: "updated_at"}
        ];
        this.genders = [
            {label: 'Male', value: 'Male'},
            {label: 'Female', value: 'Female'},
            {label: 'Other', value: 'Other'},
        ];
        this.downloadFlg = false;
        //this.getUserlist();
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
        this.calvalue=null;
        this.ucalvalue=null;
        this.dcalvalue=null;
        this.pDropDownId.clear(null);
        if (this.pDropDownId) {
            this.pDropDownId.value = '';      
        }
    }

    loadUsers(event: LazyLoadEvent){
        this.lastTableLazyLoadEvent = event;
        var query="?filterByDisable=false";
        var pagenumber= 1;
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
        
        if (event.filters != undefined && event.filters["fullName"] != undefined){
            params += "&filterByfullName="+event.filters["fullName"].value;            
        }
        if (event.filters != undefined && event.filters["email"] != undefined){
            params += "&filterByemail="+event.filters["email"].value;            
        }
        if (event.filters != undefined && event.filters["countryname"] != undefined){
            params += "&filterByCountryName="+event.filters["countryname"].value;            
        }
        if (event.filters != undefined && event.filters["statename"] != undefined){
            params += "&filterByStateName="+event.filters["statename"].value;            
        }
        if (event.filters != undefined && event.filters["cityname"] != undefined){
            params += "&filterByCityName="+event.filters["cityname"].value;            
        }
        if (event.filters != undefined && event.filters["zipcode"] != undefined){
            params += "&filterByZipcode="+event.filters["zipcode"].value;            
        }
        if (event.filters != undefined && event.filters["status"] != undefined){
            params += "&filterByStatus="+event.filters["status"].value;            
        }
        if (event.filters != undefined && event.filters["gender"] != undefined){
            params += "&filterByGender="+event.filters["gender"].value;            
        }
        if (event.filters != undefined && event.filters["dob"] != undefined){
            const createdAt = moment(event.filters["dob"].value).format("YYYY-MM-DD");
            params += "&filterByDob="+createdAt;            
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
        var querystring = "filterByroleName=admin";
        this.roleService.searchRoleDetails(querystring).subscribe(
            data => {
                this.adminRoleId = data.data.items[0]['id'];
                query += "&filterByrollId="+this.adminRoleId; 
                this.userService.getUserList(query).subscribe(
                    data => {
                        this.loading = false;
                        this.userlist = data.data.items;
                        this.totalRecords = data.data.totalCount;
                        // this.userlist.forEach(element => {
                        //     element.created_at = new Date(element.created_at);
                        //     element.updated_at = new Date(element.updated_at);
                        // });
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

    deleteUser(user) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(user.fullName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var disableStatus;
                if(user.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                var userData = '{"disable":'+disableStatus+'}';
                this.userService.updateUser(user.id,userData).subscribe(
                    data => {
                        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Admin User Deleted', life: 3000});
                        this.loadUsers(this.lastTableLazyLoadEvent);
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
        var jsonStr = '{"'+prop+'":"'+val+'"}';
        return JSON.parse(jsonStr);
    }

    addNewUser(){
        this.router.navigate(['/manage/admin/add']);
    }
    
    viewAdmin(id) {
        this.router.navigate(['/manage/admin/view/'+id]);
    }

    editUser(id) {
        this.router.navigate(['/manage/admin/'+id]);
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

    changeStatus(user){         
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(user.fullName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                
                var userData = '{"status":'+user.status+'}';
                this.userService.updateUser(user.id,userData).subscribe(
                    data => {
                        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Admin Status Updated', life: 3000});
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
                this.userdetail.name = this.userdetail.firstName+' '+this.userdetail.lastName;
                if(this.userdetail.status =="true") {
                    this.userdetail.statusactive= true;      
                } else {
                    this.userdetail.statusactive= false;
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
        showp1Table .classList.add('show-columns');
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
        this.loadUsers(this.lastTableLazyLoadEvent);
        var propertiesRemove = ['id','role', 'profilepic', 'createdby', 'updatedby', 'disable', 'countrycode', 'statecode'];
        this.downloadUserList = this.userlist;
        this.downloadUserList.forEach(function(item){
            propertiesRemove.forEach(function(prop){
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
            this.saveAsExcelFile(excelBuffer, "Admin");
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
}
