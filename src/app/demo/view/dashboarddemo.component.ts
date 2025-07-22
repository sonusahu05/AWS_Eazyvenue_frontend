import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService, ConfirmationService} from 'primeng/api';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { VenueOrderService } from 'src/app/services/venueOrder.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboarddemo.scss'],
    providers: [MessageService, ConfirmationService]
})
export class DashboardDemoComponent implements OnInit {

    pendingVenues: any[] = [];
    isAdmin: boolean = false;
    loading: boolean = false;

    // Dashboard statistics - simplified
    totalVenues: number = 0;
    totalBookings: number = 0;
    sendEnquiries: number = 0;
    bookNowOrders: number = 0;
    dashboardLoading: boolean = false;

    // Enquiry details
    sendEnquiriesList: any[] = [];
    bookNowOrdersList: any[] = [];
    showEnquiriesModal: boolean = false;
    showBookNowModal: boolean = false;

    constructor(
        private venueService: VenueService,
        private tokenStorageService: TokenStorageService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private venueOrderService: VenueOrderService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.checkUserRole();
        if (this.isAdmin) {
            this.loadPendingVenues();
        }
        this.loadDashboardStatistics();
    }

    checkUserRole() {
        const userData = this.tokenStorageService.getUser();
        this.isAdmin = userData && userData.userdata &&
                      (userData.userdata.rolename === 'admin' || userData.userdata.rolename === 'superadmin');
    }

