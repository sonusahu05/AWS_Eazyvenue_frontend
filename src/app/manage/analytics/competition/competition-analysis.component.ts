import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VenueService } from '../../venue/service/venue.service';
import { GeolocationService } from '../../../services/geolocation.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TokenStorageService } from '../../../services/token-storage.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Dynamic imports for SSR compatibility
let jsPDF: any;
let html2canvas: any;

interface CompetitionVenue {
  id: string;
  name: string;
  cityname: string;
  subarea: string;
  capacity: number;
  distance?: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  vegPrice: number;
  nonVegPrice: number;
  theatreCapacity: number;
  floatingCapacity: number;
  amenities: string[];
  rating: number;
  isAssured: boolean;
  latitude?: number;
  longitude?: number;
  bookingPrice?: number;
  address: string;
  email: string;
  mobileNumber: string;
  propertyType: string;
  isCurrentVenue?: boolean;
}

interface DistanceFilter {
  label: string;
  value: number;
}

@Component({
  selector: 'app-competition-analysis',
  templateUrl: './competition-analysis.component.html',
  styleUrls: ['./competition-analysis.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CompetitionAnalysisComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isBrowser: boolean;
  
  // Data
  competitionVenues: CompetitionVenue[] = [];
  currentVenue: CompetitionVenue | null = null;
  filteredVenues: CompetitionVenue[] = [];
  searchValue: string = '';
  
  // Filters
  distanceFilters: DistanceFilter[] = [
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '15 km', value: 15 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 }
  ];
  selectedDistanceFilter: DistanceFilter = this.distanceFilters[0]; // Default 5km
  
  // Loading and UI states
  loading = true;
  userLocation: any = null;
  
  // User access control
  userRole: string = '';
  isAdmin = false;
  isVenueOwner = false;
  currentUserEmail = '';
  venueOwnerVenueId: string = '';
  
  // Statistics
  statistics = {
    totalCompetitors: 0,
    avgCompetitorPrice: 0,
    minCompetitorPrice: 0,
    maxCompetitorPrice: 0,
    avgDistance: 0,
    priceAdvantage: 0 // Positive if current venue is cheaper, negative if more expensive
  };
  
  // Table settings
  cols: any[] = [];
  exportColumns: any[] = [];
  
  constructor(
    private venueService: VenueService,
    private geolocationService: GeolocationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Ensure statistics is always initialized
    if (!this.statistics) {
      this.statistics = this.getEmptyStatistics();
    }
    
    this.initializeColumns();
    this.checkUserAccess();
    
    if (this.isBrowser) {
      this.initializeUserLocation();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns() {
    this.cols = [
      { field: 'name', header: 'Venue Name', sortable: true },
      { field: 'distance', header: 'Distance (km)', sortable: true },
      { field: 'cityname', header: 'City', sortable: true },
      { field: 'subarea', header: 'Subarea', sortable: true },
      { field: 'capacity', header: 'Capacity', sortable: true },
      { field: 'avgPrice', header: 'Avg Price (₹)', sortable: true },
      { field: 'vegPrice', header: 'Veg Price (₹)', sortable: true },
      { field: 'nonVegPrice', header: 'Non-Veg Price (₹)', sortable: true },
      { field: 'theatreCapacity', header: 'Theatre Capacity', sortable: true },
      { field: 'propertyType', header: 'Property Type', sortable: true },
      { field: 'rating', header: 'Rating', sortable: true },
      { field: 'isAssured', header: 'Assured', sortable: true }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  private checkUserAccess() {
    const userData = this.tokenStorageService.getUser();
    
    if (userData && userData.userdata) {
      this.userRole = userData.userdata.rolename || '';
      this.isAdmin = this.userRole === 'admin';
      this.isVenueOwner = this.userRole === 'venueowner';
      this.currentUserEmail = userData.userdata.email || '';
      
      console.log('User access check:', {
        isAdmin: this.isAdmin,
        isVenueOwner: this.isVenueOwner,
        userRole: this.userRole,
        email: this.currentUserEmail
      });
    }
  }

  private async initializeUserLocation() {
    try {
      this.userLocation = await this.geolocationService.getUserLocation();
      console.log('User location initialized:', this.userLocation);
      this.loadCurrentVenue();
    } catch (error) {
      console.error('Error getting user location:', error);
      this.loadCurrentVenue(); // Load without location
    }
  }

  private loadCurrentVenue() {
    if (this.isVenueOwner) {
      this.loadVenueOwnerVenue();
    } else if (this.isAdmin) {
      // For admin, we'll need to select a venue or get it from route params
      this.loadAdminSelectedVenue();
    } else {
      this.showAccessDeniedMessage();
    }
  }

  private loadVenueOwnerVenue() {
    // Get venues filtered by the venue owner's email
    const query = `?admin=true&email=${encodeURIComponent(this.currentUserEmail)}&pageSize=1&pageNumber=1&filterByDisable=false`;
    
    const sub = this.venueService.getVenueListForFilter(query).subscribe({
      next: (response) => {
        if (response?.data?.items && response.data.items.length > 0) {
          const venueData = response.data.items[0];
          this.currentVenue = this.mapToCompetitionVenue(venueData, true);
          this.venueOwnerVenueId = this.currentVenue.id;
          
          console.log('Current venue loaded:', this.currentVenue);
          this.loadCompetitionVenues();
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Venue Found',
            detail: 'No venue found for your account. Please contact support.'
          });
        }
      },
      error: (error) => {
        console.error('Error loading venue owner venue:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load your venue details'
        });
      }
    });
    
    this.subscriptions.add(sub);
  }

  private loadAdminSelectedVenue() {
    // For now, load first available venue for admin
    // TODO: Add venue selection dropdown for admin
    const query = `?admin=true&pageSize=1&pageNumber=1&filterByDisable=false&filterByStatus=true`;
    
    const sub = this.venueService.getVenueListForFilter(query).subscribe({
      next: (response) => {
        if (response?.data?.items && response.data.items.length > 0) {
          const venueData = response.data.items[0];
          this.currentVenue = this.mapToCompetitionVenue(venueData, true);
          
          console.log('Admin selected venue loaded:', this.currentVenue);
          this.loadCompetitionVenues();
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Venues Found',
            detail: 'No active venues found in the system'
          });
        }
      },
      error: (error) => {
        console.error('Error loading admin venue:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load venue details'
        });
      }
    });
    
    this.subscriptions.add(sub);
  }

  private loadCompetitionVenues() {
    if (!this.currentVenue) {
      console.log('=== LOAD COMPETITION VENUES: NO CURRENT VENUE ===');
      return;
    }

    console.log('=== LOAD COMPETITION VENUES START ===');
    console.log('Current venue ID:', this.currentVenue.id);
    console.log('Distance filter:', this.selectedDistanceFilter.value);

    this.loading = true;

    // Use the new competition analysis API
    const sub = this.venueService.getCompetitionAnalysis(
      this.currentVenue.id,
      {
        distance: this.selectedDistanceFilter.value,
        pageNumber: 1,
        pageSize: 500 // Get more venues to ensure good coverage
      }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('=== LOADING STATE SET TO FALSE ===');
        console.log('Loading is now:', this.loading);
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.log('=== FRONTEND: API RESPONSE RECEIVED ===');
        console.log('Full response:', response);
        console.log('Response success:', response?.success);
        console.log('Response has data:', !!response?.data);
        
        if (response?.data) {
          console.log('Competition venues from API:', response.data.competitionVenues);
          console.log('Competition venues length:', response.data.competitionVenues?.length || 0);
          console.log('Statistics from API:', response.data.statistics);
          
          if (response.data.competitionVenues && response.data.competitionVenues.length > 0) {
            console.log('First venue from API:', response.data.competitionVenues[0]);
          }
        }
        
        if (response?.success && response?.data) {
          // Map the API response to our interface
          console.log('=== MAPPING VENUES ===');
          this.competitionVenues = response.data.competitionVenues.map(venue => {
            const mapped = this.mapApiResponseToCompetitionVenue(venue);
            console.log(`Mapped venue ${venue.name}:`, mapped);
            return mapped;
          });
          
          this.statistics = response.data.statistics || this.getEmptyStatistics();
          
          // Apply client-side distance filter if needed
          this.applyDistanceFilter();
          
          // Force UI refresh after data is loaded
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 100);
          
          console.log(`=== FINAL RESULT ===`);
          console.log(`Loaded ${this.competitionVenues.length} competition venues`);
          console.log(`Filtered venues: ${this.filteredVenues.length}`);
          console.log('Statistics:', this.statistics);
        } else {
          console.log('=== NO SUCCESS OR DATA ===');
          this.competitionVenues = [];
          this.filteredVenues = [];
          this.statistics = this.getEmptyStatistics();
        }
        
        this.calculateStatistics();
      },
      error: (error) => {
        this.loading = false;
        console.log('=== ERROR: LOADING STATE SET TO FALSE ===');
        console.log('Loading is now:', this.loading);
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.error('Error loading competition venues:', error);
        
        // Always ensure statistics is initialized first
        if (!this.statistics) {
          this.statistics = this.getEmptyStatistics();
        }
        
        // Check if this is a 400 error with coordinate issues but still has data structure
        if (error.status === 400 && error.error?.data) {
          // Handle 400 error but with data (coordinates missing)
          this.competitionVenues = error.error.data.competitionVenues || [];
          this.filteredVenues = this.competitionVenues;
          this.statistics = error.error.data.statistics || this.getEmptyStatistics();
          
          console.log('400 error with data - statistics:', this.statistics);
          
          this.messageService.add({
            severity: 'warn',
            summary: 'Location Data Missing',
            detail: error.error.message || 'Your venue does not have location coordinates. Please update your venue with latitude and longitude to use competition analysis.'
          });
          
          this.applyDistanceFilter();
          this.calculateStatistics();
        } else if (error.status === 400 && error.error?.message?.includes('location coordinates')) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Location Data Missing',
            detail: 'Your venue does not have location coordinates. Please update your venue with latitude and longitude to use competition analysis.'
          });
          
          this.competitionVenues = [];
          this.filteredVenues = [];
          this.statistics = this.getEmptyStatistics();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load competition data'
          });
          
          this.competitionVenues = [];
          this.filteredVenues = [];
          this.statistics = this.getEmptyStatistics();
        }
        
        console.log('Final statistics after error handling:', this.statistics);
      }
    });
    
    this.subscriptions.add(sub);
  }



  private mapToCompetitionVenue(venue: any, isCurrentVenue: boolean = false): CompetitionVenue {
    // Calculate prices from foodMenuType
    let vegPrice = 0;
    let nonVegPrice = 0;
    let avgPrice = 0;

    if (venue.foodMenuType) {
      if (venue.foodMenuType.veg_food && venue.foodMenuType.veg_food.length > 0) {
        vegPrice = venue.foodMenuType.veg_food[0].value || 0;
      }
      if (venue.foodMenuType.non_veg_food && venue.foodMenuType.non_veg_food.length > 0) {
        nonVegPrice = venue.foodMenuType.non_veg_food[0].value || 0;
      }
      
      // Average of veg and non-veg prices
      if (vegPrice > 0 && nonVegPrice > 0) {
        avgPrice = (vegPrice + nonVegPrice) / 2;
      } else if (vegPrice > 0) {
        avgPrice = vegPrice;
      } else if (nonVegPrice > 0) {
        avgPrice = nonVegPrice;
      }
    }

    // Parse amenities
    let amenitiesList: string[] = [];
    if (venue.amenities) {
      if (typeof venue.amenities === 'string') {
        amenitiesList = venue.amenities.split(',').map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(venue.amenities)) {
        amenitiesList = venue.amenities;
      }
    }

    return {
      id: venue.id || venue._id,
      name: venue.name || 'Unknown Venue',
      cityname: venue.cityname || '',
      subarea: venue.subarea || venue.subareadata?.[0]?.name || '',
      capacity: venue.capacity || 0,
      minPrice: venue.minPrice || Math.min(vegPrice, nonVegPrice) || 0,
      maxPrice: venue.maxPrice || Math.max(vegPrice, nonVegPrice) || 0,
      avgPrice: avgPrice,
      vegPrice: vegPrice,
      nonVegPrice: nonVegPrice,
      theatreCapacity: venue.theaterSitting || venue.theatreCapacity || 0,
      floatingCapacity: venue.floatingCapacity || venue.capacity || 0,
      amenities: amenitiesList,
      rating: venue.eazyVenueRating || venue.googleRating || 0,
      isAssured: venue.assured || false,
      latitude: venue.latitude ? parseFloat(venue.latitude) : undefined,
      longitude: venue.longitude ? parseFloat(venue.longitude) : undefined,
      bookingPrice: venue.bookingPrice || 0,
      address: venue.address || '',
      email: venue.email || '',
      mobileNumber: venue.mobileNumber || '',
      propertyType: venue.propertyType?.name || venue.propertytype?.name || '',
      isCurrentVenue: isCurrentVenue
    };
  }

  private mapApiResponseToCompetitionVenue(venue: any): CompetitionVenue {
    console.log('Mapping venue:', venue); // Debug log
    
    return {
      id: venue.id || venue._id,
      name: venue.name || 'Unknown Venue',
      cityname: venue.cityname || '',
      subarea: venue.subarea || '',
      capacity: venue.capacity || 0,
      distance: venue.distance,
      minPrice: venue.minPrice || 0,
      maxPrice: venue.maxPrice || 0,
      avgPrice: venue.avgPrice || 0,
      vegPrice: venue.vegPrice || 0,
      nonVegPrice: venue.nonVegPrice || 0,
      theatreCapacity: venue.theaterSitting || 0,
      floatingCapacity: venue.capacity || 0,
      amenities: venue.amenities || [],
      rating: venue.rating || venue.eazyVenueRating || venue.googleRating || 0,
      isAssured: venue.assured || false,
      latitude: venue.latitude ? parseFloat(venue.latitude) : (venue.lat ? parseFloat(venue.lat) : undefined),
      longitude: venue.longitude ? parseFloat(venue.longitude) : (venue.lng ? parseFloat(venue.lng) : undefined),
      bookingPrice: venue.bookingPrice || 0,
      address: venue.address || '',
      email: venue.email || '',
      mobileNumber: venue.mobileNumber || '',
      propertyType: venue.propertyType || '',
      isCurrentVenue: false
    };
  }

  private getEmptyStatistics() {
    return {
      totalCompetitors: 0,
      avgCompetitorPrice: 0,
      minCompetitorPrice: 0,
      maxCompetitorPrice: 0,
      avgDistance: 0,
      priceAdvantage: 0
    };
  }

  onDistanceFilterChange() {
    console.log('=== DISTANCE FILTER CHANGED ===');
    console.log('New distance filter:', this.selectedDistanceFilter);
    console.log('About to reload competition venues...');
    this.loadCompetitionVenues(); // Reload with new distance
  }

  private applyDistanceFilter() {
    // Since we're getting filtered data from API, just assign it
    this.filteredVenues = this.competitionVenues || [];
    console.log(`=== APPLY DISTANCE FILTER ===`);
    console.log(`Competition venues: ${this.competitionVenues.length}`);
    console.log(`Filtered venues: ${this.filteredVenues.length}`);
    console.log(`Showing ${this.filteredVenues.length} venues within ${this.selectedDistanceFilter.value}km`);
    
    // DEBUG: Log each filtered venue
    this.filteredVenues.forEach((venue, index) => {
      console.log(`Filtered venue ${index + 1}:`, {
        id: venue.id,
        name: venue.name,
        distance: venue.distance,
        avgPrice: venue.avgPrice
      });
    });
  }

  private calculateStatistics() {
    // Since we get statistics from API, we can use them directly
    // This method can be used for any additional client-side calculations if needed
    if (!this.statistics) {
      this.statistics = this.getEmptyStatistics();
    }
  }

  // Navigation and actions
  navigateToVenue(venue: CompetitionVenue) {
    if (venue.id) {
      // Open venue details in new tab
      const url = `/venue/${venue.id}`;
      window.open(url, '_blank');
    }
  }

  async exportToPDF() {
    // Check if running in browser
    if (!this.isBrowser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Available',
        detail: 'PDF export is only available in the browser'
      });
      return;
    }

    try {
      if (!this.filteredVenues || this.filteredVenues.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'No data available to export'
        });
        return;
      }

      // Dynamic import of PDF libraries for SSR compatibility
      if (!jsPDF || !html2canvas) {
        this.messageService.add({
          severity: 'info',
          summary: 'Loading Libraries',
          detail: 'Loading PDF generation libraries...'
        });

        const [jsPDFModule, html2canvasModule] = await Promise.all([
          import('jspdf'),
          import('html2canvas')
        ]);

        jsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default || jsPDFModule;
        html2canvas = (html2canvasModule as any).default || html2canvasModule;
      }

      // Show loading message
      this.messageService.add({
        severity: 'info',
        summary: 'Generating PDF',
        detail: 'Please wait while we generate your competition analysis report...'
      });

      // Ensure all data is loaded first
      await this.waitForDataLoad();

      // Temporarily hide loading for clean capture
      const originalLoading = this.loading;
      this.loading = false;

      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the competition analysis element
      const competitionElement = document.querySelector('.competition-analysis-container') as HTMLElement;
      
      if (!competitionElement) {
        throw new Error('Competition analysis element not found');
      }

      // Apply PDF export mode class
      competitionElement.classList.add('pdf-export-mode');
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));

      this.messageService.add({
        severity: 'info',
        summary: 'Processing',
        detail: 'Capturing competition analysis content...'
      });

      // Configure html2canvas options
      const canvas = await html2canvas(competitionElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: competitionElement.scrollWidth,
        height: competitionElement.scrollHeight,
        logging: false,
        ignoreElements: (element) => {
          return element.classList.contains('p-dialog') ||
                 element.classList.contains('p-sidebar') ||
                 element.classList.contains('p-toast') ||
                 element.classList.contains('loading-overlay') ||
                 element.tagName === 'P-DIALOG' ||
                 element.tagName === 'P-SIDEBAR';
        },
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.competition-analysis-container') as HTMLElement;
          if (clonedElement) {
            // Remove any loading overlays from clone
            const loadingOverlays = clonedElement.querySelectorAll('.loading-overlay');
            loadingOverlays.forEach(overlay => overlay.remove());
            
            // Remove any dialogs or sidebars from clone
            const dialogs = clonedElement.querySelectorAll('p-dialog, p-sidebar, .p-dialog, .p-sidebar');
            dialogs.forEach(dialog => dialog.remove());
            
            // Force visibility of all content
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              if (el.style.display === 'none' && !el.classList.contains('p-dialog')) {
                el.style.display = '';
              }
            });
            
            // Ensure table cells are visible
            const tableCells = clonedElement.querySelectorAll('td, th, .p-datatable-tbody tr');
            tableCells.forEach((cell: any) => {
              cell.style.opacity = '1';
              cell.style.visibility = 'visible';
            });
          }
        }
      });

      // Restore original state
      this.loading = originalLoading;
      competitionElement.classList.remove('pdf-export-mode');

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new (jsPDF as any)({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      let position = 0;

      // Add title page content
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EazyVenue', 20, 30);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Competition Analysis Report', 20, 42);
      
      // Add current venue info if available
      if (this.currentVenue) {
        pdf.setFontSize(12);
        pdf.text(`Venue: ${this.currentVenue.name}`, 20, 60);
        pdf.text(`Location: ${this.currentVenue.cityname}, ${this.currentVenue.subarea}`, 20, 70);
      }
      
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 85);
      pdf.text(`Distance Filter: ${this.selectedDistanceFilter.label}`, 20, 95);
      
      // Add horizontal line
      pdf.setDrawColor(44, 62, 80);
      pdf.setLineWidth(0.5);
      pdf.line(20, 105, 190, 105);

      // Add main content
      position = 115;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth - 20, (imgHeight * (imgWidth - 20)) / imgWidth);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth - 20, (imgHeight * (imgWidth - 20)) / imgWidth);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `competition-analysis-${this.currentVenue?.name || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Competition analysis exported to PDF successfully'
      });
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Failed to export PDF. Please try again.'
      });
    }
  }

  /**
   * Wait for data to load before PDF export
   */
  private async waitForDataLoad(): Promise<void> {
    // Wait for any pending data loads
    while (this.loading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Check if essential data is loaded
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max wait
    
    while (attempts < maxAttempts) {
      const hasVenues = this.filteredVenues && this.filteredVenues.length > 0;
      const hasCurrentVenue = this.currentVenue !== null;
      const hasStatistics = this.statistics && this.statistics.totalCompetitors >= 0;
      
      if (hasVenues && hasCurrentVenue && hasStatistics) {
        break;
      }
      
      console.log(`⏳ Waiting for competition data... Attempt ${attempts + 1}/${maxAttempts}`, {
        hasVenues,
        hasCurrentVenue,
        hasStatistics
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Give extra time for UI to render completely
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📊 Competition data check before PDF export:', {
      venuesCount: this.filteredVenues?.length || 0,
      currentVenue: this.currentVenue?.name || 'N/A',
      totalCompetitors: this.statistics?.totalCompetitors || 0,
      avgPrice: this.statistics?.avgCompetitorPrice || 0
    });
  }

  private showAccessDeniedMessage() {
    this.loading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Access Denied',
      detail: 'You do not have permission to view competition analysis'
    });
  }

  // Utility methods for template
  getDistanceDisplay(distance?: number): string {
    if (distance === undefined) return 'N/A';
    if (distance === 0) return '-';
    return `${distance.toFixed(1)} km`;
  }

  getPriceDisplay(price: number): string {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString()}`;
  }

  getRatingDisplay(rating: number): string {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
  }

  getPropertyTypeDisplay(propertyType: string): string {
    return propertyType || 'N/A';
  }

  getAssuredDisplay(isAssured: boolean): string {
    return isAssured ? 'Yes' : 'No';
  }

  // Format capacity with proper display
  getCapacityDisplay(capacity: number): string {
    if (!capacity) return 'N/A';
    return capacity.toLocaleString();
  }

  // Get status badge class for current venue
  getCurrentVenueBadgeClass(): string {
    return 'p-badge p-badge-success';
  }

  // Helper method for Math.abs in template
  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }
}
