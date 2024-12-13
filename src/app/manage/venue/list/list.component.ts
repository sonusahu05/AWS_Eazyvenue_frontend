import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { VenueService } from '../service/venue.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { Venue } from '../model/venue';
import { environment } from './../../../../environments/environment';
import { TitleCasePipe } from '@angular/common';
import { CategoryService } from 'src/app/services/category.service';
import { Dropdown } from 'primeng/dropdown';
import * as moment from 'moment';
import {
    FormGroup,
    FormControl,
    FormArray,
    FormBuilder,
    Validators,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver/src/FileSaver';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { maxYearFunction } from '../../../_helpers/utility';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    styles: [
        `
            :host ::ng-deep .p-dialog .product-image {
                width: 150px;
                margin: 0 auto 2rem auto;
                display: block;
            }

            @media screen and (max-width: 960px) {
                :host
                    ::ng-deep
                    .p-datatable.p-datatable-customers
                    .p-datatable-tbody
                    > tr
                    > td:last-child {
                    text-align: center;
                }

                :host
                    ::ng-deep
                    .p-datatable.p-datatable-customers
                    .p-datatable-tbody
                    > tr
                    > td:nth-child(6) {
                    display: flex;
                }
            }
        `,
    ],
    providers: [
        VenueService,
        ConfirmationService,
        TitleCasePipe,
        MessageService,
    ],
})
export class ListComponent implements OnInit {
    calvalue: Date;
    ucalvalue: Date;
    yearRange;
    minYear = environment.minYear;
    startDate: Date;
    endDate: Date;
    rowsPerPageOptions: number[] = [10, 50, 100];
    statuses: any[];
    assuredlist: any[];
    cmsmoduleDialog: boolean;
    Venue: Venue[];
    submitted: boolean;
    cols: any[];
    staticPath: string;
    userRoles: any;
    cmsmoduleAdd: any;
    cmsmoduleEdit: any;
    cmsmoduleView: any;
    cmsmoduleDelete: any;
    public venueList: any[];
    errorMessage;
    private lastTableLazyLoadEvent: LazyLoadEvent;
    public totalRecords: 0;
    public loading: boolean;
    public paginationOption = environment.pagination;
    showColumns: boolean = true;
    public searchBy: any[];
    public searchby;
    public downloadFlg: boolean = false;
    public downloadVenueList: any[] = [];
    public roomMangement: boolean = false;
    public venueName: string;
    public roomtypeList: any[] = [];
    public foodtypeList: any[] = [];
    public foodmenutypeList: any[] = [];
    public menutypeMangement: boolean = false;
    public venueroomForm: FormGroup;
    public menutypeForm: FormGroup;
    public selectedVenue;
    public uploadCsvFile: any[] = [];
    public csvRowLength;
    public venueCsvFile: any;
    public showFileUploadModal: boolean = false;
    @ViewChild('dt', { static: false }) public dt: Table;
    @ViewChild('pDropDownId', { static: false }) pDropDownId: Dropdown;

