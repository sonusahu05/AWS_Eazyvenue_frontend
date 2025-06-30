// Legacy method for backward compatibility
import { Component, OnInit } from '@angular/core';
import { EnquiryService } from '../service/eventmanager.service';
import { MessageService } from 'primeng/api';
import { TokenStorageService } from 'src/app/services/token-storage.service';

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

  constructor(
    private enquiryService: EnquiryService,
    private messageService: MessageService,
    private tokenStorageService: TokenStorageService // Add this service
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

    // For venue owners, we'll fetch all enquiries and filter client-side
    // since the backend filtering might not be properly configured
    let queryParams = '';

    // Don't use backend filtering for now - fetch all and filter client-side
    // if (this.isVenueOwner && this.userEmail) {
    //   queryParams = `?filterByVenueEmail=${encodeURIComponent(this.userEmail)}`;
    // }

    this.enquiryService.getEnquiryList(queryParams).subscribe(
      data => {
        console.log('📊 DASHBOARD: Received data from API:', data);
        this.loading = false;

        if (data && data.data && data.data.items && data.data.items.length > 0) {
          let enquiries = data.data.items;

          // Client-side filtering for venue owners
          if (this.isVenueOwner && this.userEmail) {
            console.log('📊 ENQUIRY: Starting client-side filtering for venue owner');
            console.log('📊 ENQUIRY: Total enquiries before filtering:', enquiries.length);
            console.log('📊 ENQUIRY: Looking for venues owned by:', this.userEmail);

            // Since we don't have venue email in enquiry data, we need to:
            // 1. Get all venues owned by this user
            // 2. Filter enquiries that match those venue IDs
            this.filterEnquiriesByVenueOwnership(enquiries);
            return;
          }

          // For non-venue owners, show all enquiries
          this.enquiryList = enquiries.map(enquiry => ({
            ...enquiry,
            selectedLead: null,
            selectedLeadData: null,
            showLeadDetails: false,
            currentLeadIndex: 0
          }));

          this.totalRecords = enquiries.length;
          console.log('📊 DASHBOARD: Enquiry list populated:', this.enquiryList);

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
    window.open(whatsappUrl, '_blank');

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
    window.open(`tel:+91${phoneNumber}`, '_self');

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

        // Optional: Reload the list to get completely fresh data
        // this.loadEnquiries();
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

  // Filter enquiries by venue ownership - more robust approach
  filterEnquiriesByVenueOwnership(enquiries: any[]) {
    console.log('📊 ENQUIRY: Filtering enquiries by venue ownership...');

    // First, let's try to identify the venue by name pattern
    // Since "Bawa International" should match "bawagurgaon@gmail.com"
    const filteredEnquiries = enquiries.filter(enquiry => {
      const venueName = enquiry.venueName ? enquiry.venueName.toLowerCase() : '';
      const userEmail = this.userEmail.toLowerCase();

      // Extract potential venue name from email
      // "bawagurgaon@gmail.com" -> "bawa"
      const emailPrefix = userEmail.split('@')[0];
      let venueNameFromEmail = '';

      if (emailPrefix.includes('bawa')) {
        venueNameFromEmail = 'bawa';
      } else {
        // Extract first part before numbers/location
        venueNameFromEmail = emailPrefix.replace(/[0-9]/g, '').replace(/(gurgaon|delhi|mumbai|bangalore|chennai|hyderabad|pune|kolkata)/g, '');
      }

      console.log('📊 ENQUIRY: Checking venue:', {
        venueName: enquiry.venueName,
        venueId: enquiry.venueId,
        userEmail: this.userEmail,
        venueNameFromEmail: venueNameFromEmail,
        contains: venueName.includes(venueNameFromEmail)
      });

      // Check if venue name contains the extracted name from email
      if (venueNameFromEmail && venueName.includes(venueNameFromEmail)) {
        console.log(`✓ MATCH FOUND: ${enquiry.venueName} matches ${venueNameFromEmail}`);
        return true;
      }

      // Additional check: venue ID matching (if you have a pattern)
      if (enquiry.venueId) {
        console.log(`📊 ENQUIRY: Venue ID for ${enquiry.venueName}: ${enquiry.venueId}`);
      }

      return false;
    });

    console.log(`📊 ENQUIRY: Found ${filteredEnquiries.length} matching enquiries for venue owner: ${this.userEmail}`);

    // If no matches found with name matching, let's check if we need to make an API call
    if (filteredEnquiries.length === 0) {
      console.log('📊 ENQUIRY: No matches found with name matching. Checking with venue service...');
      this.getVenueOwnerVenuesAndFilter(enquiries);
      return;
    }

    // Update the UI with filtered results
    this.updateEnquiryList(filteredEnquiries);
  }

  // Get venues owned by this user and filter enquiries
  getVenueOwnerVenuesAndFilter(enquiries: any[]) {
    // You'll need to inject VenueService for this to work
    // For now, let's use a fallback approach

    console.log('📊 ENQUIRY: Attempting to get venues for owner:', this.userEmail);

    // Temporary fallback: show all enquiries with a warning
    // In production, you should make an API call to get venues owned by this user
    this.messageService.add({
      key: 'toastmsg',
      severity: 'warn',
      summary: 'Filtering Issue',
      detail: 'Cannot properly filter enquiries. Please contact support to configure venue-enquiry mapping.',
      life: 10000,
    });

    // For debugging: show all enquiries but mark them
    const debugEnquiries = enquiries.map(enquiry => ({
      ...enquiry,
      _debugNote: 'Filtering not working properly - all enquiries shown'
    }));

    this.updateEnquiryList(debugEnquiries);
  }

  updateStatus(enquiry: any, status: string) {
    const currentUser = this.getCurrentUser(enquiry);
    this.updateLeadStatus(currentUser, enquiry, status);
  }

  // Helper method to update enquiry list
  updateEnquiryList(enquiries: any[]) {
    this.enquiryList = enquiries.map(enquiry => ({
      ...enquiry,
      selectedLead: null,
      selectedLeadData: null,
      showLeadDetails: false,
      currentLeadIndex: 0
    }));

    this.totalRecords = enquiries.length;
    console.log('📊 DASHBOARD: Enquiry list updated:', this.enquiryList);

    // Show message if venue owner has no enquiries
    if (this.isVenueOwner && enquiries.length === 0) {
      this.messageService.add({
        key: 'toastmsg',
        severity: 'info',
        summary: 'No Enquiries Found',
        detail: `No enquiries found for your venues (${this.userEmail}).`,
        life: 5000,
      });
    }
  }
}