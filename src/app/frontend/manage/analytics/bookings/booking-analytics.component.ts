import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BookingService } from '../../../../services/booking.service';
import { VenueService } from '../../../../manage/venue/service/venue.service';
import { UserService } from '../../../../services/user.service';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: any;
}

interface VenueOption {
  _id: string;
  name: string;
  city: string;
  state: string;
}

@Component({
  selector: 'app-booking-analytics',
  templateUrl: './booking-analytics.component.html',
  styleUrls: ['./booking-analytics.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class BookingAnalyticsComponent implements OnInit, OnDestroy {

  // Calendar configuration
  calendarOptions: any = {};
  calendarEvents: CalendarEvent[] = [];

  // User and venue data
  userDetails: any = {};
  isAdmin: boolean = false;
  isVenueOwner: boolean = false;
  venueOptions: VenueOption[] = [];
  selectedVenueId: string = '';
  selectedVenue: VenueOption | null = null;

  // UI state
  loading: boolean = false;
  showCreateBookingDialog: boolean = false;
  showBlockDatesDialog: boolean = false;
  showBookingDetailsDialog: boolean = false;
  selectedBooking: any = null;

  // Forms
  createBookingForm: FormGroup;
  blockDatesForm: FormGroup;

  // Data
  bookingSummary: any = {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    blockedDates: 0
  };

  // Calendar event colors
  eventColors = {
    confirmed: '#28a745',
    pending: '#ffc107',
    cancelled: '#6c757d',
    blocked: '#dc3545',
    maintenance: '#dc3545'
  };

  // Dropdown options
  occasionOptions = [
    { label: 'Wedding', value: 'Wedding' },
    { label: 'Baby Shower', value: 'Baby Shower' },
    { label: 'Birthday Party', value: 'Birthday Party' },
    { label: 'Corporate Event', value: 'Corporate Event' },
    { label: 'Reception', value: 'Reception' },
    { label: 'Anniversary', value: 'Anniversary' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Blocked', value: 'Blocked' }
  ];

  decorTypeOptions = [
    { label: 'Basic', value: 'Basic' },
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' }
  ];

  foodMenuOptions = [
    { label: 'Veg', value: 'Veg' },
    { label: 'Non-Veg', value: 'Non-Veg' },
    { label: 'Veg + Non-Veg', value: 'Veg + Non-Veg' }
  ];

  eventDurationOptions = [
    { label: 'Morning', value: 'morning' },
    { label: 'Evening', value: 'evening' },
    { label: 'Night', value: 'night' },
    { label: 'Full Day', value: 'full' }
  ];

  constructor(
    private bookingService: BookingService,
    private venueService: VenueService,
    private userService: UserService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.initializeForms();
    this.initializeCalendar();
  }

  ngOnInit(): void {
    this.loadUserDetails();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  initializeForms(): void {
    this.createBookingForm = this.fb.group({
      userName: ['', Validators.required],
      userContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      userEmail: ['', [Validators.required, Validators.email]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      occasion: ['', Validators.required],
      guestCount: ['', Validators.required],
      eventDuration: [''],
      decorType: [''],
      decorPrice: [0],
      foodMenuType: [''],
      foodMenuPrice: [0],
      notes: ['']
    });

    this.blockDatesForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      height: 'auto',
      events: []
    };
  }

  async loadUserDetails(): Promise<void> {
    try {
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      if (!userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User not authenticated'
        });
        return;
      }

      const response = await this.userService.getUserDetails(userId).toPromise();
      if (response.success) {
        this.userDetails = response.data;
        this.isAdmin = this.userDetails.role === 'admin';
        this.isVenueOwner = this.userDetails.role === 'venue_owner';

        if (this.isAdmin) {
          await this.loadVenuesForAdmin();
        } else if (this.isVenueOwner) {
          this.selectedVenueId = this.userDetails.venueId;
          await this.loadVenueBookings();
        }
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user details'
      });
    }
  }

  async loadVenuesForAdmin(): Promise<void> {
    try {
      this.loading = true;
      const response = await this.bookingService.getVenuesForAdmin().toPromise();
      if (response.success) {
        this.venueOptions = response.data;
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load venues'
      });
    } finally {
      this.loading = false;
    }
  }

  async onVenueSelect(): Promise<void> {
    if (this.selectedVenueId) {
      this.selectedVenue = this.venueOptions.find(v => v._id === this.selectedVenueId) || null;
      await this.loadVenueBookings();
    }
  }

  async loadVenueBookings(): Promise<void> {
    if (!this.selectedVenueId) return;

    try {
      this.loading = true;
      const response = await this.bookingService.getVenueBookings(this.selectedVenueId).toPromise();
      
      if (response.success) {
        this.calendarEvents = response.data.calendarEvents;
        this.bookingSummary = response.data.summary;
        this.calendarOptions.events = this.calendarEvents;
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load bookings'
      });
    } finally {
      this.loading = false;
    }
  }

  handleDateSelect(selectInfo: any): void {
    if (!this.selectedVenueId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a venue first'
      });
      return;
    }

    // Set selected dates in forms
    const startDate = this.formatDateForInput(selectInfo.start);
    const endDate = this.formatDateForInput(selectInfo.end);
    
    this.createBookingForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });

    this.blockDatesForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });

    // Show options to user
    this.confirmationService.confirm({
      message: 'What would you like to do?',
      header: 'Select Action',
      acceptLabel: 'Create Booking',
      rejectLabel: 'Block Dates',
      accept: () => {
        this.showCreateBookingDialog = true;
      },
      reject: () => {
        this.showBlockDatesDialog = true;
      }
    });
  }

  handleEventClick(clickInfo: any): void {
    this.selectedBooking = clickInfo.event.extendedProps;
    this.showBookingDetailsDialog = true;
  }

  handleEvents(events: any[]): void {
    // Handle events if needed
  }

  async createBooking(): Promise<void> {
    if (this.createBookingForm.invalid) {
      this.markFormGroupTouched(this.createBookingForm);
      return;
    }

    try {
      this.loading = true;
      const formData = this.createBookingForm.value;
      
      const bookingData = {
        venueId: this.selectedVenueId,
        venueName: this.selectedVenue?.name || '',
        userId: this.userDetails._id,
        userName: formData.userName,
        userContact: formData.userContact,
        userEmail: formData.userEmail,
        details: {
          isBookedByAdmin: this.isAdmin,
          startFilterDate: this.formatDateForAPI(formData.startDate),
          endFilterDate: this.formatDateForAPI(formData.endDate),
          occasion: formData.occasion,
          guestCount: formData.guestCount,
          eventDuration: formData.eventDuration,
          weddingDecorType: formData.decorType,
          weddingDecorPrice: formData.decorPrice || 0,
          foodMenuType: formData.foodMenuType,
          foodMenuPrice: formData.foodMenuPrice || 0,
          bookingNotes: formData.notes,
          bookingType: 'offline',
          bookingStatus: 'confirmed',
          paymentStatus: 'not_applicable'
        }
      };

      const response = await this.bookingService.createBooking(bookingData).toPromise();
      
      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Booking created successfully'
        });
        
        this.showCreateBookingDialog = false;
        this.createBookingForm.reset();
        await this.loadVenueBookings();
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      let errorMessage = 'Failed to create booking';
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    } finally {
      this.loading = false;
    }
  }

  async blockDates(): Promise<void> {
    if (this.blockDatesForm.invalid) {
      this.markFormGroupTouched(this.blockDatesForm);
      return;
    }

    try {
      this.loading = true;
      const formData = this.blockDatesForm.value;
      
      const blockData = {
        venueId: this.selectedVenueId,
        startDate: this.formatDateForAPI(formData.startDate),
        endDate: this.formatDateForAPI(formData.endDate),
        reason: formData.reason,
        notes: formData.notes
      };

      const response = await this.bookingService.blockDates(blockData).toPromise();
      
      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dates blocked successfully'
        });
        
        this.showBlockDatesDialog = false;
        this.blockDatesForm.reset();
        await this.loadVenueBookings();
      }
    } catch (error: any) {
      console.error('Error blocking dates:', error);
      
      let errorMessage = 'Failed to block dates';
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    } finally {
      this.loading = false;
    }
  }

  async deleteBooking(bookingId: string): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this booking?',
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          this.loading = true;
          const response = await this.bookingService.deleteBooking(bookingId).toPromise();
          
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking cancelled successfully'
            });
            
            this.showBookingDetailsDialog = false;
            await this.loadVenueBookings();
          }
        } catch (error) {
          console.error('Error deleting booking:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to cancel booking'
          });
        } finally {
          this.loading = false;
        }
      }
    });
  }

  // Helper methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateForAPI(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  closeDialog(dialogName: string): void {
    switch (dialogName) {
      case 'create':
        this.showCreateBookingDialog = false;
        this.createBookingForm.reset();
        break;
      case 'block':
        this.showBlockDatesDialog = false;
        this.blockDatesForm.reset();
        break;
      case 'details':
        this.showBookingDetailsDialog = false;
        this.selectedBooking = null;
        break;
    }
  }
}
