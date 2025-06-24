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
            this.enquiryList = data.data.items;
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

    updateStatus(enquiry: any, status: string) {
      const updateData = { status: status };

      this.enquiryService.updateEnquiry(enquiry.id, updateData).subscribe(
        res => {
          this.messageService.add({
            key: 'toastmsg',
            severity: 'success',
            summary: 'Updated',
            detail: 'Status updated successfully'
          });
          // Reload the list to get updated data
          this.loadEnquiries();
        },
        err => {
          this.messageService.add({
            key: 'toastmsg',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status'
          });
        }
      );
    }
}