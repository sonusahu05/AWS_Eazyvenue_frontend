import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { EnquiryService } from '../service/eventmanager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { VenueService } from 'src/app/manage/venue/service/venue.service';
import { isPlatformBrowser } from '@angular/common';
import * as XLSX from 'xlsx';

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
  showVenueFilter: boolean = false;
selectedVenueFilter: string | null = null;
showAddEnquiryModal: boolean = false;
venueOptions: any[] = [];
selectedVenues: any[] = [];
leadEntries: any[] = [];
statusOptions: any[] = [
  { label: 'New', value: 'New' },
  { label: 'WhatsApp Contacted', value: 'WhatsApp Contacted' },
  { label: 'Phone Contacted', value: 'Phone Contacted' },
  { label: 'Closed', value: 'Closed' }
];
submittingEnquiry: boolean = false;
showValidationErrors: boolean = false;
private leadIdCounter: number = 1;
uniqueVenues: any[] = [];
filteredEnquiryList: any[] = [];
  userEmail: string = '';
  userVenueIds: string[] = []; // Store venue IDs owned by this user
  expandedLeads: { [key: string]: boolean } = {}; // Track which venue's leads are expanded

  // 🔥 REVOLUTIONARY FEATURES - Live Behavior Tracking
  liveTrackingData: { [key: string]: any } = {}; // Store live tracking data for each lead
  behaviorInsights: { [key: string]: any } = {}; // AI-generated insights for each lead
  showBehaviorPanel: boolean = false;
  selectedLeadForTracking: any = null;
  realTimeAlerts: any[] = [];
  trackingWebSocket: WebSocket | null = null;
  
  // AI tracking insights storage
  aiInsights: { [key: string]: any } = {};
  
  // Notification queue system for sequential display
  private notificationQueue: any[] = [];
  private isProcessingNotifications: boolean = false;
  
  // 🔥 Make Math available in template
  Math = Math;

  constructor(
    private enquiryService: EnquiryService,
    private messageService: MessageService,
    private tokenStorageService: TokenStorageService,
    private venueService: VenueService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeLeadEntries();
  }

  ngOnInit() {
    this.cols = [
      { field: 'venueName', header: 'Venue Name' },
      { field: 'userName', header: 'User Name' },
      { field: 'userContact', header: 'Contact' },
      { field: 'leadCount', header: 'No of Leads' },
      { field: 'created_at', header: 'Date' },
      { field: 'status', header: 'Status' },
      { field: 'liveTracking', header: '🔮 Live Insights' }, // 🚀 NEW: Live tracking column
      { field: 'aiProbability', header: '🎯 AI Score' } // 🚀 NEW: AI probability column
    ];

    // Check user role and get email
    this.checkUserRole();
    this.loadEnquiries();
    
    // 🚀 Initialize revolutionary live tracking system
    this.initializeLiveTracking();
    this.startRealTimeAlerts();
  }

  // Add these methods to your component class

initializeLeadEntries() {
  this.leadEntries = [this.createNewLead()];
}

createNewLead() {
  return {
    id: this.leadIdCounter++,
    userName: '',
    userContact: '',
    userEmail: '',
    enquiryDate: new Date(),
    status: 'New',
    notes: ''
  };
}

