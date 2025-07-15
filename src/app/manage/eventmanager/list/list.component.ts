import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { EnquiryService } from '../service/eventmanager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      { field: 'status', header: 'Status' }
    ];

    // Check user role and get email
    this.checkUserRole();
    this.loadEnquiries();
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
            this.messageService.add({
                key: 'toastmsg',
                severity: 'success',
                summary: 'Updated',
                detail: `Status updated to ${status}`
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
            this.messageService.add({
                key: 'toastmsg',
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update status'
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
}
