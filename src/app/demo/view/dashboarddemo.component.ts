import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService, ConfirmationService} from 'primeng/api';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboarddemo.scss'],
    providers: [MessageService, ConfirmationService]
})
export class DashboardDemoComponent implements OnInit {

    pendingVenues: any[] = [];
    isAdmin: boolean = false;
    loading: boolean = false;

    constructor(
        private venueService: VenueService,
        private tokenStorageService: TokenStorageService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.checkUserRole();
        if (this.isAdmin) {
            this.loadPendingVenues();
        }
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
}