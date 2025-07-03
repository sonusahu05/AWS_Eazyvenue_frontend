import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { EnquiryService } from '../service/eventmanager.service';
import { MessageService } from 'primeng/api';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-enquiry-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [MessageService]
})
export class EnquiryListComponent implements OnInit {
  enquiryList: any[] = [];
  loading: boolean = false;
  totalRecords = 0;
  cols: any[];
  isVenueOwner: boolean = false;
  userEmail: string = '';
  userVenueIds: string[] = []; // Store venue IDs owned by this user

  constructor(
    private enquiryService: EnquiryService,
    private messageService: MessageService,
    private tokenStorageService: TokenStorageService,
    private venueService: VenueService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'venueName', header: 'Venue Name' },
      { field: 'userName', header: 'User Name' },
      { field: 'userContact', header: 'Contact' },
      { field: 'leadCount', header: 'No of Leads' },
      { field: 'created_at', header: 'Date' },
      { field: 'status', header: 'Status' }
    ];

    // Check user role and get email
    this.checkUserRole();
    this.loadEnquiries();
  }

  checkUserRole() {
    const userData = this.tokenStorageService.getUser();
    console.log('📊 ENQUIRY: User data:', userData);

    this.isVenueOwner = userData && userData.userdata && userData.userdata.rolename === 'venueowner';
    console.log('📊 ENQUIRY: Is venue owner:', this.isVenueOwner);

    if (this.isVenueOwner && userData.userdata.email) {
      this.userEmail = userData.userdata.email.trim();
      console.log('📊 ENQUIRY: Venue owner email:', this.userEmail);
    }
  }

  loadEnquiries() {
    console.log('📊 DASHBOARD: Starting to load enquiries...');
    this.loading = true;

    if (this.isVenueOwner && this.userEmail) {
      // For venue owners, first get their venues, then filter enquiries
      this.loadVenueOwnerEnquiries();
    } else {
      // For non-venue owners, load all enquiries
      this.loadAllEnquiries();
    }
  }

  // Load enquiries for venue owners
  loadVenueOwnerEnquiries() {
    console.log('📊 ENQUIRY: Loading enquiries for venue owner...');

    // First, get venues owned by this user
    this.getUserVenues().then(venueIds => {
      this.userVenueIds = venueIds;
      console.log('📊 ENQUIRY: User owns venues:', this.userVenueIds);

      if (this.userVenueIds.length === 0) {
        console.log('📊 ENQUIRY: No venues found for this user');
        this.loading = false;
        this.enquiryList = [];
        this.totalRecords = 0;

        this.messageService.add({
          key: 'toastmsg',
          severity: 'info',
          summary: 'No Venues',
          detail: 'No venues found for your account. Please contact support.',
          life: 5000,
        });
        return;
      }

      // Now load all enquiries and filter by venue IDs
      this.loadAllEnquiries();

    }).catch(error => {
      console.error('📊 ENQUIRY: Error getting user venues:', error);
      this.loading = false;
      this.messageService.add({
        key: 'toastmsg',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load your venues. Please try again.',
        life: 5000,
      });
    });
  }

  // Get venues owned by the current user
  async getUserVenues(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Build query to get venues for this user
      // You can use the same approach as in your venue list component
      let query = new URLSearchParams({
        admin: 'true',
        pageSize: '1000',
        pageNumber: '1',
        filterByDisable: 'false'
      });

      const queryString = '?' + query.toString();

      this.venueService.getVenueListForFilter(queryString).subscribe(
        (data) => {
          console.log('📊 ENQUIRY: Venue API Response:', data);

          let venues = data.data.items || [];

          // Filter venues by user email (same logic as venue list)
          const userVenues = venues.filter(venue => {
            if (!venue.email) return false;

            const venueEmail = venue.email.trim().toLowerCase();
            const userEmailLower = this.userEmail.toLowerCase();

            return venueEmail === userEmailLower;
          });

          console.log('📊 ENQUIRY: Found user venues:', userVenues.length);

          // Extract venue IDs
          const venueIds = userVenues.map(venue => venue.id || venue._id);
          console.log('📊 ENQUIRY: Venue IDs:', venueIds);

          resolve(venueIds);
        },
        (error) => {
          console.error('📊 ENQUIRY: Error fetching venues:', error);
          reject(error);
        }
      );
    });
  }

  loadAllEnquiries() {
    console.log('📊 DASHBOARD: Loading all enquiries...');

    // Option 1: Try backend filtering first (if you implement the enhanced backend)
    let queryParams = '';
    if (this.isVenueOwner && this.userEmail) {
      queryParams = `?filterByVenueEmail=${encodeURIComponent(this.userEmail)}`;
    }

    this.enquiryService.getEnquiryList(queryParams).subscribe(
      data => {
        console.log('📊 DASHBOARD: Received data from API:', data);
        this.loading = false;

        if (data && data.data && data.data.items && data.data.items.length > 0) {
          let enquiries = data.data.items;

          // Client-side filtering for venue owners if backend filtering didn't work
          if (this.isVenueOwner && this.userVenueIds.length > 0) {
            console.log('📊 ENQUIRY: Applying client-side venue filtering...');
            enquiries = this.filterEnquiriesByVenueIds(enquiries);
          }

          // Process enquiries
          this.enquiryList = enquiries.map(enquiry => ({
            ...enquiry,
            selectedLead: null,
            selectedLeadData: null,
            showLeadDetails: false,
            currentLeadIndex: 0
          }));

          this.totalRecords = enquiries.length;
          console.log('📊 DASHBOARD: Enquiry list populated:', this.enquiryList);

          // Show message if venue owner has no enquiries after filtering
          if (this.isVenueOwner && enquiries.length === 0) {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'info',
              summary: 'No Enquiries',
              detail: 'No enquiries found for your venues.',
              life: 3000,
            });
          }

        } else {
          console.log('📊 DASHBOARD: No data found, showing empty state');
          this.enquiryList = [];
          this.totalRecords = 0;

          if (this.isVenueOwner) {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'info',
              summary: 'No Enquiries',
              detail: 'No enquiries found for your venues.',
              life: 3000,
            });
          }
        }
      },
      err => {
        console.error('📊 DASHBOARD: Error loading enquiries:', err);
        this.loading = false;
        this.enquiryList = [];
        this.totalRecords = 0;

        // Show error message to user
        this.messageService.add({
          key: 'toastmsg',
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to load enquiries. Please check your network connection.'
        });
      }
    );
  }

  // Filter enquiries by venue IDs
  filterEnquiriesByVenueIds(enquiries: any[]): any[] {
    console.log('📊 ENQUIRY: Filtering enquiries by venue IDs...');
    console.log('📊 ENQUIRY: Total enquiries:', enquiries.length);
    console.log('📊 ENQUIRY: User venue IDs:', this.userVenueIds);

    const filteredEnquiries = enquiries.filter(enquiry => {
      const venueId = enquiry.venueId || enquiry.venue_id;
      const isMatch = this.userVenueIds.includes(venueId);

      if (isMatch) {
        console.log('📊 ENQUIRY: ✓ Match found for venue:', enquiry.venueName, 'ID:', venueId);
      }

      return isMatch;
    });

    console.log('📊 ENQUIRY: Filtered enquiries count:', filteredEnquiries.length);
    return filteredEnquiries;
  }

  // Get dropdown options for leads using allEnquiries from backend
  getLeadOptions(enquiry: any): any[] {
    if (!enquiry.allEnquiries || enquiry.allEnquiries.length <= 1) {
      return [];
    }

    return enquiry.allEnquiries.map((lead: any, index: number) => ({
      label: `${lead.userName} - ${lead.userContact} (${new Date(lead.created_at).toLocaleDateString()})`,
      value: index
    }));
  }

  // Handle dropdown change
  onLeadChange(enquiry: any, event: any) {
    const selectedIndex = event.value;
    if (enquiry.allEnquiries && enquiry.allEnquiries[selectedIndex]) {
      enquiry.selectedLeadData = enquiry.allEnquiries[selectedIndex];
      enquiry.showLeadDetails = true;
      enquiry.currentLeadIndex = selectedIndex;

      console.log('📊 Selected lead:', enquiry.selectedLeadData);
    }
  }

  // Get current user data (latest or selected)
  getCurrentUser(enquiry: any): any {
    if (enquiry.selectedLeadData) {
      return enquiry.selectedLeadData;
    }

    // Return the latest lead (first in the allEnquiries array since backend sorts by latest)
    if (enquiry.allEnquiries && enquiry.allEnquiries.length > 0) {
      return enquiry.allEnquiries[0];
    }

    // Fallback to main enquiry data
    return enquiry;
  }

  // Contact via WhatsApp for main lead
  contactViaWhatsApp(enquiry: any) {
    const currentUser = this.getCurrentUser(enquiry);
    this.contactViaWhatsAppForLead(currentUser, enquiry);
  }

  // Contact via WhatsApp for specific lead
  contactViaWhatsAppForLead(leadData: any, enquiry: any) {
    const phoneNumber = leadData.userContact.toString();
    const venueName = enquiry.venueName;

    // Create WhatsApp message
    const message = `Hello ${leadData.userName}!

Thank you for your enquiry about ${venueName}.

We are excited to help you plan your event at our venue. Our team will provide you with all the details including:
- Venue availability
- Pricing packages
- Facilities and amenities
- Catering options
- Setup arrangements

Please let us know your preferred date and event requirements so we can send you a detailed proposal.

Looking forward to hosting your special event!

Best regards,
${venueName} Team`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappUrl, '_blank');
    }

    // Update status
    this.updateLeadStatus(leadData, enquiry, 'WhatsApp Contacted');
  }

  // Contact via Phone for main lead
  contactViaPhone(enquiry: any) {
    const currentUser = this.getCurrentUser(enquiry);
    this.contactViaPhoneForLead(currentUser, enquiry);
  }

  // Contact via Phone for specific lead
  contactViaPhoneForLead(leadData: any, enquiry: any) {
    const phoneNumber = leadData.userContact.toString();

    // Open phone dialer
    if (isPlatformBrowser(this.platformId)) {
      window.open(`tel:+91${phoneNumber}`, '_self');
    }

    // Update status
    this.updateLeadStatus(leadData, enquiry, 'Phone Contacted');
  }

  // Update status for specific lead - works with existing backend
  updateLeadStatus(leadData: any, enquiry: any, status: string) {
    const updateData = { status: status };
    // Use the individual lead ID if available, otherwise use the main enquiry ID
    const leadId = leadData._id || leadData.id || enquiry.id;

    console.log('📞 Updating lead status:', leadId, 'to:', status);

    this.enquiryService.updateEnquiry(leadId, updateData).subscribe(
      res => {
        this.messageService.add({
          key: 'toastmsg',
          severity: 'success',
          summary: 'Updated',
          detail: `Status updated to ${status}`
        });

        // Update the status in the current data
        leadData.status = status;

        // If this is the main lead (first in allEnquiries), update the main enquiry status too
        if (enquiry.allEnquiries && enquiry.allEnquiries[0] === leadData) {
          enquiry.status = status;
        }

        // If this is the currently displayed lead, update it
        if (enquiry.selectedLeadData === leadData) {
          enquiry.selectedLeadData.status = status;
        }
      },
      err => {
        console.error('📞 Error updating status:', err);
        this.messageService.add({
          key: 'toastmsg',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update status'
        });
      }
    );
  }

  updateStatus(enquiry: any, status: string) {
    const currentUser = this.getCurrentUser(enquiry);
    this.updateLeadStatus(currentUser, enquiry, status);
  }
}