    loadPendingVenues() {
        this.loading = true;
        // Query to get venues pending approval
        const query = '?filterByPendingApproval=true&filterByDisable=false&sortBy=createdAt&orderBy=DESC';

        this.venueService.getVenueListForFilter(query).subscribe(
            (data) => {
                this.pendingVenues = data.data.items || [];
                this.loading = false;
            },
            (err) => {
                console.error('Error loading pending venues:', err);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load pending venues'
                });
            }
        );
    }

    approveVenue(venue: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to approve the venue "${venue.name}"?`,
            header: 'Confirm Approval',
            icon: 'pi pi-check-circle',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.updateVenueStatus(venue.id, true, true, false); // active, assured, not pending
            }
        });
    }

    rejectVenue(venue: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to reject the venue "${venue.name}"? This action cannot be undone.`,
            header: 'Confirm Rejection',
            icon: 'pi pi-times-circle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.updateVenueStatus(venue.id, false, false, false, true); // inactive, not assured, not pending, disabled
            }
        });
    }

    updateVenueStatus(venueId: string, status: boolean, assured: boolean, pendingApproval: boolean, disable: boolean = false) {
        const updateData = {
            status: status,
            assured: assured,
            pendingApproval: pendingApproval,
            disable: disable,
            reviewedAt: new Date().toISOString(),
            reviewedBy: this.tokenStorageService.getUser().userdata.email
        };

        this.venueService.updateVenueStatus(venueId, updateData).subscribe(
            (response) => {
                const action = status ? 'approved' : 'rejected';
                this.messageService.add({
                    severity: status ? 'success' : 'warn',
                    summary: `Venue ${action}`,
                    detail: `The venue has been successfully ${action}.`
                });

                // Remove the venue from pending list
                this.pendingVenues = this.pendingVenues.filter(v => v.id !== venueId);

                // Optionally send notification to venue owner
                this.sendNotificationToVenueOwner(venueId, status);
            },
            (err) => {
                console.error('Error updating venue status:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update venue status'
                });
            }
        );
    }

    sendNotificationToVenueOwner(venueId: string, approved: boolean) {
        // Implement notification logic here
        // This could be an email, in-app notification, etc.
        const notificationData = {
            venueId: venueId,
            approved: approved,
            message: approved ?
                'Congratulations! Your venue has been approved and is now live.' :
                'Your venue submission has been rejected. Please contact support for more information.'
        };

        // Call notification service
        // this.notificationService.sendVenueStatusNotification(notificationData);
    }

    viewVenueDetails(venue: any) {
        // Navigate to venue details or open modal
        // this.router.navigate(['/manage/venue/view', venue.id]);
    }

    loadDashboardStatistics() {
        this.dashboardLoading = true;

        // Load all statistics in parallel for better performance
        this.loadAllStatisticsInParallel();
    }

    loadAllStatisticsInParallel() {
        this.loadingCounter = 0;


        const calls = [
            this.loadVenuesCount(),
            this.loadBookingsCount(),
            this.loadSendEnquiriesCount(),
            this.loadBookNowOrdersCount()
        ];

        Promise.all(calls).finally(() => {
            this.dashboardLoading = false;
        });
    }

    async loadSendEnquiriesCount() {
        try {
            const query = '?filterByOrderType=send_enquires&pageSize=1';
            const data = await this.venueOrderService.getVenueOrderListWithoutAuth(query).toPromise();
            
            if (data && data.data) {
                this.sendEnquiries = data.data.totalCount || 0;
                this.sendEnquiriesList = data.data.items || [];
            } else {
                this.sendEnquiries = 0;
                this.sendEnquiriesList = [];
            }
        } catch (error) {
            console.error('Error loading send enquiries:', error);
            this.sendEnquiries = 0;
            this.sendEnquiriesList = [];
        }
    }

    async loadBookNowOrdersCount() {
        try {
            const query = '?filterByOrderType=book_now&pageSize=1';
            const data = await this.venueOrderService.getVenueOrderListWithoutAuth(query).toPromise();
            
            if (data && data.data) {
                this.bookNowOrders = data.data.totalCount || 0;
                this.bookNowOrdersList = data.data.items || [];
            } else {
                this.bookNowOrders = 0;
                this.bookNowOrdersList = [];
            }
        } catch (error) {
            console.error('Error loading book now orders:', error);
            this.bookNowOrders = 0;
            this.bookNowOrdersList = [];
        }
    }
    private loadingCounter = 0;

    loadVenuesCount() {
        // Use public endpoint for faster loading
        this.venueService.getVenueListAllVenues().subscribe(
            (data) => {
                if (Array.isArray(data)) {
                    this.totalVenues = data.length;
                } else {
                    this.totalVenues = data.data?.totalCount || data.data?.items?.length || 0;
                }
                this.checkLoadingComplete();
            },
            (error) => {
                console.error('Error loading venues count:', error);
                this.totalVenues = 0;
                this.checkLoadingComplete();
            }
        );
    }

    loadBookingsCount() {
        // Use public endpoint with small page size for faster response
        const query = 'pageSize=10&pageNumber=1';
        this.venueOrderService.getVenueOrderListWithoutAuth(query).subscribe(
            (data) => {
                this.totalBookings = data.data?.totalCount || data.length || 0;
                this.checkLoadingComplete();
            },
            (error) => {
                console.error('Error loading bookings count:', error);
                this.totalBookings = 0;
                this.checkLoadingComplete();
            }
        );
    }

    loadOrderTypeBreakdown() {
        // Try multiple approaches to get the order data
        console.log('Starting to load order type breakdown...');

        // First try with auth
        const queryWithAuth = '?pageSize=1000&pageNumber=1';
        this.venueOrderService.getVenueOrderList(queryWithAuth).subscribe(
            (data) => {
                console.log('Order data received (with auth):', data);
                this.processOrderData(data);
            },
            (error) => {
                console.error('Error with auth, trying without auth:', error);

                // If auth fails, try without auth
                const queryWithoutAuth = 'pageSize=1000&pageNumber=1';
                this.venueOrderService.getVenueOrderListWithoutAuth(queryWithoutAuth).subscribe(
                    (data) => {
                        console.log('Order data received (without auth):', data);
                        this.processOrderData(data);
                    },
                    (error2) => {
                        console.error('Error without auth, trying alternative approach:', error2);

                        // Try a different approach - maybe the data is in a different format
                        this.loadOrderDataAlternative();
                    }
                );
            }
        );
    }

    processOrderData(data: any) {
        let orders = [];

        console.log('Raw data structure:', JSON.stringify(data, null, 2));


        if (Array.isArray(data)) {
            orders = data;
        } else if (data && data.data && Array.isArray(data.data.items)) {
            orders = data.data.items;
        } else if (data && data.data && Array.isArray(data.data)) {
            orders = data.data;
        } else if (data && Array.isArray(data.items)) {
            orders = data.items;
        } else if (data && data.result && Array.isArray(data.result)) {
            orders = data.result;
        } else if (data && data.orders && Array.isArray(data.orders)) {
            orders = data.orders;
        }

        console.log('Processed orders array:', orders);
        console.log('Orders length:', orders.length);

        if (orders.length > 0) {
            console.log('Sample order:', orders[0]);
        }

        // Filter and store orders by type
        this.sendEnquiriesList = orders.filter(order => {
            console.log('Checking order:', order.orderType);
            return order.orderType === 'send_enquires';
        });

        this.bookNowOrdersList = orders.filter(order => {
            return order.orderType === 'book_now';
        });

        // Count by order type
        this.sendEnquiries = this.sendEnquiriesList.length;
        this.bookNowOrders = this.bookNowOrdersList.length;

        console.log('Send enquiries found:', this.sendEnquiriesList);
        console.log('Send enquiries count:', this.sendEnquiries);
        console.log('Book now orders found:', this.bookNowOrdersList);
        console.log('Book now count:', this.bookNowOrders);

        this.checkLoadingComplete();
    }

    loadOrderDataAlternative() {
        // Try to use a hardcoded test to see if the component works
        console.log('Using alternative approach - creating test data');

        // Create some test data based on the structure you showed
        const testData = [
            {
                _id: "6568385f8e2cbeb95034e630",
                customerId: "655b4585c3c724384be668b6",
                orderType: "send_enquires",
                guestcnt: "100",
                price: 170000,
                status: true,
                created_at: "2023-11-30T07:23:11.938+00:00"
            },
            {
                _id: "656838798e2cbeb95034e634",
                customerId: "655b4585c3c724384be668b6",
                orderType: "book_now",
                guestcnt: "100",
                price: 170000,
                status: true,
                created_at: "2023-11-30T07:23:37.694+00:00"
            }
        ];

        this.processOrderData(testData);
    }
    showEnquiriesDetails() {
        this.showEnquiriesModal = true;
    }

    showBookNowDetails() {
        this.showBookNowModal = true;
    }

    closeEnquiriesModal() {
        this.showEnquiriesModal = false;
    }

    closeBookNowModal() {
        this.showBookNowModal = false;
    }

    checkLoadingComplete() {
        this.loadingCounter++;
        if (this.loadingCounter >= 3) { // We have 3 API calls now
            this.dashboardLoading = false;
            this.loadingCounter = 0;
        }
    }
}