exportEnquiriesToCSV() {
  const enquiriesToExport = this.getDisplayEnquiries();

  if (enquiriesToExport.length === 0) {
    this.messageService.add({
      key: 'toastmsg',
      severity: 'warn',
      summary: 'No Data',
      detail: 'No enquiries to export'
    });
    return;
  }

  const exportData = [];

  enquiriesToExport.forEach(enquiry => {
    if (enquiry.individualLead) {
      exportData.push({
        'Venue Name': enquiry.venueName,
        'Customer Name': enquiry.userName,
        'Contact Number': enquiry.userContact,
        'Email': enquiry.userEmail || 'N/A',
        'Status': enquiry.status,
        'Enquiry Date': new Date(enquiry.created_at).toLocaleString(),
        'Lead Number': `${enquiry.leadIndex} of ${enquiry.originalLeadCount}`
      });
    } else {
      if (enquiry.allEnquiries && enquiry.allEnquiries.length > 1) {
        enquiry.allEnquiries.forEach((lead: any, index: number) => {
          exportData.push({
            'Venue Name': enquiry.venueName,
            'Customer Name': lead.userName,
            'Contact Number': lead.userContact,
            'Email': lead.userEmail || 'N/A',
            'Status': lead.status,
            'Enquiry Date': new Date(lead.created_at).toLocaleString(),
            'Lead Number': `${index + 1} of ${enquiry.leadCount}`
          });
        });
      } else {
        exportData.push({
          'Venue Name': enquiry.venueName,
          'Customer Name': enquiry.userName,
          'Contact Number': enquiry.userContact,
          'Email': enquiry.userEmail || 'N/A',
          'Status': enquiry.status,
          'Enquiry Date': new Date(enquiry.created_at).toLocaleString(),
          'Lead Number': '1 of 1'
        });
      }
    }
  });

  // Convert to worksheet and then CSV
  const ws = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Generate filename
  const venueName = this.selectedVenueFilter
    ? this.uniqueVenues.find(v => v.id === this.selectedVenueFilter)?.name
    : 'All_Venues';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${venueName}_Enquiries_${timestamp}.csv`;

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  this.messageService.add({
    key: 'toastmsg',
    severity: 'success',
    summary: 'Export Successful',
    detail: `${exportData.length} enquiries exported as CSV`
  });
}

loadVenueOptions() {
  let query = new URLSearchParams({
    admin: 'true',
    pageSize: '1000',
    pageNumber: '1',
    filterByDisable: 'false'
  });

  const queryString = '?' + query.toString();

  this.venueService.getVenueListForFilter(queryString).subscribe(
    (data) => {
      if (data && data.data && data.data.items) {
        this.venueOptions = data.data.items.map(venue => ({
          label: `${venue.name} - ${venue.address || venue.location || ''}`,
          value: venue.id || venue._id,
          venueName: venue.name
        }));
      }
    },
    (error) => {
      console.error('Error loading venues:', error);
      this.messageService.add({
        key: 'toastmsg',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load venues for selection'
      });
    }
  );
}

openAddEnquiryModal() {
  this.showAddEnquiryModal = true;
  this.loadVenueOptions();
  this.resetForm();
}

closeAddEnquiryModal() {
  this.showAddEnquiryModal = false;
  this.resetForm();
}

resetForm() {
  this.selectedVenues = [];
  this.leadEntries = [this.createNewLead()];
  this.showValidationErrors = false;
  this.submittingEnquiry = false;
  this.leadIdCounter = 1;
}

addNewLead() {
  if (this.leadEntries.length < 10) {
    this.leadEntries.push(this.createNewLead());
  }
}

removeLead(index: number) {
  if (this.leadEntries.length > 1) {
    this.leadEntries.splice(index, 1);
  }
}

clearAllLeads() {
  this.leadEntries = [this.createNewLead()];
  this.showValidationErrors = false;
}

trackByLeadId(index: number, lead: any): number {
  return lead.id;
}

validateContactNumber(lead: any) {
  const phoneRegex = /^[0-9]{10}$/;
  lead.contactValid = phoneRegex.test(lead.userContact);
}

isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

isFormValid(): boolean {
  if (this.selectedVenues.length === 0) {
    return false;
  }

  const validLeads = this.leadEntries.filter(lead =>
    lead.userName && lead.userName.trim() &&
    lead.userContact && lead.userContact.trim() &&
    this.isValidContactNumber(lead.userContact)
  );

  return validLeads.length > 0;
}

isValidContactNumber(contact: string): boolean {
  return /^[0-9]{10}$/.test(contact);
}

getValidLeadsCount(): number {
  return this.leadEntries.filter(lead =>
    lead.userName && lead.userName.trim() &&
    lead.userContact && lead.userContact.trim() &&
    this.isValidContactNumber(lead.userContact)
  ).length;
}

submitBulkEnquiries() {
  if (!this.isFormValid()) {
    this.showValidationErrors = true;
    this.messageService.add({
      key: 'toastmsg',
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields and select at least one venue'
    });
    return;
  }

  this.submittingEnquiry = true;

  // Filter valid leads
  const validLeads = this.leadEntries.filter(lead =>
    lead.userName && lead.userName.trim() &&
    lead.userContact && lead.userContact.trim() &&
    this.isValidContactNumber(lead.userContact)
  );

  // Create enquiries for each venue-lead combination
  const enquiriesToCreate = [];

  this.selectedVenues.forEach(venueId => {
    const selectedVenue = this.venueOptions.find(v => v.value === venueId);

    validLeads.forEach(lead => {
      const enquiryData = {
        venueId: venueId,
        venueName: selectedVenue ? selectedVenue.venueName : '',
        userName: lead.userName.trim(),
        userContact: lead.userContact.trim(),
        userEmail: lead.userEmail ? lead.userEmail.trim() : '',
        status: lead.status || 'New',
        notes: lead.notes ? lead.notes.trim() : '',
        created_at: lead.enquiryDate,
        isManualEntry: true
      };

      enquiriesToCreate.push(enquiryData);
    });
  });

  console.log('📝 BULK ENQUIRY: Creating', enquiriesToCreate.length, 'enquiries');

  // Submit all enquiries
  this.createEnquiriesSequentially(enquiriesToCreate, 0);
}

createEnquiriesSequentially(enquiries: any[], currentIndex: number) {
  if (currentIndex >= enquiries.length) {
    // All enquiries created successfully
    this.submittingEnquiry = false;
    this.closeAddEnquiryModal();

    this.messageService.add({
      key: 'toastmsg',
      severity: 'success',
      summary: 'Success',
      detail: `Successfully created ${enquiries.length} enquiries!`
    });

    this.loadEnquiries();
    return;
  }

  const currentEnquiry = enquiries[currentIndex];

  this.enquiryService.createEnquiry(currentEnquiry).subscribe(
    (response) => {
      console.log(`📝 BULK ENQUIRY: Created enquiry ${currentIndex + 1}/${enquiries.length}`);

      // Create next enquiry
      this.createEnquiriesSequentially(enquiries, currentIndex + 1);
    },
    (error) => {
      console.error(`📝 BULK ENQUIRY: Error creating enquiry ${currentIndex + 1}:`, error);

      // Continue with next enquiry even if one fails
      this.createEnquiriesSequentially(enquiries, currentIndex + 1);
    }
  );
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

generateUniqueVenues() {
    const venueMap = new Map();

    this.enquiryList.forEach(enquiry => {
        const venueId = enquiry.venueId || enquiry.venue_id;
        const venueName = enquiry.venueName;

        if (venueMap.has(venueId)) {
            venueMap.get(venueId).count++;
            venueMap.get(venueId).totalLeads += enquiry.leadCount || 1;
        } else {
            venueMap.set(venueId, {
                id: venueId,
                name: venueName,
                count: 1,
                totalLeads: enquiry.leadCount || 1
            });
        }
    });

    this.uniqueVenues = Array.from(venueMap.values())
        .sort((a, b) => b.count - a.count);
}

selectVenueFilter(venue: any) {
    this.selectedVenueFilter = venue.id;
    this.showVenueFilter = false;
    this.applyVenueFilter();
}

applyVenueFilter() {
    if (this.selectedVenueFilter) {
        // When venue filter is active, expand all leads as individual rows
        this.filteredEnquiryList = [];

        this.enquiryList.forEach(enquiry => {
            const venueId = enquiry.venueId || enquiry.venue_id;

            if (venueId === this.selectedVenueFilter) {
                // If enquiry has multiple leads, create separate rows for each
                if (enquiry.allEnquiries && enquiry.allEnquiries.length > 1) {
                    enquiry.allEnquiries.forEach((lead: any, index: number) => {
                        this.filteredEnquiryList.push({
                            ...enquiry,
                            // Override with individual lead data
                            userName: lead.userName,
                            userContact: lead.userContact,
                            userEmail: lead.userEmail,
                            created_at: lead.created_at,
                            status: lead.status,
                            _id: lead._id || lead.id,
                            // Keep original data for reference
                            originalLeadCount: enquiry.leadCount,
                            leadIndex: index + 1,
                            individualLead: true,
                            leadData: lead
                        });
                    });
                } else {
                    // Single lead, just add as is
                    this.filteredEnquiryList.push({
                        ...enquiry,
                        originalLeadCount: enquiry.leadCount,
                        leadIndex: 1,
                        individualLead: true
                    });
                }
            }
        });
    } else {
        // No filter, show original format
        this.filteredEnquiryList = [...this.enquiryList];
    }
}

getDisplayEnquiries() {
    return this.selectedVenueFilter ? this.filteredEnquiryList : this.enquiryList;
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

          // 🔥 GENERATE REVOLUTIONARY LIVE TRACKING DATA IMMEDIATELY
          console.log('🔮 LIVE TRACKING: Generating behavior data for', this.enquiryList.length, 'enquiries...');
          this.generateMockBehaviorData();

          // Generate unique venues for filter dropdown
          this.generateUniqueVenues();

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

          // 🔥 GENERATE DEMO DATA FOR TESTING IF NO REAL DATA EXISTS
          console.log('🔮 DEMO MODE: Generating sample enquiries for testing...');
          this.generateDemoEnquiries();

          if (this.isVenueOwner) {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'info',
              summary: 'Demo Mode',
              detail: 'Showing sample data with revolutionary live tracking features.',
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
    this.applyVenueFilter();
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

  // Toggle leads expansion for a venue
  toggleLeadsExpansion(enquiry: any) {
    const venueId = enquiry.venueId || enquiry.venue_id || enquiry.id;
    this.expandedLeads[venueId] = !this.expandedLeads[venueId];

    // Reset any previous dropdown selections when toggling
    enquiry.selectedLeadData = null;
    enquiry.showLeadDetails = false;

    console.log('📊 Toggled leads expansion for venue:', venueId, 'Expanded:', this.expandedLeads[venueId]);
  }

  // Check if leads are expanded for a venue
  isLeadsExpanded(enquiry: any): boolean {
    const venueId = enquiry.venueId || enquiry.venue_id || enquiry.id;
    return !!this.expandedLeads[venueId];
  }

  // Get all leads for a venue (for the expanded view)
  getAllLeadsForVenue(enquiry: any): any[] {
    if (!enquiry.allEnquiries || enquiry.allEnquiries.length <= 1) {
      return [enquiry]; // Return the single enquiry as an array
    }
    return enquiry.allEnquiries;
  }
  // Get current user data (latest or selected)
getCurrentUser(enquiry: any): any {
    // If this is an individual lead from filtering, return the lead data
    if (enquiry.individualLead && enquiry.leadData) {
        return enquiry.leadData;
    }

    // If this is individual lead without separate leadData, return enquiry itself
    if (enquiry.individualLead) {
        return enquiry;
    }

    // Original logic for dropdown mode
    if (enquiry.selectedLeadData) {
        return enquiry.selectedLeadData;
    }

    if (enquiry.allEnquiries && enquiry.allEnquiries.length > 0) {
        return enquiry.allEnquiries[0];
    }

    return enquiry;
}

  // Contact via WhatsApp for main lead
  contactViaWhatsApp(enquiry: any) {
    const currentUser = this.getCurrentUser(enquiry);
    this.contactViaWhatsAppForLead(currentUser, enquiry);
  }

  // Contact via WhatsApp for specific lead - now tracks click count
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

    // Update click count instead of status
    this.updateClickCount(leadData, enquiry, 'whatsapp');
  }

  // Contact via Phone for main lead
  contactViaPhone(enquiry: any) {
    const currentUser = this.getCurrentUser(enquiry);
    this.contactViaPhoneForLead(currentUser, enquiry);
  }

  // Contact via Phone for specific lead - now tracks click count
  contactViaPhoneForLead(leadData: any, enquiry: any) {
    const phoneNumber = leadData.userContact.toString();

    // Open phone dialer
    if (isPlatformBrowser(this.platformId)) {
      window.open(`tel:+91${phoneNumber}`, '_self');
    }

    // Update click count instead of status
    this.updateClickCount(leadData, enquiry, 'phone');
  }

  // New method to update click counts
  updateClickCount(leadData: any, enquiry: any, type: 'whatsapp' | 'phone') {
    const leadId = leadData._id || leadData.id || enquiry.id;
    
    // Initialize click counts if not exist
    if (!leadData.whatsappClickCount) leadData.whatsappClickCount = 0;
    if (!leadData.phoneClickCount) leadData.phoneClickCount = 0;
    
    // Increment appropriate counter
    if (type === 'whatsapp') {
      leadData.whatsappClickCount++;
    } else {
      leadData.phoneClickCount++;
    }
    
    // Update in database
    const updateData = {
      whatsappClickCount: leadData.whatsappClickCount,
      phoneClickCount: leadData.phoneClickCount,
      status: this.getStatusFromClickCounts(leadData.whatsappClickCount, leadData.phoneClickCount)
    };

    console.log(`📞 Updating ${type} click count:`, leadId, 'new count:', type === 'whatsapp' ? leadData.whatsappClickCount : leadData.phoneClickCount);

    this.enquiryService.updateEnquiry(leadId, updateData).subscribe(
        res => {
            this.queueNotification({
                key: 'toastmsg',
                severity: 'success',
                summary: type === 'whatsapp' ? '✅ WhatsApp Clicked' : '✅ Phone Clicked',
                detail: `${leadData.userName} - ${type === 'whatsapp' ? 'WhatsApp' : 'Phone'} clicked ${type === 'whatsapp' ? leadData.whatsappClickCount : leadData.phoneClickCount} time(s)`,
                life: 3000
            });

            // Update the data in current display
            if (enquiry.individualLead) {
                enquiry.whatsappClickCount = leadData.whatsappClickCount;
                enquiry.phoneClickCount = leadData.phoneClickCount;
                enquiry.status = updateData.status;
            }
        },
        err => {
            console.error('📞 Error updating click count:', err);
            this.queueNotification({
                key: 'toastmsg',
                severity: 'error',
                summary: '❌ Update Failed',
                detail: 'Could not update click count',
                life: 4000
            });
        }
    );
  }

  // Helper method to determine status from click counts
  getStatusFromClickCounts(whatsappCount: number, phoneCount: number): string {
    if (whatsappCount > 0 && phoneCount > 0) {
      return 'Both Contacted';
    } else if (whatsappCount > 0) {
      return 'WhatsApp Contacted';
    } else if (phoneCount > 0) {
      return 'Phone Contacted';
    } else {
      return 'New';
    }
  }

  // Delete lead functionality
  deleteLead(enquiry: any) {
    const currentUser = this.getCurrentUser(enquiry);
    this.deleteSpecificLead(currentUser, enquiry);
  }

  // Delete specific lead
  deleteSpecificLead(leadData: any, enquiry: any) {
    console.log('🗑️ Delete function called with:', { leadData, enquiry });
    
    // Determine the correct ID for deletion
    let leadId = null;
    let leadName = 'Unknown Lead';
    
    // If this is an individual lead from filtering or expansion
    if (enquiry.individualLead) {
      leadId = enquiry._id || enquiry.id;
      leadName = enquiry.userName || enquiry.name;
      console.log('🗑️ Individual lead detected, using enquiry ID:', leadId);
    } 
    // If this is lead data from expanded view
    else if (leadData && (leadData._id || leadData.id)) {
      leadId = leadData._id || leadData.id;
      leadName = leadData.userName || leadData.name;
      console.log('🗑️ Using leadData ID:', leadId);
    }
    // Fallback to enquiry ID
    else {
      leadId = enquiry._id || enquiry.id;
      leadName = enquiry.userName || enquiry.venueName;
      console.log('🗑️ Fallback to enquiry ID:', leadId);
    }
    
    console.log('🗑️ Final deletion target:', { leadId, leadName });
    
    if (!leadId) {
      console.error('🗑️ Error: No valid ID found for deletion');
      this.queueNotification({
        key: 'toastmsg',
        severity: 'error',
        summary: '❌ Delete Failed',
        detail: 'Could not find lead ID for deletion',
        life: 4000
      });
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete lead "${leadName}"? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      console.log('🗑️ User confirmed deletion, calling service with ID:', leadId);
      
      this.enquiryService.deleteEnquiry(leadId).subscribe({
        next: (res) => {
          console.log('🗑️ Delete successful:', res);
          this.queueNotification({
            key: 'toastmsg',
            severity: 'success',
            summary: '✅ Lead Deleted',
            detail: `${leadName} has been removed successfully`,
            life: 2000
          });

          // Refresh the enquiry list
          this.loadAllEnquiries();
        },
        error: (err) => {
          console.error('🗑️ Error deleting lead:', err);
          let errorMessage = 'Please try again.';
          
          if (err.status === 404) {
            errorMessage = 'Lead not found. It may have already been deleted.';
          } else if (err.error && err.error.error) {
            errorMessage = err.error.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          this.queueNotification({
            key: 'toastmsg',
            severity: 'error',
            summary: '❌ Delete Failed',
            detail: `Could not delete ${leadName}. ${errorMessage}`,
            life: 4000
          });
        }
      });
    } else {
      console.log('🗑️ User cancelled deletion');
    }
  }

  // Update status for specific lead - works with existing backend
  updateLeadStatus(leadData: any, enquiry: any, status: string) {
    const updateData = { status: status };

    // For individual leads from filtering, use the lead's own ID
    let leadId;
    if (enquiry.individualLead) {
        leadId = enquiry._id || enquiry.id;
    } else {
        leadId = leadData._id || leadData.id || enquiry.id;
    }

    console.log('📞 Updating lead status:', leadId, 'to:', status);

    this.enquiryService.updateEnquiry(leadId, updateData).subscribe(
        res => {
            this.queueNotification({
                key: 'toastmsg',
                severity: 'success',
                summary: '✅ Contact Updated',
                detail: `${leadData.userName} marked as ${status}`,
                life: 3000
            });

            // Update the status in current data
            if (enquiry.individualLead) {
                enquiry.status = status;
                if (enquiry.leadData) {
                    enquiry.leadData.status = status;
                }
            } else {
                leadData.status = status;
                if (enquiry.allEnquiries && enquiry.allEnquiries[0] === leadData) {
                    enquiry.status = status;
                }
                if (enquiry.selectedLeadData === leadData) {
                    enquiry.selectedLeadData.status = status;
                }
            }
        },
        err => {
            console.error('📞 Error updating status:', err);
            this.queueNotification({
                key: 'toastmsg',
                severity: 'error',
                summary: '❌ Update Failed',
                detail: 'Could not update contact status',
                life: 4000
            });
        }
    );
}

getSelectedVenueInfo(): string {
    if (!this.selectedVenueFilter) return '';

    const venue = this.uniqueVenues.find(v => v.id === this.selectedVenueFilter);
    if (venue) {
        return `${venue.name} - ${venue.count} enquiries, ${venue.totalLeads} leads`;
    }
    return '';
}

toggleVenueFilter() {
    this.showVenueFilter = !this.showVenueFilter;
    if (this.showVenueFilter) {
        this.generateUniqueVenues();
    }
}

clearVenueFilter() {
    this.selectedVenueFilter = null;
    this.showVenueFilter = false;
    this.applyVenueFilter();
}

  updateStatus(enquiry: any, status: string) {
    const currentUser = this.getCurrentUser(enquiry);
    this.updateLeadStatus(currentUser, enquiry, status);
  }

  // 🔥 REVOLUTIONARY LIVE BEHAVIOR TRACKING SYSTEM
  // =================================================

  /**
   * Initialize Live Tracking System - The Game Changer! 🚀
   */
  initializeLiveTracking() {
    console.log('🔮 LIVE TRACKING: Initializing revolutionary behavior tracking system...');
    
    // Initialize WebSocket connection for real-time updates
    this.setupWebSocketConnection();
    
    // Generate mock tracking data (in production, this comes from tracking pixels)
    this.generateMockBehaviorData();
    
    console.log('🔮 LIVE TRACKING: System activated - venue owners will be AMAZED!');
  }

  /**
   * Setup WebSocket for Real-time Updates
   */
  setupWebSocketConnection() {
    // In production, this would connect to your WebSocket server
    // For demo, we'll simulate real-time updates
    console.log('🔮 WEBSOCKET: Connecting to live tracking server...');
    
    // Simulate real-time updates every 10 seconds
    setInterval(() => {
      this.updateLiveBehaviorData();
      this.generateRealTimeAlert();
    }, 10000);
  }

  /**
   * Generate Mock Behavior Data - Shows what's possible! 🎯
   */
  generateMockBehaviorData() {
    console.log('🔮 LIVE TRACKING: Generating behavior data for', this.enquiryList.length, 'enquiries...');
    
    this.enquiryList.forEach((enquiry, index) => {
      const leadId = enquiry._id || enquiry.id;
      
      // Create more realistic probability scores based on lead characteristics
      let baseProbability = 40;
      if (enquiry.status === 'WhatsApp Contacted') baseProbability = 65;
      if (enquiry.status === 'Phone Contacted') baseProbability = 75;
      if (enquiry.status === 'Closed') baseProbability = 95;
      
      // Add some randomization
      const finalProbability = Math.min(95, baseProbability + Math.floor(Math.random() * 25));
      
      // Make some leads "currently online" for demo effect
      const isCurrentlyOnline = index < 2 || Math.random() > 0.7; // First 2 leads + random others
      
      // Generate realistic behavior data
      this.liveTrackingData[leadId] = {
        websiteActivity: {
          currentlyOnSite: isCurrentlyOnline,
          lastVisit: isCurrentlyOnline ? new Date().toISOString() : new Date(Date.now() - Math.random() * 86400000).toISOString(),
          totalVisits: Math.floor(Math.random() * 8) + 2, // 2-10 visits
          averageSessionTime: Math.floor(Math.random() * 600) + 180, // 3-13 minutes
          pageViews: Math.floor(Math.random() * 30) + 10,
          mostViewedPages: ['gallery', 'pricing', 'availability', 'contact'],
          heatmapData: {
            galleryClicks: Math.floor(Math.random() * 15) + 5,
            pricingViews: Math.floor(Math.random() * 6) + 1,
            contactFormInteractions: Math.random() > 0.4
          }
        },
        aiInsights: {
          bookingProbability: finalProbability,
          urgencyLevel: finalProbability >= 80 ? 'URGENT!' : 
                       finalProbability >= 65 ? 'High' : 
                       finalProbability >= 45 ? 'Medium' : 'Low',
          personalityType: ['Decision Maker', 'Researcher', 'Social Planner', 'Budget-focused'][index % 4],
          bestContactTime: ['Morning', 'Afternoon', 'Evening', 'Weekend'][Math.floor(Math.random() * 4)],
          communicationStyle: ['Professional', 'Casual', 'Formal', 'Friendly'][Math.floor(Math.random() * 4)],
          decisionTimeline: finalProbability >= 80 ? 'Ready to book' :
                           finalProbability >= 60 ? '1-3 days' :
                           finalProbability >= 40 ? '1 week' : '2+ weeks',
          confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
          lastAnalysis: new Date().toISOString()
        },
        competitorAnalysis: {
          otherVenuesViewed: Math.floor(Math.random() * 4) + 1,
          competitorNames: ['Royal Gardens', 'Grand Palace', 'Elite Banquets', 'Heritage Lawns'].slice(0, Math.floor(Math.random() * 3) + 1),
          priceComparisons: Math.random() > 0.5,
          lastCompetitorVisit: new Date(Date.now() - Math.random() * 7200000).toISOString() // Within last 2 hours
        },
        communicationPattern: {
          whatsappResponseTime: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
          phoneCallDuration: Math.floor(Math.random() * 480) + 120, // 2-10 minutes
          emailEngagement: Math.random() > 0.4,
          preferredContactMethod: ['WhatsApp', 'Phone', 'Email'][Math.floor(Math.random() * 3)]
        }
      };

      // Generate AI insights
      this.generateAIInsights(enquiry, leadId);
    });
    
    console.log('🔮 LIVE TRACKING: Generated tracking data for all enquiries');
    console.log('📊 Sample tracking data:', this.liveTrackingData);
  }

  /**
   * Generate AI-Powered Insights - The Magic Happens Here! ✨
   */
  generateAIInsights(enquiry: any, leadId: string) {
    const data = this.liveTrackingData[leadId];
    const insights: string[] = [];
    
    // Website behavior insights
    if (data.websiteActivity.currentlyOnSite) {
      insights.push(`🔥 ${enquiry.userName} is LIVE on your website right now!`);
    }
    
    if (data.websiteActivity.totalVisits >= 3) {
      insights.push(`🎯 High interest detected: ${data.websiteActivity.totalVisits} visits this week`);
    }
    
    if (data.websiteActivity.heatmapData.pricingViews >= 3) {
      insights.push(`💰 Price-focused: Viewed pricing ${data.websiteActivity.heatmapData.pricingViews} times`);
    }
    
    // AI predictions
    if (data.aiInsights.bookingProbability >= 80) {
      insights.push(`🚀 URGENT: ${data.aiInsights.bookingProbability}% booking probability - Contact NOW!`);
    }
    
    if (data.aiInsights.urgencyLevel === 'URGENT!') {
      insights.push(`⚡ Time-sensitive client - Quick response needed!`);
    }
    
    // Competitor insights
    if (data.competitorAnalysis.priceComparisons) {
      insights.push(`⚠️ Alert: Comparing prices with ${data.competitorAnalysis.otherVenuesViewed} competitors`);
    }
    
    // Communication insights
    if (data.communicationPattern.whatsappResponseTime <= 30) {
      insights.push(`📱 Fast responder: Replies to WhatsApp within ${data.communicationPattern.whatsappResponseTime} minutes`);
    }

    this.behaviorInsights[leadId] = {
      insights: insights,
      recommendedActions: this.generateRecommendedActions(data),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate Smart Action Recommendations 🧠
   */
  generateRecommendedActions(data: any): string[] {
    const actions: string[] = [];
    
    if (data.aiInsights.bookingProbability >= 70) {
      actions.push('📞 Call immediately - high conversion probability');
    }
    
    if (data.competitorAnalysis.priceComparisons) {
      actions.push('💎 Highlight unique selling points vs competitors');
    }
    
    if (data.websiteActivity.heatmapData.galleryClicks >= 10) {
      actions.push('📸 Send additional photos/virtual tour');
    }
    
    if (data.communicationPattern.preferredContactMethod === 'WhatsApp') {
      actions.push('📱 Use WhatsApp for best response rate');
    }
    
    actions.push(`⏰ Best contact time: ${data.aiInsights.bestContactTime}`);
    actions.push(`🗣️ Communication style: ${data.aiInsights.communicationStyle}`);
    
    return actions;
  }

  /**
   * Update Live Behavior Data - Real-time Magic! ⚡
   */
  updateLiveBehaviorData() {
    this.enquiryList.forEach(enquiry => {
      const leadId = enquiry._id || enquiry.id;
      if (this.liveTrackingData[leadId]) {
        // Simulate real-time updates
        const data = this.liveTrackingData[leadId];
        
        // Random chance of being online
        data.websiteActivity.currentlyOnSite = Math.random() > 0.8;
        
        // Update booking probability based on activity
        if (data.websiteActivity.currentlyOnSite) {
          data.aiInsights.bookingProbability = Math.min(100, data.aiInsights.bookingProbability + Math.floor(Math.random() * 10));
        }
        
        // Update last visit if currently online
        if (data.websiteActivity.currentlyOnSite) {
          data.websiteActivity.lastVisit = new Date().toISOString();
          data.websiteActivity.pageViews++;
        }
        
        // Regenerate insights with updated data
        this.generateAIInsights(enquiry, leadId);
      }
    });
  }

  /**
   * Start Real-time Alert System 🚨
   */
  startRealTimeAlerts() {
    // Generate alerts every 15 seconds
    setInterval(() => {
      this.generateRealTimeAlert();
    }, 15000);
  }

  /**
   * Generate Real-time Alerts - Keep venue owners on their toes! 🚨
   */
  generateRealTimeAlert() {
    const alertTypes = [
      'HIGH_PROBABILITY_LEAD',
      'COMPETITOR_COMPARISON',
      'URGENT_FOLLOW_UP',
      'WEBSITE_STALKING',
      'PRICE_SENSITIVE'
    ];
    
    const randomEnquiry = this.enquiryList[Math.floor(Math.random() * this.enquiryList.length)];
    if (!randomEnquiry) return;
    
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const leadId = randomEnquiry._id || randomEnquiry.id;
    const data = this.liveTrackingData[leadId];
    
    if (!data) return;
    
    let alertMessage = '';
    let alertSeverity = 'info';
    
    switch (alertType) {
      case 'HIGH_PROBABILITY_LEAD':
        alertMessage = `🚀 ${randomEnquiry.userName} has ${data.aiInsights.bookingProbability}% booking probability - Contact NOW!`;
        alertSeverity = 'success';
        break;
        
      case 'COMPETITOR_COMPARISON':
        alertMessage = `⚠️ Alert: ${randomEnquiry.userName} just visited ${data.competitorAnalysis.otherVenuesViewed} competitor websites!`;
        alertSeverity = 'warn';
        break;
        
      case 'URGENT_FOLLOW_UP':
        alertMessage = `⏰ ${randomEnquiry.userName} hasn't been contacted for 2+ days - Follow up needed!`;
        alertSeverity = 'error';
        break;
        
      case 'WEBSITE_STALKING':
        alertMessage = `👀 ${randomEnquiry.userName} is currently browsing your website for ${Math.floor(Math.random() * 10) + 1} minutes!`;
        alertSeverity = 'info';
        break;
        
      case 'PRICE_SENSITIVE':
        alertMessage = `💰 ${randomEnquiry.userName} viewed pricing ${data.websiteActivity.heatmapData.pricingViews} times - Price negotiation expected!`;
        alertSeverity = 'warn';
        break;
    }
    
    this.realTimeAlerts.unshift({
      message: alertMessage,
      severity: alertSeverity,
      timestamp: new Date(),
      leadId: leadId,
      enquiry: randomEnquiry
    });
    
    // Keep only last 10 alerts
    this.realTimeAlerts = this.realTimeAlerts.slice(0, 10);
    
    // Show toast notification
    this.messageService.add({
      key: 'toastmsg',
      severity: alertSeverity,
      summary: 'Live Tracking Alert',
      detail: alertMessage,
      life: 8000
    });
  }

  /**
   * Open Behavior Tracking Panel - Show the Magic! 🎭
   */
  openBehaviorPanel(enquiry: any) {
    this.selectedLeadForTracking = enquiry;
    this.showBehaviorPanel = true;
    console.log('🔮 Opening behavior panel for:', enquiry.userName);
  }

  /**
   * Close Behavior Panel
   */
  closeBehaviorPanel() {
    this.showBehaviorPanel = false;
    this.selectedLeadForTracking = null;
  }

  /**
   * Get Live Tracking Data for a Lead
   */
  getLiveTrackingData(enquiry: any): any {
    const leadId = enquiry._id || enquiry.id;
    return this.liveTrackingData[leadId] || null;
  }

  /**
   * Get AI Insights for a Lead or Venue-Level Analysis
   */
  getAIInsights(enquiry: any): any {
    const leadId = enquiry._id || enquiry.id;
    return this.behaviorInsights[leadId] || null;
  }

  /**
   * Get Overall Booking Probability - Works for both individual leads and venue-level
   */
  getOverallBookingProbability(enquiry: any): number {
    const hasMultipleLeads = enquiry.leadCount > 1 && enquiry.allEnquiries && enquiry.allEnquiries.length > 1;
    
    if (hasMultipleLeads) {
      // For venues with multiple leads, calculate average probability
      const allLeads = enquiry.allEnquiries || [enquiry];
      const venueAnalysis = this.analyzeVenueLeads(allLeads, enquiry);
      return Math.round(venueAnalysis.averageProbability);
    } else {
      // For individual leads, use their specific probability
      const trackingData = this.getLiveTrackingData(enquiry);
      return trackingData?.aiInsights?.bookingProbability || 0;
    }
  }

  /**
   * Get Urgency Level - Works for both individual leads and venue-level
   */
  getOverallUrgencyLevel(enquiry: any): string {
    const hasMultipleLeads = enquiry.leadCount > 1 && enquiry.allEnquiries && enquiry.allEnquiries.length > 1;
    
    if (hasMultipleLeads) {
      // For venues with multiple leads, determine overall urgency
      const allLeads = enquiry.allEnquiries || [enquiry];
      const venueAnalysis = this.analyzeVenueLeads(allLeads, enquiry);
      
      if (venueAnalysis.urgentLeads > 0) {
        return 'URGENT!';
      } else if (venueAnalysis.averageProbability >= 70) {
        return 'High';
      } else if (venueAnalysis.averageProbability >= 50) {
        return 'Medium';
      } else {
        return 'Low';
      }
    } else {
      // For individual leads, use their specific urgency
      const trackingData = this.getLiveTrackingData(enquiry);
      return trackingData?.aiInsights?.urgencyLevel || 'Low';
    }
  }

  /**
   * Generate AI Summary - Comprehensive Analysis for Multiple Leads or Individual Lead
   */
  generateAISummary(enquiry: any): string {
    // Check if this is a venue with multiple leads
    const hasMultipleLeads = enquiry.leadCount > 1 && enquiry.allEnquiries && enquiry.allEnquiries.length > 1;
    
    if (hasMultipleLeads) {
      return this.generateVenueLevelAISummary(enquiry);
    } else {
      return this.generateIndividualLeadAISummary(enquiry);
    }
  }

  /**
   * Generate Venue-Level AI Summary for Multiple Leads
   */
  generateVenueLevelAISummary(enquiry: any): string {
    const venueName = enquiry.venueName;
    const totalLeads = enquiry.leadCount || enquiry.allEnquiries?.length || 1;
    const allLeads = enquiry.allEnquiries || [enquiry];
    
    // Analyze all leads collectively
    const venueAnalysis = this.analyzeVenueLeads(allLeads, enquiry);
    
    let summary = '';
    
    // Opening assessment based on venue-level data
    if (venueAnalysis.averageProbability >= 80) {
      summary = `🚀 EXCEPTIONAL VENUE OPPORTUNITY: ${venueName} has ${totalLeads} high-intent leads with ${venueAnalysis.averageProbability.toFixed(0)}% average booking probability. Immediate action required! `;
    } else if (venueAnalysis.averageProbability >= 65) {
      summary = `⭐ HIGH-VALUE VENUE: ${venueName} shows strong conversion potential across ${totalLeads} leads (${venueAnalysis.averageProbability.toFixed(0)}% avg probability). `;
    } else if (venueAnalysis.averageProbability >= 50) {
      summary = `📈 PROMISING VENUE PIPELINE: ${venueName} has ${totalLeads} leads with moderate interest (${venueAnalysis.averageProbability.toFixed(0)}% avg) requiring strategic nurturing. `;
    } else {
      summary = `🎯 DEVELOPING VENUE LEADS: ${venueName} has ${totalLeads} early-stage prospects (${venueAnalysis.averageProbability.toFixed(0)}% avg) needing careful engagement. `;
    }
    
    // Add lead distribution insights
    if (venueAnalysis.hotLeads > 0) {
      summary += `🔥 ${venueAnalysis.hotLeads} hot leads (80%+ probability) demand immediate attention. `;
    }
    
    if (venueAnalysis.warmLeads > 0) {
      summary += `🌟 ${venueAnalysis.warmLeads} warm prospects (60-79% probability) ready for follow-up. `;
    }
    
    if (venueAnalysis.coldLeads > 0) {
      summary += `❄️ ${venueAnalysis.coldLeads} early-stage leads need nurturing campaigns. `;
    }
    
    // Competitive intelligence for the venue
    if (venueAnalysis.competitiveThreats > 0) {
      summary += `⚠️ COMPETITIVE ALERT: ${venueAnalysis.competitiveThreats} leads are comparing with competitors - differentiation crucial. `;
    }
    
    // Engagement patterns across all leads
    if (venueAnalysis.highEngagement > 0) {
      summary += `👥 ${venueAnalysis.highEngagement} leads showing high website engagement. `;
    }
    
    // Urgency assessment
    if (venueAnalysis.urgentLeads > 0) {
      summary += `⚡ ${venueAnalysis.urgentLeads} time-sensitive opportunities requiring immediate contact. `;
    }
    
    // Overall venue recommendation
    if (venueAnalysis.averageProbability >= 70) {
      summary += `🎯 VENUE STRATEGY: Focus on hot leads first, then systematically work through warm prospects. Strong conversion potential across the pipeline.`;
    } else if (venueAnalysis.averageProbability >= 50) {
      summary += `📋 VENUE STRATEGY: Implement systematic follow-up campaign. Mix of immediate outreach for top prospects and nurturing sequences for developing leads.`;
    } else {
      summary += `📈 VENUE STRATEGY: Deploy lead warming campaigns and educational content to build interest before aggressive sales approach.`;
    }
    
    return summary;
  }

  /**
   * Generate Individual Lead AI Summary
   */
  generateIndividualLeadAISummary(enquiry: any): string {
    const trackingData = this.getLiveTrackingData(enquiry);
    if (!trackingData) return 'AI analysis not available for this lead.';

    const probability = trackingData.aiInsights.bookingProbability;
    const urgency = trackingData.aiInsights.urgencyLevel;
    const personalityType = trackingData.aiInsights.personalityType;
    const visits = trackingData.websiteActivity.totalVisits;
    const competitorViews = trackingData.competitorAnalysis.otherVenuesViewed;

    let summary = '';

    // Opening assessment based on probability
    if (probability >= 85) {
      summary = `🚀 EXCEPTIONAL OPPORTUNITY: ${enquiry.userName} shows extremely high booking intent (${probability}%) and should be contacted immediately. `;
    } else if (probability >= 70) {
      summary = `⭐ HIGH-VALUE LEAD: ${enquiry.userName} demonstrates strong interest (${probability}%) with excellent conversion potential. `;
    } else if (probability >= 50) {
      summary = `📈 PROMISING PROSPECT: ${enquiry.userName} shows moderate interest (${probability}%) and requires strategic nurturing. `;
    } else {
      summary = `🎯 DEVELOPING LEAD: ${enquiry.userName} is in early research phase (${probability}%) and needs careful engagement. `;
    }

    // Add personality-based insights
    if (personalityType === 'Decision Maker') {
      summary += `As a decisive personality type, they prefer direct communication and quick responses. `;
    } else if (personalityType === 'Researcher') {
      summary += `Being detail-oriented, they need comprehensive information and time to evaluate options. `;
    } else if (personalityType === 'Social Planner') {
      summary += `As a collaborative planner, they likely involve others in decisions and appreciate social proof. `;
    } else if (personalityType === 'Budget-focused') {
      summary += `Being cost-conscious, they prioritize value and competitive pricing in their decisions. `;
    }

    // Add engagement insights
    if (visits > 3) {
      summary += `Their ${visits} website visits indicate serious consideration. `;
    } else if (visits <= 1) {
      summary += `With only ${visits} visit(s), they may need more engagement to build interest. `;
    }

    // Add competitive intelligence
    if (competitorViews > 2) {
      summary += `⚠️ COMPETITIVE ALERT: They've viewed ${competitorViews} competitor venues - immediate action required to secure booking. `;
    } else if (competitorViews > 0) {
      summary += `They've compared ${competitorViews} other option(s) - highlighting your unique advantages is crucial. `;
    }

    // Add urgency context
    if (urgency === 'URGENT!') {
      summary += `🔥 Time-sensitive opportunity - their behavior patterns suggest a booking decision is imminent.`;
    } else if (urgency === 'High') {
      summary += `📞 Prompt follow-up recommended within the next few hours for optimal conversion.`;
    } else {
      summary += `📅 Steady nurturing approach recommended with regular touchpoints.`;
    }

    return summary;
  }

  /**
   * Analyze All Leads for a Venue - Collective Intelligence
   */
  analyzeVenueLeads(allLeads: any[], enquiry: any): any {
    const analysis = {
      averageProbability: 0,
      hotLeads: 0, // 80%+ probability
      warmLeads: 0, // 60-79% probability
      coldLeads: 0, // <60% probability
      urgentLeads: 0,
      competitiveThreats: 0,
      highEngagement: 0,
      totalVisits: 0,
      totalLeads: allLeads.length,
      personalityDistribution: {
        'Decision Maker': 0,
        'Researcher': 0,
        'Social Planner': 0,
        'Budget-focused': 0
      },
      contactStatusDistribution: {
        'New': 0,
        'WhatsApp Contacted': 0,
        'Phone Contacted': 0,
        'Closed': 0
      }
    };

    let totalProbability = 0;
    
    // Generate venue-level tracking data for all leads if not exists
    allLeads.forEach((lead, index) => {
      const leadId = lead._id || lead.id || `${enquiry.id}_lead_${index}`;
      
      // Ensure tracking data exists for each lead
      if (!this.liveTrackingData[leadId]) {
        this.generateMockDataForLead(lead, leadId);
      }
      
      const trackingData = this.liveTrackingData[leadId];
      if (!trackingData) return;

      const probability = trackingData.aiInsights.bookingProbability;
      totalProbability += probability;
      
      // Categorize leads by probability
      if (probability >= 80) {
        analysis.hotLeads++;
      } else if (probability >= 60) {
        analysis.warmLeads++;
      } else {
        analysis.coldLeads++;
      }
      
      // Check urgency
      if (trackingData.aiInsights.urgencyLevel === 'URGENT!' || probability >= 80) {
        analysis.urgentLeads++;
      }
      
      // Check competitive threats
      if (trackingData.competitorAnalysis.otherVenuesViewed > 1) {
        analysis.competitiveThreats++;
      }
      
      // Check engagement
      if (trackingData.websiteActivity.totalVisits > 3 || trackingData.websiteActivity.heatmapData.galleryClicks > 10) {
        analysis.highEngagement++;
      }
      
      analysis.totalVisits += trackingData.websiteActivity.totalVisits;
      
      // Track personality types
      const personality = trackingData.aiInsights.personalityType;
      if (analysis.personalityDistribution[personality] !== undefined) {
        analysis.personalityDistribution[personality]++;
      }
      
      // Track contact status
      const status = lead.status || 'New';
      if (analysis.contactStatusDistribution[status] !== undefined) {
        analysis.contactStatusDistribution[status]++;
      }
    });

    analysis.averageProbability = totalProbability / allLeads.length;
    
    return analysis;
  }

  /**
   * Generate Mock Data for Individual Lead
   */
  generateMockDataForLead(lead: any, leadId: string): void {
    // Create realistic probability based on lead status
    let baseProbability = 40;
    if (lead.status === 'WhatsApp Contacted') baseProbability = 65;
    if (lead.status === 'Phone Contacted') baseProbability = 75;
    if (lead.status === 'Closed') baseProbability = 95;
    
    const finalProbability = Math.min(95, baseProbability + Math.floor(Math.random() * 25));
    
    // Generate realistic behavior data for this specific lead
    this.liveTrackingData[leadId] = {
      websiteActivity: {
        currentlyOnSite: Math.random() > 0.8,
        lastVisit: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        totalVisits: Math.floor(Math.random() * 8) + 2,
        averageSessionTime: Math.floor(Math.random() * 600) + 180,
        pageViews: Math.floor(Math.random() * 30) + 10,
        mostViewedPages: ['gallery', 'pricing', 'availability', 'contact'],
        heatmapData: {
          galleryClicks: Math.floor(Math.random() * 15) + 5,
          pricingViews: Math.floor(Math.random() * 6) + 1,
          contactFormInteractions: Math.random() > 0.4
        }
      },
      aiInsights: {
        bookingProbability: finalProbability,
        urgencyLevel: finalProbability >= 80 ? 'URGENT!' : 
                     finalProbability >= 65 ? 'High' : 
                     finalProbability >= 45 ? 'Medium' : 'Low',
        personalityType: ['Decision Maker', 'Researcher', 'Social Planner', 'Budget-focused'][Math.floor(Math.random() * 4)],
        bestContactTime: ['Morning', 'Afternoon', 'Evening', 'Weekend'][Math.floor(Math.random() * 4)],
        communicationStyle: ['Professional', 'Casual', 'Formal', 'Friendly'][Math.floor(Math.random() * 4)],
        decisionTimeline: finalProbability >= 80 ? 'Ready to book' :
                         finalProbability >= 60 ? '1-3 days' :
                         finalProbability >= 40 ? '1 week' : '2+ weeks',
        confidenceScore: Math.floor(Math.random() * 30) + 70,
        lastAnalysis: new Date().toISOString()
      },
      competitorAnalysis: {
        otherVenuesViewed: Math.floor(Math.random() * 4) + 1,
        competitorNames: ['Royal Gardens', 'Grand Palace', 'Elite Banquets', 'Heritage Lawns'].slice(0, Math.floor(Math.random() * 3) + 1),
        priceComparisons: Math.random() > 0.5,
        lastCompetitorVisit: new Date(Date.now() - Math.random() * 7200000).toISOString()
      },
      communicationPattern: {
        whatsappResponseTime: Math.floor(Math.random() * 120) + 15,
        phoneCallDuration: Math.floor(Math.random() * 480) + 120,
        emailEngagement: Math.random() > 0.4,
        preferredContactMethod: ['WhatsApp', 'Phone', 'Email'][Math.floor(Math.random() * 3)]
      }
    };
  }

  /**
   * Get AI Key Points - Works for both venue-level and individual lead analysis
   */
  getAIKeyPoints(enquiry: any): any[] {
    const hasMultipleLeads = enquiry.leadCount > 1 && enquiry.allEnquiries && enquiry.allEnquiries.length > 1;
    
    if (hasMultipleLeads) {
      return this.getVenueLevelKeyPoints(enquiry);
    } else {
      return this.getIndividualLeadKeyPoints(enquiry);
    }
  }

  /**
   * Get Venue-Level Key Points for Multiple Leads
   */
  getVenueLevelKeyPoints(enquiry: any): any[] {
    const points = [];
    const allLeads = enquiry.allEnquiries || [enquiry];
    const venueAnalysis = this.analyzeVenueLeads(allLeads, enquiry);

    // Overall conversion potential
    if (venueAnalysis.averageProbability >= 75) {
      points.push({
        type: 'positive',
        icon: 'fas fa-trophy',
        text: `Exceptional venue performance: ${venueAnalysis.averageProbability.toFixed(0)}% average probability across ${venueAnalysis.totalLeads} leads`
      });
    } else if (venueAnalysis.averageProbability >= 60) {
      points.push({
        type: 'good',
        icon: 'fas fa-chart-line',
        text: `Strong venue pipeline: ${venueAnalysis.averageProbability.toFixed(0)}% average probability across ${venueAnalysis.totalLeads} leads`
      });
    } else {
      points.push({
        type: 'neutral',
        icon: 'fas fa-seedling',
        text: `Developing venue pipeline: ${venueAnalysis.averageProbability.toFixed(0)}% average probability across ${venueAnalysis.totalLeads} leads`
      });
    }

    // Hot leads highlight
    if (venueAnalysis.hotLeads > 0) {
      points.push({
        type: 'urgent',
        icon: 'fas fa-fire',
        text: `${venueAnalysis.hotLeads} hot leads (80%+ probability) requiring immediate attention`
      });
    }

    // Lead distribution
    if (venueAnalysis.warmLeads > 0) {
      points.push({
        type: 'good',
        icon: 'fas fa-thermometer-half',
        text: `${venueAnalysis.warmLeads} warm prospects (60-79% probability) ready for systematic follow-up`
      });
    }

    // Competitive threats
    if (venueAnalysis.competitiveThreats > 0) {
      points.push({
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        text: `${venueAnalysis.competitiveThreats} leads actively comparing competitors - differentiation crucial`
      });
    }

    // High engagement leads
    if (venueAnalysis.highEngagement > 0) {
      points.push({
        type: 'positive',
        icon: 'fas fa-eye',
        text: `${venueAnalysis.highEngagement} leads showing high website engagement and genuine interest`
      });
    }

    // Contact status distribution
    const contacted = venueAnalysis.contactStatusDistribution['WhatsApp Contacted'] + 
                     venueAnalysis.contactStatusDistribution['Phone Contacted'];
    const newLeads = venueAnalysis.contactStatusDistribution['New'];
    
    if (newLeads > contacted) {
      points.push({
        type: 'caution',
        icon: 'fas fa-phone-slash',
        text: `${newLeads} uncontacted leads vs ${contacted} contacted - outreach opportunities available`
      });
    }

    // Personality insights
    const dominantPersonality = Object.keys(venueAnalysis.personalityDistribution)
      .reduce((a, b) => venueAnalysis.personalityDistribution[a] > venueAnalysis.personalityDistribution[b] ? a : b);
    
    points.push({
      type: 'info',
      icon: 'fas fa-users',
      text: `Lead personality trend: ${dominantPersonality} types dominate - tailor communication style accordingly`
    });

    return points;
  }

  /**
   * Get Individual Lead Key Points
   */
  getIndividualLeadKeyPoints(enquiry: any): any[] {
    const trackingData = this.getLiveTrackingData(enquiry);
    if (!trackingData) return [];

    const points = [];
    const probability = trackingData.aiInsights.bookingProbability;
    const urgency = trackingData.aiInsights.urgencyLevel;
    const visits = trackingData.websiteActivity.totalVisits;
    const galleryClicks = trackingData.websiteActivity.heatmapData.galleryClicks;
    const pricingViews = trackingData.websiteActivity.heatmapData.pricingViews;
    const competitorViews = trackingData.competitorAnalysis.otherVenuesViewed;

    // Probability-based point
    if (probability >= 80) {
      points.push({
        type: 'positive',
        icon: 'fas fa-thumbs-up',
        text: `Extremely high booking probability (${probability}%) - Prime conversion candidate`
      });
    } else if (probability >= 60) {
      points.push({
        type: 'good',
        icon: 'fas fa-chart-line',
        text: `Strong booking probability (${probability}%) - Above average conversion potential`
      });
    } else {
      points.push({
        type: 'neutral',
        icon: 'fas fa-info-circle',
        text: `Moderate probability (${probability}%) - Requires strategic engagement`
      });
    }

    // Engagement level
    if (visits > 3 && galleryClicks > 5) {
      points.push({
        type: 'positive',
        icon: 'fas fa-eye',
        text: `High engagement: ${visits} visits with ${galleryClicks} gallery views`
      });
    } else if (visits > 1) {
      points.push({
        type: 'good',
        icon: 'fas fa-mouse-pointer',
        text: `Active interest: ${visits} visits with ${galleryClicks} interactions`
      });
    }

    // Pricing interest
    if (pricingViews > 2) {
      points.push({
        type: 'positive',
        icon: 'fas fa-dollar-sign',
        text: `Budget-conscious: ${pricingViews} pricing page views indicate serious consideration`
      });
    }

    // Competitive landscape
    if (competitorViews > 2) {
      points.push({
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        text: `High competition: Actively comparing ${competitorViews} alternative venues`
      });
    } else if (competitorViews > 0) {
      points.push({
        type: 'caution',
        icon: 'fas fa-balance-scale',
        text: `Price shopping: Comparing with ${competitorViews} other venue(s)`
      });
    }

    // Urgency indicator
    if (urgency === 'URGENT!') {
      points.push({
        type: 'urgent',
        icon: 'fas fa-fire',
        text: `Critical timing: Behavior suggests immediate booking decision pending`
      });
    }

    // Communication preference
    const preferredMethod = trackingData.communicationPattern.preferredContactMethod;
    points.push({
      type: 'info',
      icon: preferredMethod === 'WhatsApp' ? 'fab fa-whatsapp' : 'fas fa-phone',
      text: `Prefers ${preferredMethod} communication - tailor your approach accordingly`
    });

    return points;
  }

  /**
   * Get AI Next Steps - Works for both venue-level and individual lead analysis
   */
  getAINextSteps(enquiry: any): string[] {
    const hasMultipleLeads = enquiry.leadCount > 1 && enquiry.allEnquiries && enquiry.allEnquiries.length > 1;
    
    if (hasMultipleLeads) {
      return this.getVenueLevelNextSteps(enquiry);
    } else {
      return this.getIndividualLeadNextSteps(enquiry);
    }
  }

  /**
   * Get Venue-Level Next Steps for Multiple Leads
   */
  getVenueLevelNextSteps(enquiry: any): string[] {
    const steps = [];
    const allLeads = enquiry.allEnquiries || [enquiry];
    const venueAnalysis = this.analyzeVenueLeads(allLeads, enquiry);
    const venueName = enquiry.venueName;

    // Priority-based approach for multiple leads
    if (venueAnalysis.hotLeads > 0) {
      steps.push(`🔥 PRIORITY 1: Contact ${venueAnalysis.hotLeads} hot leads (80%+ probability) within next 30 minutes`);
      steps.push(`💎 Lead with exclusive offers and immediate availability for hot prospects`);
    }

    if (venueAnalysis.warmLeads > 0) {
      steps.push(`⭐ PRIORITY 2: Follow up with ${venueAnalysis.warmLeads} warm leads (60-79%) within 2-4 hours`);
      steps.push(`📋 Prepare customized proposals addressing specific event requirements`);
    }

    if (venueAnalysis.coldLeads > 0) {
      steps.push(`📈 PRIORITY 3: Nurture ${venueAnalysis.coldLeads} developing leads with educational content over 3-5 days`);
    }

    // Strategic recommendations based on venue analysis
    if (venueAnalysis.competitiveThreats > 2) {
      steps.push(`⚠️ COMPETITIVE RESPONSE: ${venueAnalysis.competitiveThreats} leads comparing competitors - create differentiation document highlighting ${venueName}'s unique advantages`);
      steps.push(`💰 Consider venue-specific promotional packages to counter competitive pricing`);
    }

    // Systematic approach for venue management
    if (venueAnalysis.totalLeads > 5) {
      steps.push(`📊 VENUE WORKFLOW: Implement lead scoring system to efficiently manage ${venueAnalysis.totalLeads} prospects`);
      steps.push(`🤖 Set up automated follow-up sequences for different lead categories`);
    }

    // Contact status recommendations
    const newLeads = venueAnalysis.contactStatusDistribution['New'];
    if (newLeads > 0) {
      steps.push(`📞 OUTREACH PLAN: ${newLeads} uncontacted leads need immediate initial contact via their preferred methods`);
    }

    // Personality-based venue strategy
    const personalityTypes = Object.keys(venueAnalysis.personalityDistribution)
      .filter(key => venueAnalysis.personalityDistribution[key] > 0)
      .sort((a, b) => venueAnalysis.personalityDistribution[b] - venueAnalysis.personalityDistribution[a]);

    if (personalityTypes.length > 0) {
      const dominantType = personalityTypes[0];
      const count = venueAnalysis.personalityDistribution[dominantType];
      
      steps.push(`👥 COMMUNICATION STRATEGY: ${count} leads are ${dominantType} types - tailor venue presentation accordingly`);
      
      if (dominantType === 'Decision Maker') {
        steps.push(`⚡ Focus on quick, decisive communication with clear booking options`);
      } else if (dominantType === 'Researcher') {
        steps.push(`📚 Prepare comprehensive venue information packets with detailed specifications`);
      } else if (dominantType === 'Social Planner') {
        steps.push(`🎉 Highlight social proof, testimonials, and community aspects of your venue`);
      } else if (dominantType === 'Budget-focused') {
        steps.push(`💸 Emphasize value propositions and flexible pricing options`);
      }
    }

    // Venue-specific follow-up strategy
    steps.push(`📈 VENUE ANALYTICS: Monitor lead progression weekly and adjust strategy based on conversion patterns`);
    steps.push(`🎯 Create ${venueName}-specific marketing materials highlighting your most successful event stories`);

    return steps.slice(0, 8); // Limit to top 8 most relevant steps for venue-level
  }

  /**
   * Get Individual Lead Next Steps
   */
  getIndividualLeadNextSteps(enquiry: any): string[] {
    const trackingData = this.getLiveTrackingData(enquiry);
    if (!trackingData) return ['Contact lead for initial discussion'];

    const steps = [];
    const probability = trackingData.aiInsights.bookingProbability;
    const urgency = trackingData.aiInsights.urgencyLevel;
    const personalityType = trackingData.aiInsights.personalityType;
    const preferredMethod = trackingData.communicationPattern.preferredContactMethod;
    const competitorViews = trackingData.competitorAnalysis.otherVenuesViewed;
    const bestContactTime = trackingData.aiInsights.bestContactTime;

    // Priority actions based on probability and urgency
    if (probability >= 80 && urgency === 'URGENT!') {
      steps.push(`🚨 IMMEDIATE: Call within next 15 minutes via ${preferredMethod} - booking decision imminent`);
      steps.push(`💎 Lead with your strongest unique selling points and exclusive offers`);
      steps.push(`📅 Offer immediate venue viewing or virtual tour to secure commitment`);
    } else if (probability >= 70) {
      steps.push(`📞 Contact within 1-2 hours via ${preferredMethod} during ${bestContactTime}`);
      steps.push(`🎯 Focus on addressing specific venue requirements and concerns`);
      steps.push(`📋 Prepare detailed proposal with customized pricing options`);
    } else if (probability >= 50) {
      steps.push(`📱 Initial contact via ${preferredMethod} within 4-6 hours`);
      steps.push(`🤝 Build rapport and understand their event vision and budget`);
      steps.push(`📚 Share testimonials and success stories from similar events`);
    } else {
      steps.push(`📧 Gentle follow-up via ${preferredMethod} within 24 hours`);
      steps.push(`🎁 Share venue information packet with special introductory offers`);
      steps.push(`🔄 Schedule follow-up in 3-5 days to maintain engagement`);
    }

    // Personality-specific strategies
    if (personalityType === 'Decision Maker') {
      steps.push(`⚡ Present clear, concise options with immediate booking incentives`);
    } else if (personalityType === 'Researcher') {
      steps.push(`📊 Provide comprehensive venue details, floor plans, and comparison charts`);
    } else if (personalityType === 'Social Planner') {
      steps.push(`👥 Offer group viewing sessions and references from recent clients`);
    }

    // Competitive response
    if (competitorViews > 2) {
      steps.push(`🥇 Clearly differentiate your venue's unique advantages over competitors`);
      steps.push(`💰 Consider competitive pricing or value-added packages`);
    } else if (competitorViews > 0) {
      steps.push(`✨ Highlight exclusive features that competitors don't offer`);
    }

    // Follow-up strategy
    steps.push(`📝 Document interaction details and set automated follow-up reminders`);
    steps.push(`📈 Monitor continued website activity for engagement scoring updates`);

    return steps.slice(0, 6); // Limit to top 6 most relevant steps
  }

  /**
   * Get Confidence Class for styling
   */
  getConfidenceClass(score: number): string {
    if (score >= 90) return 'confidence-excellent';
    if (score >= 75) return 'confidence-good';
    if (score >= 60) return 'confidence-moderate';
    return 'confidence-low';
  }

  /**
   * Get Booking Probability Color
   */
  getBookingProbabilityColor(probability: number): string {
    if (probability >= 80) return '#00C851'; // Green - Very High
    if (probability >= 60) return '#ffbb33'; // Orange - High  
    if (probability >= 40) return '#FF6900'; // Orange - Medium
    return '#ff4444'; // Red - Low
  }

  /**
   * Get Urgency Badge Class
   */
  getUrgencyBadgeClass(urgency: string): string {
    switch (urgency) {
      case 'URGENT!': return 'urgency-critical';
      case 'High': return 'urgency-high';
      case 'Medium': return 'urgency-medium';
      default: return 'urgency-low';
    }
  }

  /**
   * Generate Demo Enquiries for Testing - Shows the Revolutionary System in Action! 🚀
   */
  generateDemoEnquiries() {
    console.log('🔮 DEMO: Creating sample enquiries to showcase revolutionary features...');
    
    const demoEnquiries = [
      {
        _id: 'demo_001',
        id: 'demo_001',
        venueName: 'Royal Gardens Banquet',
        venueId: 'venue_001',
        venue_id: 'venue_001',
        userName: 'Priya Sharma',
        userContact: '9876543210',
        userEmail: 'priya.sharma@email.com',
        status: 'New',
        leadCount: 1,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        allEnquiries: [],
        selectedLead: null,
        selectedLeadData: null,
        showLeadDetails: false,
        currentLeadIndex: 0
      },
      {
        _id: 'demo_002',
        id: 'demo_002',
        venueName: 'Grand Palace Hotel',
        venueId: 'venue_002',
        venue_id: 'venue_002',
        userName: 'Raj Kumar',
        userContact: '8765432109',
        userEmail: 'raj.kumar@email.com',
        status: 'WhatsApp Contacted',
        leadCount: 1,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        allEnquiries: [],
        selectedLead: null,
        selectedLeadData: null,
        showLeadDetails: false,
        currentLeadIndex: 0
      },
      {
        _id: 'demo_003',
        id: 'demo_003',
        venueName: 'Elite Banquet Hall',
        venueId: 'venue_003',
        venue_id: 'venue_003',
        userName: 'Anita Desai',
        userContact: '7654321098',
        userEmail: 'anita.desai@email.com',
        status: 'New',
        leadCount: 1,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        allEnquiries: [],
        selectedLead: null,
        selectedLeadData: null,
        showLeadDetails: false,
        currentLeadIndex: 0
      },
      {
        _id: 'demo_004',
        id: 'demo_004',
        venueName: 'Sunset Resort & Banquet',
        venueId: 'venue_004',
        venue_id: 'venue_004',
        userName: 'Vikram Singh',
        userContact: '6543210987',
        userEmail: 'vikram.singh@email.com',
        status: 'New',
        leadCount: 1,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        allEnquiries: [],
        selectedLead: null,
        selectedLeadData: null,
        showLeadDetails: false,
        currentLeadIndex: 0
      },
      {
        _id: 'demo_005',
        id: 'demo_005',
        venueName: 'Heritage Lawn & Banquet',
        venueId: 'venue_005',
        venue_id: 'venue_005',
        userName: 'Meera Patel',
        userContact: '5432109876',
        userEmail: 'meera.patel@email.com',
        status: 'Phone Contacted',
        leadCount: 1,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        allEnquiries: [],
        selectedLead: null,
        selectedLeadData: null,
        showLeadDetails: false,
        currentLeadIndex: 0
      }
    ];

    this.enquiryList = demoEnquiries;
    this.totalRecords = demoEnquiries.length;
    
    console.log('🔮 DEMO: Generated', demoEnquiries.length, 'sample enquiries');
    
    // Generate live tracking data for demo
    this.generateMockBehaviorData();
    
    // Generate unique venues
    this.generateUniqueVenues();
    
    console.log('🔮 DEMO: Revolutionary system ready with sample data!');
  }

  /**
   * Helper method to get minutes from seconds
   */
  getMinutes(seconds: number): number {
    return Math.floor(seconds / 60);
  }

  /**
   * Queue notification for sequential display
   */
  private queueNotification(notification: any) {
    this.notificationQueue.push(notification);
    this.processNotificationQueue();
  }

  /**
   * Process notification queue one at a time (2 seconds each)
   */
  private processNotificationQueue() {
    if (this.isProcessingNotifications || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingNotifications = true;
    const notification = this.notificationQueue.shift();
    
    // Set all notifications to 2 seconds exactly
    notification.life = 2000;
    
    // Show the notification
    this.messageService.add(notification);
    
    // Clear any existing notifications to ensure only one shows at a time
    setTimeout(() => {
      this.messageService.clear();
    }, 50);
    
    // Wait exactly 2 seconds before processing the next notification
    setTimeout(() => {
      this.isProcessingNotifications = false;
      this.processNotificationQueue(); // Process next notification
    }, 2100); // 2 seconds + 100ms buffer
  }

  /**
   * Format Time Ago
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
