import { Component, OnInit } from '@angular/core';
import { EnquiryService } from '../service/eventmanager.service';
import { MessageService } from 'primeng/api';

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

    constructor(
      private enquiryService: EnquiryService,
      private messageService: MessageService
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
      this.loadEnquiries();
    }

    loadEnquiries() {
      console.log('📊 DASHBOARD: Starting to load enquiries...');
      this.loading = true;

      this.enquiryService.getEnquiryList().subscribe(
        data => {
          console.log('📊 DASHBOARD: Received data from API:', data);
          this.loading = false;

          if (data && data.data && data.data.items && data.data.items.length > 0) {
            this.enquiryList = data.data.items.map(enquiry => ({
              ...enquiry,
              selectedLead: null,
              selectedLeadData: null,
              showLeadDetails: false,
              currentLeadIndex: 0 // Track which lead is currently displayed
            }));
            this.totalRecords = data.totalCount || data.data.items.length;
            console.log('📊 DASHBOARD: Enquiry list populated:', this.enquiryList);
          } else {
            console.log('📊 DASHBOARD: No data found, showing empty state');
            this.enquiryList = [];
            this.totalRecords = 0;
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

    // Legacy method for backward compatibility
    updateStatus(enquiry: any, status: string) {
      const currentUser = this.getCurrentUser(enquiry);
      this.updateLeadStatus(currentUser, enquiry, status);
    }
}