    constructor(
        private VenueService: VenueService,
        private categoryService: CategoryService,
        private tokenStorageService: TokenStorageService,
        private router: Router,
        private messageService: MessageService,
        private fb: FormBuilder,
        private titlecasePipe: TitleCasePipe,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.yearRange = this.minYear + ':' + maxYearFunction();
        this.searchBy = [
            { label: 'Created On', value: 'created_at' },
            { label: 'Last Modified On', value: 'updated_at' },
        ];
        this.venueroomForm = this.fb.group({});
        this.menutypeForm = this.fb.group({});
        this.searchBy = [
            { label: 'Created On', value: 'created_at' },
            { label: 'Last Modified On', value: 'updated_at' },
        ];
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false },
        ];
        this.assuredlist = [
            { label: 'Assured', value: true },
            { label: 'Not Assured', value: false },
        ];

        this.userRoles = JSON.parse(sessionStorage.getItem('userRoles'));
        this.getCategory();
        // console.log(this.userRoles.casestudy,"RRWW");
        // this.cmsmoduleAdd = this.userRoles.cmsmodule.add;
        // this.cmsmoduleEdit = this.userRoles.cmsmodule.edit;
        // this.cmsmoduleView = this.userRoles.cmsmodule.view;
        // this.cmsmoduleDelete = this.userRoles.cmsmodule.delete;
    }

    // clear() {
    //     this.startDate = null;
    //     this.endDate = null;
    //     this.searchby = '';
    //     this.dt.filter('', 'name', 'contains');
    //     this.dt.filter('', 'parent_category', 'contains');
    //     this.dt.filter('', 'created_at', 'dateIs');
    //     this.dt.filter('', 'createdby', 'contains');
    //     this.dt.filter('', 'updated_at', 'dateIs');
    //     this.dt.filter('', 'updatedby', 'contains');
    //     this.calvalue=null;
    //     this.ucalvalue=null;
    //     this.pDropDownId.clear(null);
    //     if (this.pDropDownId) {
    //         this.pDropDownId.value = '';
    //     }
    // }

    getCategory() {
        var parentlist = this.tokenStorageService.getCategorylist();
        let roomobj = parentlist.find((o) => o.slug === 'roomtypes');

        if (roomobj.id) {
            var query =
                '?filterByDisable=false&filterByStatus=true&filterByParent=' +
                roomobj.id +
                '&sortBy=name&orderBy=ASC';
            this.categoryService.getCategoryList(query).subscribe(
                (data) => {
                    var roomlist = data.data.items;
                    roomlist.forEach((element) => {
                        this.roomtypeList.push({
                            id: element.id,
                            slug: element.slug,
                            name: element.name,
                        });
                    });
                    this.roomtypeList.map((x, i) => {
                        this.venueroomForm.addControl(
                            x.slug + 'room',
                            this.fb.control('0')
                        );
                        this.venueroomForm.addControl(
                            x.slug + 'price',
                            this.fb.control('0')
                        );
                    });
                },
                (err) => {
                    this.errorMessage = err.error.message;
                }
            );
        }
        let foodmenuTypeobj = parentlist.find(
            (o) => o.slug === 'foodmenutypes'
        );
        if (foodmenuTypeobj.id) {
            var query =
                '?filterByDisable=false&filterByStatus=true&filterByParent=' +
                foodmenuTypeobj.id +
                '&sortBy=name&orderBy=ASC';
            this.categoryService.getCategoryList(query).subscribe(
                (data) => {
                    var foodmenuttypelist = data.data.items;
                    foodmenuttypelist.forEach((element) => {
                        this.foodmenutypeList.push({
                            id: element.id,
                            slug: element.slug,
                            name: element.name,
                        });
                    });
                    this.foodmenutypeList.map((x, i) => {
                        //this.menutypeForm.addControl(x.slug+"price", this.fb.control('0'));
                    });
                },
                (err) => {
                    this.errorMessage = err.error.message;
                }
            );
        }
        // let foodTypeobj = parentlist.find(o => o.slug === "food");
        // if (foodTypeobj.id) {
        //   var query = "?filterByDisable=false&filterByStatus=true&filterByParent=" + foodTypeobj.id + "&sortBy=name&orderBy=ASC";
        //   this.categoryService.getCategoryList(query).subscribe(
        //     data => {
        //       var foodtypelist = data.data.items;
        //       foodtypelist.forEach(element => {
        //         this.foodtypeList.push({ id: element.id, slug: element.slug, name: element.name });
        //       })
        //       this.foodtypeList.map((x, i) => {
        //         this.menutypeForm.addControl(x.slug+"price", this.fb.control('0'));
        //       })
        //       //console.log(this.foodtypeList);
        //     },
        //     err => {
        //       this.errorMessage = err.error.message;
        //     }
        //   );
        // }
    }

    refreshVenueList(event: LazyLoadEvent) {
        this.lastTableLazyLoadEvent = event;

        let query = new URLSearchParams({
            admin: 'true',
            pageSize: (event.rows || 10).toString(),
            pageNumber: ((event.first || 0) / (event.rows || 10) + 2).toString(),
            filterByDisable: 'false'
        });

        if (this.searchby && this.startDate && this.endDate) {
            query.set('filterByDate', this.searchby.value);
            query.set('filterByStartDate', moment(this.startDate).format('YYYY-MM-DD'));
            query.set('filterByEndDate', moment(this.endDate).format('YYYY-MM-DD'));
        }

        const filterFields = [
            'name', 'email', 'countryname', 'statename', 'cityname', 'zipcode', 'status', 'assured'
        ];
        filterFields.forEach((field) => {
            if (event.filters && event.filters[field]) {
                query.set(field, event.filters[field].value);
            }
        });

        if (event.sortField && event.sortOrder) {
            query.set('sortBy', event.sortField);
            query.set('orderBy', event.sortOrder === 1 ? 'DESC' : 'ASC');
        }

        const queryString = '?' + query.toString();
        console.log(queryString);

        this.VenueService.getVenueListForFilter(queryString).subscribe(
            (data) => {
                // Filter out disabled venues
                this.venueList = data.data.items.filter(venue => !venue.disable);
                this.totalRecords = data.data.totalCount;

                // **Apply Client-side Sorting**
                if (event.sortField && event.sortOrder) {
                    this.venueList.sort((a, b) => {
                        const valueA = a[event.sortField] || '';
                        const valueB = b[event.sortField] || '';

                        if (valueA < valueB) return event.sortOrder === 1 ? -1 : 1;
                        if (valueA > valueB) return event.sortOrder === 1 ? 1 : -1;
                        return 0;
                    });
                }
            },
            (err) => {
                console.error('Error fetching venue list:', err);
            }
        );
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
    }
    setDownloadFlag() {
        this.downloadFlg = false;
    }

    addRoom(venue) {
        this.menutypeMangement = false;
        this.roomMangement = true;
        this.selectedVenue = venue.id;
        this.roomtypeList.forEach((roomData) => {
            let obj = venue.roomData.find((o) => o.id === roomData.id);
            this.venueroomForm.controls[roomData.slug + 'room'].setValue(
                obj['room']
            );
            this.venueroomForm.controls[roomData.slug + 'price'].setValue(
                obj['price']
            );
        });
        this.venueName = venue.name;
    }

    cancelRoomModal() {
        this.roomMangement = false;
        this.venueroomForm.reset();
        this.selectedVenue = '';
    }
    onRoomSubmit() {
        var venueroomData = this.venueroomForm.value;
        var venueRoomData = [];
        this.roomtypeList.forEach((roomData) => {
            venueRoomData.push({
                id: roomData.id,
                slug: roomData.slug,
                room: venueroomData[roomData.slug + 'room'],
                price: venueroomData[roomData.slug + 'price'],
            });
        });
        this.VenueService.updateVenue(this.selectedVenue, {
            roomData: venueRoomData,
        }).subscribe(
            (res) => {
                this.roomMangement = false;
                this.refreshVenueList(this.lastTableLazyLoadEvent);
                this.messageService.add({
                    key: 'toastmsg',
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Venue Room data saved',
                    life: 6000,
                });
                setTimeout(() => {
                    this.router.navigate(['/manage/venue']);
                }, 2000);
            },
            (err) => {
                this.messageService.add({
                    key: 'toastmsg',
                    severity: 'error',
                    summary: err.error.error,
                    detail: 'Update Venue Room failed',
                    life: 6000,
                });
            }
        );
    }
    addMenu(venue) {
        this.roomMangement = false;
        this.menutypeMangement = true;
        this.selectedVenue = venue.id;
        var foodtypelist = venue.foodType;
        this.foodtypeList = [];
        foodtypelist.forEach((element) => {
            this.foodtypeList.push({
                id: element.id,
                slug: element.slug,
                name: element.name,
            });
        });
        this.menutypeForm.reset();
        //console.log(venue.foodMenuType);
        this.foodmenutypeList.map((menu, k) => {
            this.foodtypeList.map((x, i) => {
                this.menutypeForm.addControl(
                    x.slug + menu.slug + 'price',
                    this.fb.control('0')
                );
                if (venue.foodMenuType[x.slug] != undefined) {
                    let obj = venue.foodMenuType[x.slug].find(
                        (o) => o.slug === menu.slug
                    );
                    this.menutypeForm.controls[
                        x.slug + menu.slug + 'price'
                    ].setValue(obj['value']);
                }
            });
        });
        this.venueName = venue.name;
    }

    cancelMenutypeModal() {
        this.menutypeMangement = false;
        this.menutypeForm.reset();
        this.selectedVenue = '';
    }
    onMenutypeSubmit() {
        //var menutypeData = this.menutypeForm.value;
        var menuData = {};
        this.foodtypeList.map((x, i) => {
            var menupriceArr = [];
            this.foodmenutypeList.map((menu, k) => {
                var obj = {
                    slug: menu.slug,
                    value: this.menutypeForm.get(x.slug + menu.slug + 'price')
                        .value,
                };
                menupriceArr.push(obj);
            });
            let nm = x.slug;
            menuData[nm] = menupriceArr;
        });

        this.VenueService.updateVenue(this.selectedVenue, {
            foodMenuType: menuData,
        }).subscribe(
            (res) => {
                this.menutypeMangement = false;
                this.refreshVenueList(this.lastTableLazyLoadEvent);
                this.messageService.add({
                    key: 'toastmsg',
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Venue Food menu saved',
                    life: 6000,
                });
                setTimeout(() => {
                    this.router.navigate(['/manage/venue']);
                }, 2000);
            },
            (err) => {
                this.messageService.add({
                    key: 'toastmsg',
                    severity: 'error',
                    summary: err.error.error,
                    detail: 'Update Venue Food menu failed',
                    life: 6000,
                });
            }
        );
    }
    exportExcel() {
        this.downloadFlg = true;
        this.refreshVenueList(this.lastTableLazyLoadEvent);
        var propertiesRemove = [
            '_id',
            'created_by',
            'created_at',
            'updated_at',
            '__v',
            'updated_by',
            'createduserdata',
            'updateduserdata',
        ];
        this.downloadVenueList = this.venueList;
        this.downloadVenueList.forEach(function (item) {
            if (item.status == true) {
                item.status = 'Active';
            } else {
                item.status = 'In-Active';
            }
            if (item.disable == true) {
                item.disable = 'Active';
            } else {
                item.disable = 'In-Active';
            }

            propertiesRemove.forEach(function (prop) {
                delete item[prop];
            });
        });
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(this.downloadVenueList);
            const workbook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'products');
        });
    }
    fileUploader(event) {
        for (let file of event.files) {
            this.uploadCsvFile.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadCsvFile[0]);
            reader.onload = () => {
                // called once readAsDataURL is completed
                console.log(reader);
                console.log(reader.result);
                this.venueCsvFile = reader.result;
                console.log('loop in', this.venueCsvFile);
            };
        }
        setTimeout(function () {
            console.log(this.venueCsvFile);
        }, 2000);
    }
    onFileUploadSubmit() {
        console.log('submit', this.venueCsvFile);
        if (this.venueCsvFile != undefined) {
            let csvData = {
                csvFile: this.venueCsvFile,
            };

            this.VenueService.uploadVenueCsv(csvData).subscribe(
                (data) => {
                    this.messageService.add({
                        key: 'toastmsg',
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Venue csv file uploaded successfully.',
                        life: 6000,
                    });

                    setTimeout(() => {
                        this.showFileUploadModal = false;
                        this.router.navigateByUrl('/manage/venue');
                    }, 2000);
                },
                (err) => {
                    this.messageService.add({
                        key: 'toastmsg',
                        severity: 'error',
                        summary: err.error.error,
                        detail: 'File upload failed.',
                        life: 6000,
                    });
                }
            );
        }
    }
    showUploadModal() {
        this.showFileUploadModal = true;
    }
    saveAsExcelFile(buffer: any, fileName: string): void {
        import('file-saver').then((FileSaver) => {
            let EXCEL_TYPE =
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE,
            });
            let filename;
            filename =
                fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION;
            saveAs(data, filename);
        });
    }

    openNew() {
        this.router.navigateByUrl('/manage/venue/add');
    }

    onEdit(venue) {
        this.router.navigateByUrl('/manage/venue/edit/' + venue.id);
    }

    viewOrder(venue) {
        this.router.navigateByUrl('/manage/venue/order/' + venue.id);
    }
    changeStatus(venue) {
        this.confirmationService.confirm({
            message:
                'Are you sure you want to change the status of  ' +
                this.titlecasePipe.transform(venue.name) +
                '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var updateData = '{"status":' + venue.status + '}';
                // console.log(cmsmodule._id);
                this.VenueService.updateVenue(venue.id, updateData).subscribe(
                    (data) => {
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Venue Status Updated',
                            life: 3000,
                        });
                    },
                    (err) => {
                        this.errorMessage = err.error.message;
                    }
                );
                this.refreshVenueList(this.lastTableLazyLoadEvent);
            },
            reject: () => {
                this.refreshVenueList(this.lastTableLazyLoadEvent);
            },
        });
    }
    changeAssured(venue) {
        this.confirmationService.confirm({
            message:
                'Are you sure you want to mark ' +
                this.titlecasePipe.transform(venue.name) +
                ' as Assured?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var updateData = '{"assured":' + venue.assured + '}';
                // console.log(cmsmodule._id);
                this.VenueService.updateVenue(venue.id, updateData).subscribe(
                    (data) => {
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Venue marked as Assured',
                            life: 3000,
                        });
                    },
                    (err) => {
                        this.errorMessage = err.error.message;
                    }
                );
                this.refreshVenueList(this.lastTableLazyLoadEvent);
            },
            reject: () => {
                this.refreshVenueList(this.lastTableLazyLoadEvent);
            },
        });
    }

    onDelete(venue) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete record ' + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                var updateData = '{"disable":true}';
                this.VenueService.updateVenue(venue.id, updateData).subscribe(
                    (data) => {
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Venue Deleted',
                            life: 3000,
                        });
                        // Remove the venue from the local list
                        this.venueList = this.venueList.filter(v => v.id !== venue.id);
                        this.totalRecords = data.data.totalCount;
                    },
                    (err) => {
                        this.errorMessage = err.error.message;
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete venue',
                            life: 3000,
                        });
                    }
                );
            },
        });
    }
    /**
     * Add Slot availability
     */
    addSlotAvailability(venue) {
        this.router.navigateByUrl(
            '/manage/venue/slot-availability/' + venue.id
        );
    }
    /**
     * Use to add more columns in the table.
     */
    addColumns() {
        this.showColumns = false;
    }

    /**
     * Use to remove more columns in the table.
     */
    removeColumns() {
        this.showColumns = true;
    }
}
