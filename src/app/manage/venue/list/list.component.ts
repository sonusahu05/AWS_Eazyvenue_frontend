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
    isVenueOwner: boolean = false;
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

        // Check if user is a venue owner
        const userData = this.tokenStorageService.getUser();
        this.isVenueOwner = userData && userData.userdata && userData.userdata.rolename === 'venueowner';

        this.getCategory();
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
    }
    refreshVenueList(event: LazyLoadEvent) {
        this.lastTableLazyLoadEvent = event;
        this.loading = true;

        // Get user data
        const userData = this.tokenStorageService.getUser();
        const isVenueOwner = userData && userData.userdata && userData.userdata.rolename === 'venueowner';

        let query = new URLSearchParams({
            admin: 'true',
            pageSize: (event.rows || 10).toString(),
            pageNumber: ((event.first || 0) / (event.rows || 10) + 1).toString(),
            filterByDisable: 'false'
        });

        // Handle search by date range if selected
        if (this.searchby && this.startDate && this.endDate) {
            query.set('filterByDate', this.searchby.value);
            query.set('filterByStartDate', moment(this.startDate).format('YYYY-MM-DD'));
            query.set('filterByEndDate', moment(this.endDate).format('YYYY-MM-DD'));
        }

        // Process all filters normally first
        if (event.filters) {
            Object.keys(event.filters).forEach(key => {
                if (event.filters[key].value !== null && event.filters[key].value !== undefined) {
                    switch (key) {
                        case 'name':
                            query.set('filterByName', event.filters[key].value);
                            break;
                        case 'email':
                            query.set('filterByEmail', event.filters[key].value);
                            break;
                        case 'cityname':
                            query.set('filterByCity', event.filters[key].value);
                            break;
                        case 'statename':
                            query.set('filterByState', event.filters[key].value);
                            break;
                        case 'zipcode':
                            query.set('filterByZipcode', event.filters[key].value);
                            break;
                        case 'status':
                            if (event.filters[key].value !== null) {
                                query.set('filterByStatus', event.filters[key].value);
                            }
                            break;
                        case 'assured':
                            if (event.filters[key].value !== null) {
                                query.set('filterByAssured', event.filters[key].value);
                            }
                            break;
                    }
                }
            });
        }

        // If user is a venue owner, override any email filter with their email
        if (isVenueOwner && userData.userdata.email) {
            query.set('filterByEmail', userData.userdata.email);
        }

        // Handle sorting
        if (event.sortField && event.sortOrder) {
            query.set('sortBy', event.sortField);
            query.set('orderBy', event.sortOrder === 1 ? 'ASC' : 'DESC');
        }

        const queryString = '?' + query.toString();

        this.VenueService.getVenueListForFilter(queryString).subscribe(
            (data) => {
                this.loading = false;

                // First, get all non-disabled venues from the response
                let allEnabledVenues = data.data.items.filter(venue => !venue.disable);

                // Then apply our status filter if needed
                let venues = allEnabledVenues.filter(venue => {
                    // If there's a status filter active, respect it
                    if (event.filters && event.filters.status && event.filters.status.value !== null) {
                        return venue.status === event.filters.status.value;
                    }

                    // Otherwise, only show active venues by default
                    return venue.status === true;
                });

                // Apply other client-side filtering if needed
                if (event.filters) {
                    Object.keys(event.filters).forEach(key => {
                        if (key !== 'status' && event.filters[key].value !== null && event.filters[key].value !== undefined) {
                            const filterValue = event.filters[key].value.toString().toLowerCase();
                            venues = venues.filter(venue => {
                                if (venue[key] === undefined) return true;
                                return venue[key].toString().toLowerCase().includes(filterValue);
                            });
                        }
                    });
                }

                // Additional filter for venue owners
                if (isVenueOwner && userData.userdata.email) {
                    const userEmail = userData.userdata.email.toLowerCase();
                    venues = venues.filter(venue => {
                        return venue.email && venue.email.toLowerCase() === userEmail;
                    });
                }

                // Handle venue owner special case
                if (this.isVenueOwner && venues.length > 0) {
                    this.venueList = [venues[0]];
                    this.totalRecords = 0;
                } else {
                    // Apply sorting if needed
                    if (event.sortField && event.sortOrder) {
                        venues.sort((a, b) => {
                            const valueA = a[event.sortField] || '';
                            const valueB = b[event.sortField] || '';
                            if (valueA < valueB) return event.sortOrder === 1 ? -1 : 1;
                            if (valueA > valueB) return event.sortOrder === 1 ? 1 : -1;
                            return 0;
                        });
                    }

                    this.venueList = venues;

                    // Set the totalRecords to the actual filtered count
                    // This ensures pagination properly reflects what's actually displayed
                    this.totalRecords = venues.length;

                    // Log for debugging
                    console.log(`Showing ${venues.length} venues out of ${allEnabledVenues.length} enabled and ${data.data.totalCount} total`);
                }
            },
            (err) => {
                this.loading = false;
                console.error('Error fetching venue list:', err);
                this.messageService.add({
                    key: 'toastmsg',
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load venue list',
                    life: 3000,
                });
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
                // Create the proper update data object - if setting to inactive, also set assured to false
                const updateData = {
                    status: venue.status,
                    // When setting to inactive, automatically set assured to false as well
                    ...(venue.status === false && { assured: false })
                };

                this.VenueService.updateVenue(venue.id, updateData).subscribe(
                    (data) => {
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: venue.status ?
                                'Venue Status Updated to Active' :
                                'Venue Status Updated to Inactive and Unassured',
                            life: 3000,
                        });

                        // If status is false (inactive), update assured status and remove from the list
                        if (!venue.status) {
                            venue.assured = false; // Update local state too
                            this.venueList = this.venueList.filter(v => v.id !== venue.id);
                            this.totalRecords--;
                        }
                        // Otherwise refresh the data to show updated status
                        else {
                            this.refreshVenueList(this.lastTableLazyLoadEvent);
                        }
                    },
                    (err) => {
                        this.errorMessage = err.error.message;
                        // Revert the toggle if there was an error
                        venue.status = !venue.status;
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update venue status',
                            life: 3000,
                        });
                    }
                );
            },
            reject: () => {
                // Revert the toggle if rejected
                venue.status = !venue.status;
            },
        });
    }

    changeAssured(venue) {
        this.confirmationService.confirm({
            message:
                'Are you sure you want to mark ' +
                this.titlecasePipe.transform(venue.name) +
                (venue.assured ? ' as Assured?' : ' as Not Assured?'),
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Create the proper update data object
                const updateData = { assured: venue.assured };

                this.VenueService.updateVenue(venue.id, updateData).subscribe(
                    (data) => {
                        this.messageService.add({
                            key: 'toastmsg',
                            severity: 'success',
                            summary: 'Successful',
                            detail: venue.assured ? 'Venue marked as Assured' : 'Venue marked as Not Assured',
                            life: 3000,
                        });

                        // Update the venue directly in the list to reflect changes immediately
                        const index = this.venueList.findIndex(v => v.id === venue.id);
                        if (index !== -1) {
                            this.venueList[index].assured = venue.assured;
                        }
                    },
                    (err) => {
                        this.errorMessage = err.error.message;
                        // Revert the toggle if there was an error
                        venue.assured = !venue.assured;
                    }
                );
            },
            reject: () => {
                // Revert the toggle if rejected
                venue.assured = !venue.assured;
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
