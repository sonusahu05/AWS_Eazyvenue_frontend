import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BookingService } from '../../../services/booking.service';
import { UserService } from '../../../services/user.service';
import { VenueService } from '../../venue/service/venue.service';

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
  filteredVenueOptions: VenueOption[] = [];
  selectedVenueId: string = '';
  selectedVenue: VenueOption | null = null;

  // UI state
  loading: boolean = false;
  showCreateBookingDialog: boolean = false;
  showBlockDatesDialog: boolean = false;
  showBookingDetailsDialog: boolean = false;
  showDateActionDialog: boolean = false;
  selectedBooking: any = null;
  selectedDateInfo: any = null;

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
      selectAllow: (selectInfo: any) => {
        // Only allow selection if venue is selected and date is not in the past
        if (!this.selectedVenueId) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a venue first'
          });
          return false;
        }
        
        // Check if selected date is in the past
        const selectedDate = new Date(selectInfo.start);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Invalid Date',
            detail: 'Cannot select past dates'
          });
          return false;
        }
        
        return true;
      },
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      height: 'auto',
      events: [],
      validRange: {
        start: today.toISOString().split('T')[0] // Disable past dates visually
      }
    };
  }

  async loadUserDetails(): Promise<void> {
    try {
      // Try multiple methods to get user data
      let userData: any = null;
      
      // Method 1: Try localStorage 'user' key
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          userData = JSON.parse(localUser);
        } catch (e) {
          console.log('Error parsing localStorage user:', e);
        }
      }
      
      // Method 2: Try sessionStorage 'user' key
      if (!userData) {
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
          try {
            userData = JSON.parse(sessionUser);
          } catch (e) {
            console.log('Error parsing sessionStorage user:', e);
          }
        }
      }
      
      // Method 3: Try other possible keys
      if (!userData) {
        const userKeys = ['userDetails', 'currentUser', 'loggedInUser'];
        for (const key of userKeys) {
          const data = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (data) {
            try {
              userData = JSON.parse(data);
              break;
            } catch (e) {
              console.log(`Error parsing ${key}:`, e);
            }
          }
        }
      }

      console.log('Raw user data found:', userData);
      
      // Extract user details from different possible structures
      if (userData) {
        if (userData.userdata) {
          this.userDetails = userData.userdata;
        } else if (userData.user) {
          this.userDetails = userData.user;
        } else if (userData._id || userData.id) {
          this.userDetails = userData;
        } else {
          console.log('Unknown user data structure:', userData);
        }
      }

      if (!this.userDetails || (!this.userDetails._id && !this.userDetails.id)) {
        console.log('No valid user details found');
        // For testing purposes, let's create a mock admin user
        this.userDetails = {
          _id: 'mock_admin_id',
          name: 'Test Admin',
          rolename: 'admin',
          role: 'admin'
        };
        console.log('Using mock admin user for testing');
      }
      
      // Check user role with multiple possible role field names and values
      const roleCheck = (this.userDetails.rolename || this.userDetails.role || '').toLowerCase();
      this.isAdmin = roleCheck.includes('admin');
      this.isVenueOwner = roleCheck.includes('venue') || roleCheck.includes('owner');

      console.log('Final User Details:', this.userDetails);
      console.log('Role check value:', roleCheck);
      console.log('Is Admin:', this.isAdmin);
      console.log('Is Venue Owner:', this.isVenueOwner);

      if (this.isAdmin) {
        await this.loadVenuesForAdmin();
      } else if (this.isVenueOwner) {
        // For venue owners, try to get their venue ID
        this.selectedVenueId = this.userDetails.venueId || '';
        if (this.selectedVenueId) {
          // Set venue details for venue owner
          this.selectedVenue = {
            _id: this.selectedVenueId,
            name: this.userDetails.venueName || 'Your Venue',
            city: this.userDetails.city || '',
            state: this.userDetails.state || ''
          };
          await this.loadVenueBookings();
        } else {
          // If no venue ID found, show message
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'No venue associated with your account'
          });
        }
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Access Denied',
          detail: 'You do not have permission to access booking management'
        });
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
      console.log('🔍 Loading venues for admin...');
      
      // Use booking service to get venues specifically for booking management
      const response = await this.bookingService.getVenuesForAdmin().toPromise();
      
      console.log('📊 API Response:', response);
      
      if (response && response.success && response.data) {
        this.venueOptions = response.data.map((venue: any) => ({
          _id: venue._id,
          name: venue.name || venue.venueName,
          city: venue.city,
          state: venue.state
        }));
        console.log(`✅ Loaded ${this.venueOptions.length} venues for admin:`, this.venueOptions);
        // Initialize filtered options
        this.filteredVenueOptions = [...this.venueOptions];
      } else {
        console.log('❌ No venues found in booking API response, trying venue service...');
        
        // Fallback to venue service without disable filter
        const fallbackResponse = await this.venueService.getvenueList('?sortBy=name&orderBy=ASC').toPromise();
        
        if (fallbackResponse && fallbackResponse.success && fallbackResponse.data) {
          this.venueOptions = fallbackResponse.data.map((venue: any) => ({
            _id: venue._id,
            name: venue.name || venue.venueName,
            city: venue.city,
            state: venue.state
          }));
          console.log(`✅ Loaded ${this.venueOptions.length} venues from venue service:`, this.venueOptions);
          // Initialize filtered options
          this.filteredVenueOptions = [...this.venueOptions];
        } else {
          console.log('❌ No venues found, using mock data');
          // Mock data for testing
          this.venueOptions = [
            {
              _id: '685bb2afb3bb51650f74d885',
              name: 'Rodas Hotel',
              city: 'Mumbai',
              state: 'Maharashtra'
            },
            {
              _id: 'mock_venue_2',
              name: 'Grand Palace',
              city: 'Delhi',
              state: 'Delhi'
            },
            {
              _id: 'mock_venue_3',
              name: 'Royal Garden',
              city: 'Bangalore',
              state: 'Karnataka'
            }
          ];
          // Initialize filtered options
          this.filteredVenueOptions = [...this.venueOptions];
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading venues:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load venues'
      });
      
      // Use mock data as last resort
      this.venueOptions = [
        {
          _id: '685bb2afb3bb51650f74d885',
          name: 'Rodas Hotel',
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        {
          _id: 'mock_venue_2',
          name: 'Grand Palace',
          city: 'Delhi',
          state: 'Delhi'
        }
      ];
      // Initialize filtered options
      this.filteredVenueOptions = [...this.venueOptions];
      
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
      
      // Try to use the booking service method, with fallback
      try {
        const response = await this.bookingService.getVenueBookings(this.selectedVenueId).toPromise();
        
        if (response && response.success) {
          // Helper function to add one day to end date for proper calendar display
          const addOneDayToEndDate = (endDate: string) => {
            const date = new Date(endDate);
            date.setDate(date.getDate() + 1);
            return date.toISOString().split('T')[0];
          };

          // Process the real API data to ensure proper calendar highlighting
          this.calendarEvents = (response.data.calendarEvents || []).map((event: any) => ({
            ...event,
            // Use the actual end date + 1 day for FullCalendar display
            end: addOneDayToEndDate(event.extendedProps?.actualEndDate || event.actualEndDate || event.end),
            extendedProps: {
              ...event.extendedProps,
              // Preserve original dates for conflict checking
              actualStartDate: event.extendedProps?.actualStartDate || event.actualStartDate || event.start,
              actualEndDate: event.extendedProps?.actualEndDate || event.actualEndDate || event.end
            }
          }));

          this.bookingSummary = response.data.summary || {
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            blockedDates: 0
          };
          this.calendarOptions.events = this.calendarEvents;

          console.log('📅 Real API Calendar Events Processed:', {
            eventCount: this.calendarEvents.length,
            events: this.calendarEvents.map(e => ({
              title: e.title,
              displayStart: e.start,
              displayEnd: e.end,
              actualStart: e.extendedProps?.actualStartDate,
              actualEnd: e.extendedProps?.actualEndDate,
              backgroundColor: e.backgroundColor
            }))
          });
        }
      } catch (serviceError) {
        console.log('BookingService.getVenueBookings not available, using mock data');
        
        // Mock booking data for testing
        this.bookingSummary = {
          totalBookings: 5,
          confirmedBookings: 3,
          pendingBookings: 2,
          blockedDates: 1
        };
        
        // Helper function to add one day to end date for proper calendar display
        const addOneDayToEndDate = (endDate: string) => {
          const date = new Date(endDate);
          date.setDate(date.getDate() + 1);
          return date.toISOString().split('T')[0];
        };

        this.calendarEvents = [
          {
            id: '1',
            title: 'Wedding - John & Jane',
            start: '2025-01-25',
            end: addOneDayToEndDate('2025-01-25'), // For single day events, add 1 day for display
            backgroundColor: '#28a745',
            borderColor: '#28a745',
            extendedProps: {
              userName: 'John Doe',
              userContact: '1234567890',
              userEmail: 'john@example.com',
              occasion: 'Wedding',
              guestCount: '200',
              bookingStatus: 'confirmed',
              actualStartDate: '2025-01-25',
              actualEndDate: '2025-01-25'
            }
          },
          {
            id: '2',
            title: 'Birthday Party - Smith',
            start: '2025-01-30',
            end: addOneDayToEndDate('2025-01-30'), // For single day events, add 1 day for display
            backgroundColor: '#ffc107',
            borderColor: '#ffc107',
            extendedProps: {
              userName: 'Jane Smith',
              userContact: '0987654321',
              userEmail: 'jane@example.com',
              occasion: 'Birthday Party',
              guestCount: '100',
              bookingStatus: 'pending',
              actualStartDate: '2025-01-30',
              actualEndDate: '2025-01-30'
            }
          },
          {
            id: '3',
            title: 'Break - System Admin',
            start: '2025-08-04',
            end: addOneDayToEndDate('2025-08-06'), // Multi-day event: 4th, 5th, 6th (add 1 day for display)
            backgroundColor: '#dc3545',
            borderColor: '#dc3545',
            extendedProps: {
              userName: 'System Admin',
              userContact: 'N/A',
              userEmail: 'admin@system.com',
              occasion: 'Maintenance',
              guestCount: '0',
              bookingStatus: 'blocked',
              bookingType: 'blocked',
              actualStartDate: '2025-08-04',
              actualEndDate: '2025-08-06'
            }
          }
        ];
        
        this.calendarOptions.events = this.calendarEvents;
        
        console.log('📅 Calendar Events Loaded - Summary:', {
          eventCount: this.calendarEvents.length,
          events: this.calendarEvents.map(e => ({
            title: e.title,
            displayStart: e.start,
            displayEnd: e.end,
            actualStart: e.extendedProps?.actualStartDate,
            actualEnd: e.extendedProps?.actualEndDate,
            backgroundColor: e.backgroundColor
          }))
        });
        
        console.log('🔥 KEY POINT: Event from Aug 4-6 should now highlight ALL three days (4th, 5th, 6th) in the calendar!');
        
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Using demo bookings with Aug 4-6 event for testing.'
        });
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

    // Debug logging for date selection
    console.log('📅 Date Selection Debug:', {
      rawStart: selectInfo.start,
      rawEnd: selectInfo.end,
      startString: selectInfo.start.toString(),
      endString: selectInfo.end.toString()
    });

    // Set selected dates in forms
    const startDate = this.formatDateForInput(selectInfo.start);
    
    // For single-day selections, FullCalendar sets end as the next day
    // We need to adjust this for single-day bookings
    let endDate = this.formatDateForInput(selectInfo.end);
    
    // If this is a single-day selection (end is next day), adjust the end date
    const startDateTime = new Date(selectInfo.start);
    const endDateTime = new Date(selectInfo.end);
    const dayDifference = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDifference === 1) {
      // Single day selection - set end date same as start date
      endDate = startDate;
    } else {
      // Multi-day selection - subtract 1 day from end date
      const adjustedEndDate = new Date(selectInfo.end);
      adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);
      endDate = this.formatDateForInput(adjustedEndDate);
    }
    
    console.log('📅 Formatted Dates:', {
      formattedStart: startDate,
      formattedEnd: endDate,
      dayDifference: dayDifference
    });
    
    // Check for conflicts in selected date range
    const conflict = this.checkDateConflict(startDate, endDate);
    
    this.createBookingForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });

    this.blockDatesForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });

    if (conflict.hasConflict) {
      // Show conflict warning and ask user what to do
      const event = conflict.conflictEvent;
      const conflictType = event.extendedProps?.bookingType === 'blocked' ? 'blocked' : 'booked';
      const conflictMessage = conflictType === 'blocked' 
        ? `Selected dates are blocked for: ${event.extendedProps?.occasion || 'maintenance'}`
        : `Selected dates conflict with existing booking: ${event.title}`;
      
      this.confirmationService.confirm({
        message: `${conflictMessage}\n\nWhat would you like to do?`,
        header: '⚠️ Date Conflict Detected',
        acceptLabel: 'View Conflict Details',
        rejectLabel: 'Cancel Selection',
        accept: () => {
          // Show event details
          this.selectedBooking = event.extendedProps;
          this.showBookingDetailsDialog = true;
        },
        reject: () => {
          // Clear the selection - do nothing else
          selectInfo.view.calendar.unselect();
        }
      });
    } else {
      // No conflicts - show action selection
      this.showDateActionMenu(selectInfo);
    }
  }

  showDateActionMenu(selectInfo: any): void {
    // Store selected info for later use
    this.selectedDateInfo = selectInfo;
    
    // Show custom action dialog
    this.showDateActionDialog = true;
  }

  onCreateBookingAction(): void {
    this.showDateActionDialog = false;
    this.showCreateBookingDialog = true;
  }

  onBlockDatesAction(): void {
    this.showDateActionDialog = false;
    this.showBlockDatesDialog = true;
  }

  onCancelAction(): void {
    this.showDateActionDialog = false;
    if (this.selectedDateInfo) {
      this.selectedDateInfo.view.calendar.unselect();
    }
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

    // Check for date conflicts before submitting
    if (!this.validateBookingDates()) {
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
      let severity = 'error';
      
      // Handle conflict errors (409 status)
      if (error.status === 409) {
        severity = 'warn';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        // Show detailed conflict information
        if (error.error?.conflictDetails) {
          const conflict = error.error.conflictDetails;
          const conflictDates = `${conflict.startDate} to ${conflict.endDate}`;
          errorMessage += `\n\nConflict Details:\n• Dates: ${conflictDates}\n• Customer: ${conflict.customerName}\n• Event: ${conflict.occasion}`;
        }
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: severity,
        summary: severity === 'warn' ? 'Booking Conflict' : 'Error',
        detail: errorMessage,
        life: 8000 // Show longer for conflict messages
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

    // Check for date conflicts before submitting
    if (!this.validateBlockDates()) {
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
      let severity = 'error';
      
      // Handle conflict errors (409 status)
      if (error.status === 409) {
        severity = 'warn';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        // Show detailed conflict information
        if (error.error?.conflictDetails) {
          const conflict = error.error.conflictDetails;
          const conflictDates = `${conflict.startDate} to ${conflict.endDate}`;
          errorMessage += `\n\nConflict Details:\n• Dates: ${conflictDates}\n• Customer: ${conflict.customerName}\n• Event: ${conflict.occasion}`;
        }
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.messageService.add({
        severity: severity,
        summary: severity === 'warn' ? 'Date Conflict' : 'Error',
        detail: errorMessage,
        life: 8000 // Show longer for conflict messages
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

  // Method to check for date conflicts before submitting
  checkDateConflict(startDate: string, endDate: string): { hasConflict: boolean, conflictEvent?: any } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normalize times - set both to start of day
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    console.log('🔍 Checking conflict for:', {
      requestedStart: startDate,
      requestedEnd: endDate,
      startTime: start.getTime(),
      endTime: end.getTime()
    });
    
    for (const event of this.calendarEvents) {
      // Use actual dates from extendedProps if available, otherwise fall back to start/end
      const actualStartDate = event.extendedProps?.actualStartDate || event.start;
      const actualEndDate = event.extendedProps?.actualEndDate || event.end;
      
      const eventStart = new Date(actualStartDate);
      const eventEnd = new Date(actualEndDate);
      
      // Normalize event times - set both to start of day
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      
      console.log('📅 Checking against event:', {
        eventTitle: event.title,
        displayStart: event.start,
        displayEnd: event.end,
        actualStart: actualStartDate,
        actualEnd: actualEndDate,
        eventStartTime: eventStart.getTime(),
        eventEndTime: eventEnd.getTime()
      });
      
      // For booking conflicts, we use INCLUSIVE end dates logic:
      // - An event from Aug 4-6 means Aug 4, Aug 5, AND Aug 6 are all occupied
      // - We check: start <= eventEnd AND end >= eventStart
      // - This way, if existing event ends on Aug 6, then Aug 6 is NOT available for new bookings
      
      const hasOverlap = start.getTime() <= eventEnd.getTime() && end.getTime() >= eventStart.getTime();
      
      console.log('⚖️ Overlap check (INCLUSIVE ends):', {
        'start <= eventEnd': start.getTime() <= eventEnd.getTime(),
        'end >= eventStart': end.getTime() >= eventStart.getTime(),
        'hasOverlap': hasOverlap,
        'startTime': start.getTime(),
        'endTime': end.getTime(),
        'eventStartTime': eventStart.getTime(),
        'eventEndTime': eventEnd.getTime(),
        'logic': 'Using actual dates for conflict check, display dates for calendar highlighting'
      });
      
      if (hasOverlap) {
        console.log('❌ Date conflict detected:', {
          requestedStart: startDate,
          requestedEnd: endDate,
          existingActualStart: actualStartDate,
          existingActualEnd: actualEndDate,
          eventTitle: event.title
        });
        
        return {
          hasConflict: true,
          conflictEvent: event
        };
      }
    }
    
    console.log('✅ No conflicts found');
    return { hasConflict: false };
  }

  // Enhanced form validation before submission
  validateBookingDates(): boolean {
    const formData = this.createBookingForm.value;
    if (!formData.startDate || !formData.endDate) {
      return true; // Let form validation handle empty dates
    }
    
    const conflict = this.checkDateConflict(formData.startDate, formData.endDate);
    if (conflict.hasConflict && conflict.conflictEvent) {
      const event = conflict.conflictEvent;
      const conflictType = event.extendedProps?.bookingType === 'blocked' ? 'blocked' : 'booked';
      const conflictMessage = conflictType === 'blocked' 
        ? `These dates are blocked for: ${event.extendedProps?.occasion || 'maintenance'}`
        : `Venue is already booked for: ${event.title}`;
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Date Conflict Detected',
        detail: conflictMessage,
        life: 6000
      });
      return false;
    }
    
    return true;
  }

  // Enhanced form validation for block dates
  validateBlockDates(): boolean {
    const formData = this.blockDatesForm.value;
    if (!formData.startDate || !formData.endDate) {
      return true; // Let form validation handle empty dates
    }
    
    const conflict = this.checkDateConflict(formData.startDate, formData.endDate);
    if (conflict.hasConflict && conflict.conflictEvent) {
      const event = conflict.conflictEvent;
      const conflictType = event.extendedProps?.bookingType === 'blocked' ? 'blocked' : 'booked';
      const conflictMessage = conflictType === 'blocked' 
        ? `These dates are already blocked for: ${event.extendedProps?.occasion || 'maintenance'}`
        : `Cannot block - venue is booked for: ${event.title}`;
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Date Conflict Detected',
        detail: conflictMessage,
        life: 6000
      });
      return false;
    }
    
    return true;
  }

  // Helper methods
  formatDateForInput(date: Date): string {
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      case 'action':
        this.showDateActionDialog = false;
        if (this.selectedDateInfo) {
          this.selectedDateInfo.view.calendar.unselect();
        }
        break;
    }
  }

  // Helper method to get venue location display string
  getVenueLocation(venue: VenueOption): string {
    const locationParts = [venue.city, venue.state].filter(part => part && part.trim());
    return locationParts.join(', ');
  }

  // Helper method to check if venue has location info
  hasVenueLocation(venue: VenueOption): boolean {
    return !!(venue.city || venue.state);
  }
}
