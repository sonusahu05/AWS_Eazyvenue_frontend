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
  metaUrl?: string;
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
  eazyVenueRating?: number;
  googleRating?: number;
  isAssured: boolean;
  latitude?: number;
  longitude?: number;
  bookingPrice?: number;
  address: string;
  email: string;
  mobileNumber: string;
  propertyType: string;
  isCurrentVenue?: boolean;
  venueOwnerId?: string;
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
  user: any = {};

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
  selectedDistanceFilter: DistanceFilter = this.distanceFilters[0];
  
  // Loading and UI states
  loading = true;
  userLocation: any = null;
  
  // User access control
  userRole: string = '';
  isAdmin = false;
  isVenueOwner: boolean = false;
  isVendorOwner: boolean = false;
  currentUserEmail = '';
  venueOwnerVenueId: string = '';
  
  // Admin venue selection
  availableVenues: any[] = [];
  selectedVenueForAdmin: any = null;
  
  // Statistics
  statistics = {
    totalCompetitors: 0,
    avgCompetitorPrice: 0,
    minCompetitorPrice: 0,
    maxCompetitorPrice: 0,
    avgDistance: 0,
    priceAdvantage: 0
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
    if (!this.statistics) {
      this.statistics = this.getEmptyStatistics();
    }
    
    this.initializeColumns();
    this.checkUserAccess();

    console.log('Logged-in user role:', this.userRole);
    console.log('isVenueOwner:', this.isVenueOwner);
    console.log('isVendorOwner:', this.isVendorOwner);

    const storedUserData = this.tokenStorageService.getUser();
    this.user = storedUserData.userdata;
    
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
    console.log('Fetched user data:', userData);

    if (userData && userData.userdata) {
      this.userRole = userData.userdata.rolename || '';
      console.log('Assigned user role:', this.userRole);
      
      this.isAdmin = this.userRole === 'admin';
      this.isVenueOwner = this.userRole === 'venueowner';
      this.isVendorOwner = this.userRole === 'vendor-owner';
      this.currentUserEmail = userData.userdata.email || '';
      
      console.log('User access check:', {
        isAdmin: this.isAdmin,
        isVenueOwner: this.isVenueOwner,
        isVendorOwner: this.isVendorOwner,
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
      this.loadCurrentVenue();
    }
  }

  private loadCurrentVenue() {
    if (this.isVenueOwner) {
      this.loadVenueOwnerVenue();
    } else if (this.isVendorOwner) {
      this.loadVendorOwnerVenue();
    } else if (this.isAdmin) {
      this.loadAvailableVenuesForAdmin();
    } else {
      this.showAccessDeniedMessage();
    }
  }

  private loadVendorOwnerVenue() {
    const query = `?admin=true&vendorId=${encodeURIComponent(this.user.id)}&pageSize=1&pageNumber=1&filterByDisable=false`;

    const sub = this.venueService.getVenueListForFilter(query).subscribe({
      next: (response) => {
        if (response?.data?.items && response.data.items.length > 0) {
          const venueData = response.data.items[0];
          this.currentVenue = this.mapToCompetitionVenue(venueData, true);
          this.venueOwnerVenueId = this.currentVenue.id;
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
        console.error('Error loading vendor owner venue:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vendor owner venue details'
        });
      }
    });

    this.subscriptions.add(sub);
  }

  private loadAvailableVenuesForAdmin() {
    console.log('Loading venues for admin selection...');
    
    const query = `?admin=true&pageSize=500&pageNumber=1&filterByDisable=false&filterByStatus=true`;
    
    const sub = this.venueService.getVenueListForFilter(query).subscribe({
      next: (response) => {
        if (response?.data?.items && response.data.items.length > 0) {
          console.log(`Loaded ${response.data.items.length} venues from API before deduplication`);
          
          const uniqueVenues = this.removeDuplicateVenuesByName(response.data.items);
          console.log(`Unique venues after deduplication: ${uniqueVenues.length}`);
          
          this.availableVenues = uniqueVenues.map(venue => {
            const prices = this.extractPricesFromVenue(venue);
            return {
              label: `${venue.name} - ${venue.cityname}${venue.subarea ? ', ' + venue.subarea : ''}`,
              value: {
                ...venue,
                avgPrice: prices.avgPrice
              }
            };
          }).sort((a, b) => a.label.localeCompare(b.label));
          
          console.log(`Final available venues for admin selection: ${this.availableVenues.length}`);
          
          this.selectedVenueForAdmin = null;
          this.currentVenue = null;
          this.competitionVenues = [];
          this.filteredVenues = [];
          this.statistics = this.getEmptyStatistics();
          
          this.messageService.add({
            severity: 'info',
            summary: 'Admin Mode',
            detail: `${this.availableVenues.length} unique venues available. Please select a venue to analyze.`,
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Venues Found',
            detail: 'No active venues found in the system'
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading venues for admin:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load venue list'
        });
      }
    });
    
    this.subscriptions.add(sub);
  }

  onAdminVenueSelection() {
    if (this.selectedVenueForAdmin && this.selectedVenueForAdmin.value) {
      const venueData = this.selectedVenueForAdmin.value;
      this.currentVenue = this.mapToCompetitionVenue(venueData, true);
      
      console.log('Admin selected venue changed:', this.currentVenue);
      
      this.loading = true;
      
      this.competitionVenues = [];
      this.filteredVenues = [];
      this.statistics = this.getEmptyStatistics();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Venue Selected',
        detail: `Analyzing competition for ${venueData.name} in ${venueData.cityname}`,
        life: 3000
      });
      
      this.loadCompetitionVenues();
    } else {
      this.currentVenue = null;
      this.competitionVenues = [];
      this.filteredVenues = [];
      this.statistics = this.getEmptyStatistics();
      this.loading = false;
    }
  }

  private loadVenueOwnerVenue() {
    const query = `?admin=true&email=${encodeURIComponent(this.currentUserEmail)}&pageSize=1&pageNumber=1&filterByDisable=false`;

    const sub = this.venueService.getVenueListForFilter(query).subscribe({
      next: (response) => {
        if (response?.data?.items && response.data.items.length > 0) {
          const venueData = response.data.items[0];
          this.currentVenue = this.mapToCompetitionVenue(venueData, true);
          this.venueOwnerVenueId = this.currentVenue.id;
          
          console.log('Venue Owner Venue ID:', this.venueOwnerVenueId);
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

  private loadCompetitionVenues() {
    if (!this.currentVenue) {
      console.log('=== LOAD COMPETITION VENUES: NO CURRENT VENUE ===');
      return;
    }

    console.log('=== LOAD COMPETITION VENUES START ===');
    console.log('Current venue ID:', this.currentVenue.id);
    console.log('Distance filter:', this.selectedDistanceFilter.value);

    this.loading = true;

    const sub = this.venueService.getCompetitionAnalysis(
      this.currentVenue.id,
      {
        pageNumber: 1,
        pageSize: 1000
      }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('=== LOADING STATE SET TO FALSE ===');
        console.log('Loading is now:', this.loading);
        
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
          console.log('=== MAPPING VENUES ===');
          const mappedVenues = response.data.competitionVenues.map(venue => {
            const mapped = this.mapApiResponseToCompetitionVenue(venue);
            console.log(`Mapped venue ${venue.name}:`, mapped);
            return mapped;
          });
          
          console.log('=== REMOVING DUPLICATES ===');
          console.log(`Venues before deduplication: ${mappedVenues.length}`);
          this.competitionVenues = this.removeDuplicateVenues(mappedVenues);
          console.log(`Venues after deduplication: ${this.competitionVenues.length}`);
          
          // Filter venues based on user role
          if (this.isVenueOwner) {
            console.log('Filtering venues for venue owner...');
            this.competitionVenues = this.competitionVenues.filter(venue => venue.id === this.venueOwnerVenueId);
            console.log('Filtered venues for venue owner:', this.competitionVenues);
          } else if (this.isVendorOwner) {
            console.log('Filtering venues for vendor owner...');
            this.competitionVenues = this.competitionVenues.filter(venue => venue.venueOwnerId === this.venueOwnerVenueId);
          } else if (this.isAdmin) {
            console.log('Admin viewing all venues...');
            // No filtering for admin
          }

          console.log('Filtered venues:', this.competitionVenues);
          
          this.applyDistanceFilter();
          this.calculateStatistics();
          
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
      },
      error: (error) => {
        this.loading = false;
        console.log('=== ERROR: LOADING STATE SET TO FALSE ===');
        console.log('Loading is now:', this.loading);
        
        this.cdr.detectChanges();
        
        console.error('Error loading competition venues:', error);
        
        if (!this.statistics) {
          this.statistics = this.getEmptyStatistics();
        }
        
        if (error.status === 400 && error.error?.data) {
          console.log('=== 400 ERROR WITH DATA - APPLYING DEDUPLICATION ===');
          const rawVenues = error.error.data.competitionVenues || [];
          console.log(`Venues from error response before deduplication: ${rawVenues.length}`);
          
          const mappedVenues = rawVenues.map(venue => this.mapApiResponseToCompetitionVenue(venue));
          this.competitionVenues = this.removeDuplicateVenues(mappedVenues);
          
          console.log(`Venues after deduplication: ${this.competitionVenues.length}`);
          
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

  // Fixed method to extract prices from venue data
  private extractPricesFromVenue(venue: any): {vegPrice: number, nonVegPrice: number, avgPrice: number} {
    let vegPrice = 0;
    let nonVegPrice = 0;
    let avgPrice = 0;

    if (venue.foodMenuType) {
      // Extract veg price
      if (venue.foodMenuType.veg_food && Array.isArray(venue.foodMenuType.veg_food) && venue.foodMenuType.veg_food.length > 0) {
        const vegItem = venue.foodMenuType.veg_food.find(item => 
          item && !item.disabled && item.value && parseFloat(item.value) > 0
        );
        if (vegItem) {
          vegPrice = parseFloat(vegItem.value) || 0;
        }
      }

      // Extract non-veg price - FIXED LOGIC
      if (venue.foodMenuType.non_veg && Array.isArray(venue.foodMenuType.non_veg) && venue.foodMenuType.non_veg.length > 0) {
        // Find the first valid non-veg item that is not disabled and has a valid price
        const nonVegItem = venue.foodMenuType.non_veg.find(item => 
          item && !item.disabled && item.value && parseFloat(item.value) > 0
        );
        if (nonVegItem) {
          nonVegPrice = parseFloat(nonVegItem.value) || 0;
        }
      }
      
      // Calculate average price
      if (vegPrice > 0 && nonVegPrice > 0) {
        avgPrice = (vegPrice + nonVegPrice) / 2;
      } else if (vegPrice > 0) {
        avgPrice = vegPrice;
      } else if (nonVegPrice > 0) {
        avgPrice = nonVegPrice;
      }
    }

    return { vegPrice, nonVegPrice, avgPrice };
  }

  private mapToCompetitionVenue(venue: any, isCurrentVenue: boolean = false): CompetitionVenue {
    // Use the fixed price extraction method
    const prices = this.extractPricesFromVenue(venue);
    
    let amenitiesList: string[] = [];
    if (venue.amenities) {
      if (typeof venue.amenities === 'string') {
        amenitiesList = venue.amenities.split(',').map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(venue.amenities)) {
        amenitiesList = venue.amenities;
      }
    }

    const latitude = venue.latitude ? parseFloat(venue.latitude) : 
                    (venue.lat ? parseFloat(venue.lat) : undefined);
    const longitude = venue.longitude ? parseFloat(venue.longitude) : 
                     (venue.lng ? parseFloat(venue.lng) : undefined);

    return {
      id: venue.id || venue._id,
      name: venue.name || 'Unknown Venue',
      metaUrl: venue.metaUrl || venue.metaurl || venue.slug,
      cityname: venue.cityname || '',
      subarea: venue.subarea || venue.subareadata?.[0]?.name || '',
      capacity: venue.capacity || 0,
      minPrice: venue.minPrice || Math.min(prices.vegPrice, prices.nonVegPrice) || 0,
      maxPrice: venue.maxPrice || Math.max(prices.vegPrice, prices.nonVegPrice) || 0,
      avgPrice: prices.avgPrice,
      vegPrice: prices.vegPrice,
      nonVegPrice: prices.nonVegPrice,
      theatreCapacity: venue.theaterSitting || venue.theatreCapacity || 0,
      floatingCapacity: venue.floatingCapacity || venue.capacity || 0,
      amenities: amenitiesList,
      rating: venue.eazyVenueRating || venue.googleRating || venue.rating || 0,
      eazyVenueRating: venue.eazyVenueRating || venue.rating || 0,
      googleRating: venue.googleRating || 0,
      isAssured: venue.assured || false,
      latitude: latitude,
      longitude: longitude,
      bookingPrice: venue.bookingPrice || 0,
      address: venue.address || '',
      email: venue.email || '',
      mobileNumber: venue.mobileNumber || '',
      propertyType: venue.propertyType?.name || venue.propertytype?.name || '',
      isCurrentVenue: isCurrentVenue
    };
  }

  private mapApiResponseToCompetitionVenue(venue: any): CompetitionVenue {
    console.log('Mapping venue:', venue.name);
    console.log('Raw coordinates from API:', { 
      latitude: venue.latitude, 
      longitude: venue.longitude, 
      lat: venue.lat, 
      lng: venue.lng 
    });
    
    const latitude = venue.latitude ? parseFloat(venue.latitude) : (venue.lat ? parseFloat(venue.lat) : undefined);
    const longitude = venue.longitude ? parseFloat(venue.longitude) : (venue.lng ? parseFloat(venue.lng) : undefined);
    
    console.log('Parsed coordinates:', { latitude, longitude });
    
    return {
      id: venue.id || venue._id,
      name: venue.name || 'Unknown Venue',
      metaUrl: venue.metaUrl || venue.metaurl || venue.slug,
      cityname: venue.cityname || '',
      subarea: venue.subarea || '',
      capacity: venue.capacity || 0,
      distance: undefined,
      minPrice: venue.minPrice || 0,
      maxPrice: venue.maxPrice || 0,
      avgPrice: venue.avgPrice || 0,
      vegPrice: venue.vegPrice || 0,
      nonVegPrice: venue.nonVegPrice || 0,
      theatreCapacity: venue.theaterSitting || 0,
      floatingCapacity: venue.capacity || 0,
      amenities: venue.amenities || [],
      rating: venue.rating || venue.eazyVenueRating || venue.googleRating || 0,
      eazyVenueRating: venue.eazyVenueRating || venue.rating || 0,
      googleRating: venue.googleRating || 0,
      isAssured: venue.assured || false,
      latitude: latitude,
      longitude: longitude,
      bookingPrice: venue.bookingPrice || 0,
      address: venue.address || '',
      email: venue.email || '',
      mobileNumber: venue.mobileNumber || '',
      propertyType: venue.propertyType || '',
      isCurrentVenue: venue.isCurrentVenue || false
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
    console.log('Reapplying distance filter without reloading data...');
    
    // Don't reload from backend, just reapply the frontend filter
    this.applyDistanceFilter();
    this.calculateStatistics();
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private applyDistanceFilter() {
    console.log('=== APPLY DISTANCE FILTER START ===');
    console.log(`Current venue:`, this.currentVenue);
    console.log(`Competition venues:`, this.competitionVenues?.length || 0);
    console.log(`Selected distance filter:`, this.selectedDistanceFilter.value);

    if (!this.competitionVenues || this.competitionVenues.length === 0) {
      this.filteredVenues = [];
      console.log('No competition venues to filter');
      return;
    }

    // Get current venue coordinates - use current venue if available
    let baseVenueLatitude: number | undefined;
    let baseVenueLongitude: number | undefined;

    // Debug: check current venue coordinates in detail
    console.log('=== CURRENT VENUE COORDINATES DEBUG ===');
    console.log('Current venue object:', this.currentVenue);
    console.log('Current venue latitude:', this.currentVenue?.latitude);
    console.log('Current venue longitude:', this.currentVenue?.longitude);
    console.log('Latitude type:', typeof this.currentVenue?.latitude);
    console.log('Longitude type:', typeof this.currentVenue?.longitude);

    if (this.currentVenue && this.currentVenue.latitude && this.currentVenue.longitude) {
      baseVenueLatitude = this.currentVenue.latitude;
      baseVenueLongitude = this.currentVenue.longitude;
      console.log(`Using current venue coordinates: lat=${baseVenueLatitude}, lng=${baseVenueLongitude}`);
    } else {
      console.log('Current venue coordinates not available, cannot filter by distance');
      console.log('Current venue lat check:', !!this.currentVenue?.latitude);
      console.log('Current venue lng check:', !!this.currentVenue?.longitude);
      
      // Fallback: show all venues but mark distances as N/A
      this.filteredVenues = [...this.competitionVenues];
      this.sortVenuesWithCurrentFirst();
      return;
    }

    // Calculate distances for all venues using geolocation service
    const venuesWithCalculatedDistance = this.competitionVenues.map(venue => {
      const updatedVenue = { ...venue };

      if (venue.isCurrentVenue) {
        // Current venue gets distance 0
        updatedVenue.distance = 0;
        console.log(`Current venue ${venue.name}: distance set to 0`);
      } else if (venue.latitude && venue.longitude) {
        // Calculate distance using geolocation service
        const distance = this.geolocationService.calculateDistance(
          baseVenueLatitude!,
          baseVenueLongitude!,
          venue.latitude,
          venue.longitude
        );
        updatedVenue.distance = distance;
        console.log(`Competitor venue ${venue.name}: calculated distance = ${distance} km (from ${baseVenueLatitude},${baseVenueLongitude} to ${venue.latitude},${venue.longitude})`);
      } else {
        // No coordinates available
        updatedVenue.distance = undefined;
        console.log(`Venue ${venue.name}: no coordinates available (lat=${venue.latitude}, lng=${venue.longitude})`);
      }

      return updatedVenue;
    });

    // Filter by selected distance
    this.filteredVenues = venuesWithCalculatedDistance.filter(venue => {
      // Always include current venue
      if (venue.isCurrentVenue) {
        return true;
      }

      // Include venues within the selected distance
      return venue.distance !== undefined && venue.distance <= this.selectedDistanceFilter.value;
    });

    // Sort with current venue first, then by distance ascending
    this.sortVenuesWithCurrentFirst();

    console.log(`=== APPLY DISTANCE FILTER COMPLETE ===`);
    console.log(`Total venues after distance calculation: ${venuesWithCalculatedDistance.length}`);
    console.log(`Filtered venues within ${this.selectedDistanceFilter.value}km: ${this.filteredVenues.length}`);
    console.log(`Venues with distances:`, this.filteredVenues.slice(0, 5).map(v => ({ 
      name: v.name, 
      distance: v.distance, 
      isCurrentVenue: v.isCurrentVenue 
    })));
  }

  private sortVenuesWithCurrentFirst() {
    this.filteredVenues.sort((a, b) => {
      // Current venue always comes first
      if (a.isCurrentVenue && !b.isCurrentVenue) return -1;
      if (!a.isCurrentVenue && b.isCurrentVenue) return 1;
      
      // If neither or both are current venue, sort by distance
      const distA = a.distance !== undefined ? a.distance : Infinity;
      const distB = b.distance !== undefined ? b.distance : Infinity;
      return distA - distB;
    });
  }

  private calculateStatistics() {
    console.log('=== CALCULATE STATISTICS START ===');
    console.log('Filtered venues:', this.filteredVenues?.length || 0);
    
    // Initialize empty statistics
    this.statistics = this.getEmptyStatistics();
    
    if (!this.filteredVenues || this.filteredVenues.length === 0) {
      console.log('No filtered venues for statistics calculation');
      return;
    }

    // Get only competitor venues (exclude current venue)
    const competitorVenues = this.filteredVenues.filter(venue => !venue.isCurrentVenue);
    console.log('Competitor venues for stats:', competitorVenues.length);

    if (competitorVenues.length === 0) {
      console.log('No competitor venues found for statistics');
      this.statistics.totalCompetitors = 0;
      return;
    }

    // Calculate statistics from filtered competitor venues
    this.statistics.totalCompetitors = competitorVenues.length;

    // Calculate price statistics (excluding venues with 0 or undefined avgPrice)
    const venuesWithPrice = competitorVenues.filter(venue => venue.avgPrice > 0);
    
    if (venuesWithPrice.length > 0) {
      const prices = venuesWithPrice.map(venue => venue.avgPrice);
      this.statistics.avgCompetitorPrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
      this.statistics.minCompetitorPrice = Math.min(...prices);
      this.statistics.maxCompetitorPrice = Math.max(...prices);
    }

    // Calculate average distance (excluding venues with undefined distance)
    const venuesWithDistance = competitorVenues.filter(venue => venue.distance !== undefined);
    
    if (venuesWithDistance.length > 0) {
      const distances = venuesWithDistance.map(venue => venue.distance!);
      this.statistics.avgDistance = Math.round((distances.reduce((sum, distance) => sum + distance, 0) / distances.length) * 10) / 10;
    }

    // Calculate price advantage (if current venue has a price)
    if (this.currentVenue && this.currentVenue.avgPrice > 0 && this.statistics.avgCompetitorPrice > 0) {
      this.statistics.priceAdvantage = Math.round(this.statistics.avgCompetitorPrice - this.currentVenue.avgPrice);
    }

    console.log('=== CALCULATED STATISTICS ===');
    console.log('Total competitors:', this.statistics.totalCompetitors);
    console.log('Avg competitor price:', this.statistics.avgCompetitorPrice);
    console.log('Min competitor price:', this.statistics.minCompetitorPrice);
    console.log('Max competitor price:', this.statistics.maxCompetitorPrice);
    console.log('Avg distance:', this.statistics.avgDistance);
    console.log('Price advantage:', this.statistics.priceAdvantage);
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
    if (distance === undefined || distance === null) return 'N/A';
    if (distance === 0) return '0.0 km';
    if (distance < 0.1) return '< 0.1 km';
    if (distance < 1) return `${(distance * 1000).toFixed(0)} m`;
    return `${distance.toFixed(1)} km`;
  }

  getPriceDisplay(price: number): string {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString()}`;
  }

  getRatingDisplay(rating: number): string {
    if (!rating || rating === 0) return 'N/A';
    return rating.toFixed(1);
  }

  // Check if venue has any ratings
  hasRatings(venue: any): boolean {
    return (venue.eazyVenueRating && venue.eazyVenueRating > 0) || 
           (venue.googleRating && venue.googleRating > 0);
  }

  // Remove duplicate venues based on venue names
  private removeDuplicateVenues(venues: CompetitionVenue[]): CompetitionVenue[] {
    if (!venues || venues.length === 0) {
      return [];
    }

    console.log('=== DEDUPLICATION START ===');
    const uniqueVenues: CompetitionVenue[] = [];
    const seenVenueNames = new Set<string>();
    const duplicatesFound: string[] = [];

    venues.forEach((venue, index) => {
      // Normalize venue name for comparison (trim, lowercase)
      const normalizedName = venue.name.trim().toLowerCase();
      
      if (!seenVenueNames.has(normalizedName)) {
        // First occurrence of this venue name
        seenVenueNames.add(normalizedName);
        uniqueVenues.push(venue);
        console.log(`✓ Keeping venue: "${venue.name}" (${venue.cityname})`);
      } else {
        // Duplicate found
        duplicatesFound.push(venue.name);
        console.log(`✗ Duplicate removed: "${venue.name}" (${venue.cityname}) - already exists`);
      }
    });

    console.log('=== DEDUPLICATION COMPLETE ===');
    console.log(`Original venues: ${venues.length}`);
    console.log(`Unique venues: ${uniqueVenues.length}`);
    console.log(`Duplicates removed: ${duplicatesFound.length}`);
    
    if (duplicatesFound.length > 0) {
      console.log('Duplicate venue names found:', duplicatesFound);
    }

    return uniqueVenues;
  }

  // Remove duplicate venues based on venue names (for raw venue data from API)
  private removeDuplicateVenuesByName(venues: any[]): any[] {
    if (!venues || venues.length === 0) {
      return [];
    }

    console.log('=== ADMIN VENUE DEDUPLICATION START ===');
    const uniqueVenues: any[] = [];
    const seenVenueNames = new Set<string>();
    const duplicatesFound: string[] = [];

    venues.forEach((venue, index) => {
      // Normalize venue name for comparison (trim, lowercase)
      const normalizedName = venue.name ? venue.name.trim().toLowerCase() : '';
      
      if (normalizedName && !seenVenueNames.has(normalizedName)) {
        // First occurrence of this venue name
        seenVenueNames.add(normalizedName);
        uniqueVenues.push(venue);
        console.log(`✓ Keeping venue: "${venue.name}" (${venue.cityname || 'N/A'})`);
      } else if (normalizedName) {
        // Duplicate found
        duplicatesFound.push(venue.name);
        console.log(`✗ Duplicate removed: "${venue.name}" (${venue.cityname || 'N/A'}) - already exists`);
      } else {
        // Venue with no name - skip
        console.log(`✗ Skipping venue with no name`);
      }
    });

    console.log('=== ADMIN VENUE DEDUPLICATION COMPLETE ===');
    console.log(`Original venues: ${venues.length}`);
    console.log(`Unique venues: ${uniqueVenues.length}`);
    console.log(`Duplicates removed: ${duplicatesFound.length}`);
    
    if (duplicatesFound.length > 0) {
      console.log('Duplicate venue names found:', duplicatesFound);
    }

    return uniqueVenues;
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

  // Get the number of visible columns for table formatting
  getColumnCount(): number {
    return 9; // Fixed columns: name, distance, location, capacity, avg price, veg price, non-veg price, ratings, assured
  }
}