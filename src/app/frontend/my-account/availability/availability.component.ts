import { Component, OnInit, ViewChild } from '@angular/core';
import { Customer, Representative } from '../../../demo/domain/customer';
import { CustomerService } from '../../../demo/service/customerservice';
import { Table } from 'primeng/table';
import { PrimeNGConfig } from 'primeng/api';
import { VenueOrderService } from 'src/app/services/venueOrder.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';
import { WishlistService } from 'src/app/services/wishlist.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { SlotService } from 'src/app/services/slot.service';
@Component({
    selector: 'app-availability',
    templateUrl: './availability.component.html',
    styleUrls: ['./availability.component.scss'],
    providers: [ConfirmationService, MessageService, TitleCasePipe],
})
export class AvailabilityComponent implements OnInit {
    customers: Customer[];
    public profileDetails;

    selectedCustomers: Customer[];
    selectedvenueOrders;
    representatives: Representative[];

    statuses: any[];

    loading: boolean = true;
    public venueOrderList: any[] = [];
    public wishlist: any[] = [];
    public slotList: any[] = [];
    public totalRecords;
    public venueName;
    public errorMessage;
    public userId;
    public loggedInUser;
    public isLoggedIn: boolean = false;
    public totalWishlistRecords;
    @ViewChild('dt') table: Table;

    constructor(private customerService: CustomerService,
        private primengConfig: PrimeNGConfig,
        private venueOrderService: VenueOrderService,
        private tokenStorageService: TokenStorageService,
        private router: Router,
        private wishlistService: WishlistService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private titlecasePipe: TitleCasePipe,
        private slotService: SlotService
    ) { }

    async ngOnInit() {
        await this.getSlots();
        this.customerService.getCustomersLarge().then(customers => {
            this.customers = customers;
            this.loading = false;
        });

        this.representatives = [
            { name: "Amy Elsner", image: 'amyelsner.png' },
            { name: "Anna Fali", image: 'annafali.png' },
            { name: "Asiya Javayant", image: 'asiyajavayant.png' },
            { name: "Bernardo Dominic", image: 'bernardodominic.png' },
            { name: "Elwin Sharvill", image: 'elwinsharvill.png' },
            { name: "Ioni Bowcher", image: 'ionibowcher.png' },
            { name: "Ivan Magalhaes", image: 'ivanmagalhaes.png' },
            { name: "Onyama Limba", image: 'onyamalimba.png' },
            { name: "Stephen Shaw", image: 'stephenshaw.png' },
            { name: "XuXue Feng", image: 'xuxuefeng.png' }
        ];

        this.statuses = [
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ]
        this.primengConfig.ripple = true;
        this.loggedInUser = this.tokenStorageService.getUser();
        if (this.loggedInUser != undefined) {
            this.isLoggedIn = true;
            this.userId = this.loggedInUser.id;
        }
        // if (this.isLoggedIn == false) {
        //     this.router.navigate(['/']);
        // }

        //this.getWishlist();

        this.loadVenueOrderList();
    }
    async getWishlist() {
        let query = "?filterByStatus=true&filterByCustomerId=" + this.userId;
        this.wishlistService.getWishlist(query).subscribe(
            data => {
                this.loading = false;
                this.wishlist = data.data.items;
                this.totalWishlistRecords = data.data.totalCount;
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }
    onActivityChange(event) {
        const value = event.target.value;
        if (value && value.trim().length) {
            const activity = parseInt(value);

            if (!isNaN(activity)) {
                this.table.filter(activity, 'activity', 'gte');
            }
        }
    }

    onDateSelect(value) {
        this.table.filter(this.formatDate(value), 'date', 'equals')
    }

    formatDate(date) {
        let month = date.getMonth() + 1;
        let day = date.getDate();

        if (month < 10) {
            month = '0' + month;
        }

        if (day < 10) {
            day = '0' + day;
        }

        return date.getFullYear() + '-' + month + '-' + day;
    }

    onRepresentativeChange(event) {
        this.table.filter(event.value, 'representative', 'in')
    }

    async getSlots() {
        let query = "?filterByDisable=false&filterByStatus=true";
        this.slotService.getSlotListWithoutAuth(query).subscribe(
            data => {
                if (data.data.items.length > 0) {
                    this.slotList = data.data.items;
                }
            },
            error => {

            }
        );
    }
    loadVenueOrderList() {
        var query = "?filterByDisable=false&filterByStatus=true&filterByOrderType=send_enquires&filterByCustomerId=" + this.userId;
        this.venueOrderService.getVenueOrderList(query).subscribe(
            data => {
                this.loading = false;
                if (data.data != undefined) {
                    this.venueOrderList = data.data.items;
                    this.totalRecords = data.data.totalCount;
                    if (this.totalRecords > 0) {
                        this.venueName = this.venueOrderList[0]['venueName'];
                    }
                    if (this.venueOrderList.length > 0) {
                        this.venueOrderList.forEach(element => {
                            this.slotList.forEach(sElement => {
                                if (sElement.id === element['duration'][0]['slotId']) {
                                    element['slotName'] = sElement.slot;
                                }
                            });
                        })
                    }
                }

            },
            err => {
                this.errorMessage = err.error.message;
            });
    }
    onVenueOrderView(venueOrder) {
        this.router.navigateByUrl('/venue-order/view/' + venueOrder.id);
    }
    onVenueVenueView(venue) {
        this.router.navigateByUrl('/venue/' + venue.venueId);
    }
    onClickDeleteItem(wish) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to remove ' + (this.titlecasePipe.transform(wish.venueName)) + ' from wishlist?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                let wishlistId = wish.id;
                let wishlistData = {
                    disable: true
                };

                this.wishlistService.updateWishlist(wishlistId, wishlistData).subscribe(res => {
                    this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Success', detail: 'Venue remove from wishlist.', life: 3000 });
                }, err => {
                    this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.error, detail: 'System error, Please try again.', life: 6000 });
                });
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });

    }

}
