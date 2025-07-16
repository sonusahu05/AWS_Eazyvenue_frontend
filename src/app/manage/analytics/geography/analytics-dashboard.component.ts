import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Chart from 'chart.js/auto';

// Dynamic imports for SSR compatibility
let jsPDF: any;
let html2canvas: any;

@Component({
    selector: 'app-analytics-dashboard',
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();
    private isBrowser: boolean;
    
    // Dashboard Data
    overviewStats: any = {};
    popularVenues: any[] = [];
    deviceAnalytics: any[] = [];
    timelineAnalytics: any[] = [];
    topSubareas: any[] = [];
    selectedVenueUserClicks: any[] = [];
    loading = true;
    
    // User access control
    userRole: string = '';
    isAdmin = false;
    isVenueOwner = false;
    currentVenueName = '';
    
    // Charts Data
    deviceChartData: any;
    deviceChartOptions: any;
    venueClicksChartData: any;
    venueClicksChartOptions: any;
    timelineChartData: any;
    timelineChartOptions: any;
    subareaChartData: any;
    subareaChartOptions: any;
    
    // Filters
    dateRange: Date[] = [];
    selectedVenue: any;
    venues: any[] = [];
    
    // Selected venue details
    selectedVenueInsights: any = null;
    selectedVenueClicks: any[] = [];
    selectedVenueTimelineData: any = { labels: [], datasets: [] };
    showVenueDetails = false;
    showUserClickDetails = false;
    
    constructor(
        private analyticsService: AnalyticsService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        // Initialize dateRange immediately in constructor to prevent undefined errors
        this.setDefaultDateRange();
    }
    
    ngOnInit() {
        this.setDefaultDateRange(); // Set default dates FIRST
        this.checkUserAccess();
        
        // Only initialize charts and load data in browser
        if (this.isBrowser) {
            this.initializeChartOptions();
            this.initializeChartData();
            this.loadDashboardData();
        }
    }
    
    checkUserAccess() {
        const roleCheck = this.analyticsService.checkUserRole();
        const venueOwnerCheck = this.analyticsService.checkVenueOwnerAccess();
        
        this.isAdmin = roleCheck.hasAdminAccess;
        this.userRole = roleCheck.userRole;
        this.isVenueOwner = venueOwnerCheck.isVenueOwner;
        this.currentVenueName = venueOwnerCheck.venueName;
        
        // Print full user data structure for debugging
        const fullUserData = this.analyticsService.getFullUserData();
        console.log('🔍 FULL USER DATA STRUCTURE:', JSON.stringify(fullUserData, null, 2));
        
        console.log('User access check:', {
            isAdmin: this.isAdmin,
            isVenueOwner: this.isVenueOwner,
            userRole: this.userRole,
            venueName: this.currentVenueName,
            fullUserData: fullUserData
        });
    }
    
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
    
    setDefaultDateRange() {
        try {
            // Check if we want to show ALL data or apply default filtering
            console.log('🗓️ Setting up date range...');
            
            // For calendar display, we need valid dates even if we don't want filtering
            // Option 1: Set to null/undefined for no filtering but keep calendar functional
            const showAllData = true; // Set to false to apply last 30 days filter
            
            if (showAllData) {
                console.log('📊 NO DATE FILTERING - Will show all data from database');
                // Set to null instead of empty array to allow calendar to work
                this.dateRange = null as any; // This will allow calendar to show but won't filter data
                return;
            }
            
            // Option 2: Default last 30 days filtering
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
            
            // Ensure we have valid Date objects
            if (isNaN(today.getTime()) || isNaN(lastMonth.getTime())) {
                console.error('Invalid dates created, using fallback');
                const fallbackToday = new Date(Date.now());
                const fallbackLastMonth = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
                this.dateRange = [fallbackLastMonth, fallbackToday];
            } else {
                this.dateRange = [lastMonth, today];
            }
            
            console.log('Default date range set:', this.dateRange);
            
            // Additional validation to ensure both dates are valid
            if (!this.dateRange || this.dateRange.length !== 2 || 
                !this.dateRange[0] || !this.dateRange[1] ||
                isNaN(this.dateRange[0].getTime()) || isNaN(this.dateRange[1].getTime())) {
                console.error('Date range validation failed, creating safe fallback');
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                this.dateRange = [thirtyDaysAgo, now];
            }
            
        } catch (error) {
            console.error('Error setting default date range:', error);
            // Ultimate fallback - set to null for calendar functionality
            this.dateRange = null as any;
        }
    }
    
    loadDashboardData() {
        this.loading = true;
        const params = this.getDateParams();
        console.log('📊 Loading dashboard data with params:', params);
        
        // Call debugging method to help identify issues
        this.debugDataDiscrepancy();
        
        // Track completed requests
        let completedRequests = 0;
        const totalRequests = 5; // overview, venues, devices, timeline, subareas
        
        const checkAllComplete = () => {
            completedRequests++;
            if (completedRequests >= totalRequests) {
                this.loading = false;
                console.log('✅ All dashboard data loaded successfully');
                // Call debugging again after all data is loaded
                setTimeout(() => this.debugDataDiscrepancy(), 1000);
            }
        };
        
        // Load overview stats
        this.subscriptions.add(
            this.analyticsService.getOverviewStats(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.overviewStats = response.data[0] || {};
                        console.log('📊 Overview stats loaded:', this.overviewStats);
                        console.log('🔍 Click count analysis:', {
                            totalClicks: this.overviewStats.totalClicks,
                            mobileClicks: this.overviewStats.mobileClicks,
                            desktopClicks: this.overviewStats.desktopClicks,
                            dateRangeApplied: params.from && params.to ? `${params.from} to ${params.to}` : 'No date filter',
                            venueFilter: params.venueFilter || 'All venues',
                            rawResponse: response.data
                        });
                        
                        // Update device chart as fallback if device analytics is not available
                        if (!this.deviceAnalytics || this.deviceAnalytics.length === 0) {
                            this.updateDeviceChart();
                        }
                    }
                    checkAllComplete();
                },
                error: (error) => {
                    console.error('Error loading overview stats:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load overview statistics'
                    });
                    checkAllComplete();
                }
            })
        );
        
        // Load popular venues
        this.subscriptions.add(
            this.analyticsService.getPopularVenues(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.popularVenues = response.data || [];
                        console.log('🏢 Popular venues received:', this.popularVenues);
                        console.log('🎯 Quality score analysis for venues:', this.popularVenues.map(v => ({
                            venueId: v.venueId,
                            venueName: v.venueName,
                            clicks: v.clicks,
                            averageQualityScore: v.averageQualityScore,
                            qualityScore: v.qualityScore,
                            avgQualityScore: v.avgQualityScore,
                            hasScore: this.hasQualityScore ? this.hasQualityScore(v) : 'method not available yet'
                        })));
                        this.updateVenueClicksChart();
                    }
                    checkAllComplete();
                },
                error: (error) => {
                    console.error('Error loading popular venues:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load popular venues'
                    });
                    checkAllComplete();
                }
            })
        );
        
        // Load device analytics
        this.subscriptions.add(
            this.analyticsService.getDeviceAnalytics(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.deviceAnalytics = response.data || [];
                        console.log('Device analytics loaded:', this.deviceAnalytics);
                        // Update device chart after loading device analytics data
                        this.updateDeviceChart();
                    }
                    checkAllComplete();
                },
                error: (error) => {
                    console.error('Error loading device analytics:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load device analytics'
                    });
                    checkAllComplete();
                }
            })
        );
        
        // Load timeline analytics
        this.subscriptions.add(
            this.analyticsService.getTimelineAnalytics(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.timelineAnalytics = response.data || [];
                        console.log('Timeline analytics loaded:', this.timelineAnalytics);
                        this.updateTimelineChart();
                    }
                    checkAllComplete();
                },
                error: (error) => {
                    console.error('Error loading timeline analytics:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load timeline analytics'
                    });
                    checkAllComplete();
                }
            })
        );
        
        // Load top subareas
        this.subscriptions.add(
            this.analyticsService.getTopSubareas(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.topSubareas = response.data || [];
                        console.log('Top subareas loaded:', this.topSubareas);
                        this.updateSubareaChart();
                    }
                    checkAllComplete();
                },
                error: (error) => {
                    console.error('Error loading top subareas:', error);
                    this.messageService.add({
                        severity: 'error',  
                        summary: 'Error',
                        detail: 'Failed to load top subareas'
                    });
                    checkAllComplete();
                }
            })
        );
    }
    
    getDateParams() {
        const params: any = {};
        
        console.log('🗓️ Creating date params. Current dateRange:', this.dateRange);
        
        // Only add date range if both dates are selected and valid
        // If dateRange is empty array, don't add any date filtering
        if (this.dateRange && Array.isArray(this.dateRange) && 
            this.dateRange.length === 2 && 
            this.dateRange[0] instanceof Date && this.dateRange[1] instanceof Date &&
            !isNaN(this.dateRange[0].getTime()) && !isNaN(this.dateRange[1].getTime())) {
            
            const startDate = new Date(this.dateRange[0]);
            const endDate = new Date(this.dateRange[1]);
            
            // Set start date to beginning of day (00:00:00)
            startDate.setHours(0, 0, 0, 0);
            
            // Check if it's a single day selection (same date)
            const isSingleDay = startDate.toDateString() === endDate.toDateString();
            
            if (isSingleDay) {
                // For single day, set end time to end of that day (23:59:59)
                endDate.setHours(23, 59, 59, 999);
                console.log('📅 Single day selection detected - adjusting time range for full day coverage');
            } else {
                // For date range, set end date to end of the selected end day
                endDate.setHours(23, 59, 59, 999);
            }
            
            params.from = startDate.toISOString();
            params.to = endDate.toISOString();
            
            console.log('✅ Valid date params created (FILTERING ACTIVE):', {
                from: params.from,
                to: params.to,
                isSingleDay: isSingleDay,
                daysDifference: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
                originalStartDate: this.dateRange[0].toISOString(),
                originalEndDate: this.dateRange[1].toISOString()
            });
            console.log('⚠️ DATE FILTERING IS ACTIVE - This may explain lower click counts!');
        } else {
            console.log('ℹ️ No date filtering - should show ALL data from database');
            console.log('💡 Calendar is available for user to select dates when needed');
        }
        
        // Add venue filter for non-admin users
        if (!this.isAdmin && this.isVenueOwner && this.currentVenueName) {
            params.venueFilter = this.currentVenueName;
            console.log('🏢 Adding venue filter for non-admin user:', this.currentVenueName);
        }
        
        console.log('📋 Final params with filters:', params);
        
        return params;
    }
    
    debugDataDiscrepancy() {
        console.log('🔍 DATA DISCREPANCY ANALYSIS:');
        console.log('================================');
        console.log('Current Date Range:', this.dateRange);
        console.log('Is Date Filtering Active:', this.dateRange && this.dateRange.length === 2);
        console.log('Overview Stats:', this.overviewStats);
        console.log('Popular Venues Count:', this.popularVenues?.length);
        console.log('Device Analytics:', this.deviceAnalytics);
        console.log('Timeline Analytics Count:', this.timelineAnalytics?.length);
        console.log('Top Subareas Count:', this.topSubareas?.length);
        console.log('================================');
        
        // Check if default date range is being applied
        if (this.dateRange && this.dateRange.length === 2) {
            const daysDiff = Math.ceil((this.dateRange[1].getTime() - this.dateRange[0].getTime()) / (1000 * 60 * 60 * 24));
            console.log(`📅 Date range spans ${daysDiff} days`);
            console.log('📊 This might explain why you see 297 instead of 400 clicks!');
            console.log('💡 Try clearing the date filter to see all data');
        }
    }
    
    clearDateRangeAndShowAll() {
        console.log('🔄 Clearing date range to show ALL data from database');
        
        // Clear date range completely (set to null to keep calendar functional)
        this.dateRange = null as any;
        
        console.log('📊 Reloading data without any date filtering...');
        this.loadDashboardData();
        
        this.messageService.add({
            severity: 'info',
            summary: 'Date Filter Removed',
            detail: 'Now showing ALL data from database (should show ~400 clicks if that\'s your total)'
        });
    }
    
    onDateRangeChange() {
        console.log('Date range change triggered:', this.dateRange);
        
        // Check if dateRange is properly set
        if (!this.dateRange) {
            console.log('Date range is null/undefined');
            return;
        }
        
        // If it's a single date (first selection), wait for the second date
        if (this.dateRange.length === 1) {
            console.log('Only first date selected, waiting for second date');
            return;
        }
        
        // Only reload data if both dates in the range are selected and valid
        if (this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            console.log('Both dates selected, reloading data:', {
                from: this.dateRange[0],
                to: this.dateRange[1]
            });
            this.loadDashboardData();
        } else {
            console.log('Date range not complete or invalid:', this.dateRange);
        }
    }
    
    onCalendarSelect(event: any) {
        console.log('Calendar select event:', event);
        console.log('Current dateRange after select:', this.dateRange);
        
        // Check if we have a complete date range
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            console.log('Complete date range selected:', {
                from: this.dateRange[0],
                to: this.dateRange[1]
            });
            
            // Reload dashboard data
            this.loadDashboardData();
            
            // If venue details are currently open, refresh them with new date range
            if (this.showVenueDetails && this.selectedVenue) {
                console.log('Refreshing venue details for date range change');
                this.loadVenueInsights(this.selectedVenue.venueId);
            }
            
            // If user click details are currently open, refresh them with new date range
            if (this.showUserClickDetails && this.selectedVenue) {
                console.log('Refreshing user click details for date range change');
                this.loadUserClickDetails(this.selectedVenue.venueId);
            }
        } else {
            console.log('Incomplete date range, waiting for second date selection');
        }
    }
    
    viewVenueDetails(venue: any) {
        this.selectedVenue = venue;
        this.showVenueDetails = true;
        this.loadVenueInsights(venue.venueId);
    }
    
    viewUserClickDetails(venue: any) {
        this.selectedVenue = venue;
        this.showUserClickDetails = true;
        this.loadUserClickDetails(venue.venueId);
    }
    
    loadVenueInsights(venueId: string) {
        console.log('=== loadVenueInsights called ===');
        console.log('venueId:', venueId);
        
        const dateParams = this.getDateParams();
        console.log('Date params for venue insights:', dateParams);
        
        // Load venue insights with date filtering
        this.subscriptions.add(
            this.analyticsService.getVenueInsights(venueId, dateParams).subscribe({
                next: (response) => {
                    console.log('Venue insights API response:', response);
                    if (response.success) {
                        this.selectedVenueInsights = response.data;
                        console.log('Venue insights set to:', this.selectedVenueInsights);
                    } else {
                        console.warn('API response not successful:', response);
                        this.selectedVenueInsights = null;
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'No Insights',
                            detail: response.message || 'No venue insights available for this venue'
                        });
                    }
                },
                error: (error) => {
                    console.error('Error loading venue insights:', error);
                    this.selectedVenueInsights = null;
                    
                    if (error.status === 404) {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'No Data',
                            detail: 'No insights found for this venue. Insights will be generated after more user interactions.'
                        });
                    } else if (error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Access Denied',
                            detail: 'You do not have permission to view venue insights'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to load venue insights'
                        });
                    }
                }
            })
        );
        
        // Load venue clicks with date filtering
        this.subscriptions.add(
            this.analyticsService.getVenueClicks(venueId, dateParams).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.selectedVenueClicks = response.data || [];
                        console.log('Venue clicks loaded with date filter:', this.selectedVenueClicks.length);
                    }
                },
                error: (error) => {
                    console.error('Error loading venue clicks:', error);
                }
            })
        );
        
        // Load venue-specific timeline analytics with date filtering
        this.subscriptions.add(
            this.analyticsService.getVenueTimelineAnalytics(venueId, dateParams).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.selectedVenueTimelineData = response.data || [];
                        console.log('Venue timeline data loaded with date filter:', this.selectedVenueTimelineData);
                        this.updateSelectedVenueTimelineChart(response.data || []);
                    }
                },
                error: (error) => {
                    console.error('Error loading venue timeline analytics:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load venue timeline analytics'
                    });
                }
            })
        );
    }
    
    loadUserClickDetails(venueId: string) {
        console.log('loadUserClickDetails called with venueId:', venueId);
        
        const dateParams = this.getDateParams();
        console.log('Date params for user click details:', dateParams);
        
        this.subscriptions.add(
            this.analyticsService.getUserClickDetails(venueId, dateParams).subscribe({
                next: (response) => {
                    console.log('getUserClickDetails API response:', response);
                    if (response.success) {
                        this.selectedVenueUserClicks = response.data || [];
                        console.log('User click details loaded with date filter, count:', this.selectedVenueUserClicks.length);
                        console.log('Sample data:', this.selectedVenueUserClicks.slice(0, 2));
                    } else {
                        console.error('API response not successful:', response);
                        this.selectedVenueUserClicks = [];
                    }
                },
                error: (error) => {
                    console.error('Error loading user click details:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load user click details'
                    });
                    this.selectedVenueUserClicks = [];
                }
            })
        );
    }
    
    closeVenueDetails() {
        this.showVenueDetails = false;
        this.selectedVenue = null;
        this.selectedVenueInsights = null;
        this.selectedVenueClicks = [];
        this.selectedVenueTimelineData = { labels: [], datasets: [] };
    }
    
    closeUserClickDetails() {
        this.showUserClickDetails = false;
        this.selectedVenue = null;
        this.selectedVenueUserClicks = [];
    }
    
    refreshInsights(venueId: string) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to refresh insights for this venue?',
            header: 'Confirm Refresh',
            icon: 'pi pi-refresh',
            accept: () => {
                this.subscriptions.add(
                    this.analyticsService.updateVenueInsights(venueId).subscribe({
                        next: (response) => {
                            if (response.success) {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: 'Venue insights refreshed successfully'
                                });
                                this.loadVenueInsights(venueId);
                            }
                        },
                        error: (error) => {
                            console.error('Error refreshing insights:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to refresh venue insights'
                            });
                        }
                    })
                );
            }
        });
    }
    
    initializeChartOptions() {
        // Device chart options
        this.deviceChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
        
        // Venue clicks chart options
        this.venueClicksChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        
        // Timeline chart options
        this.timelineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };
        
        // Subarea chart options
        this.subareaChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        };
    }
    
    initializeChartData() {
        // Initialize all chart data objects to prevent undefined errors
        this.deviceChartData = {
            labels: [],
            datasets: []
        };
        
        this.venueClicksChartData = {
            labels: [],
            datasets: []
        };
        
        this.timelineChartData = {
            labels: [],
            datasets: []
        };
        
        this.subareaChartData = {
            labels: [],
            datasets: []
        };
    }
    
    updateDeviceChart() {
        // Only update charts in browser
        if (!this.isBrowser) {
            return;
        }

        console.log('� Device Chart Update - Available data:', {
            deviceAnalytics: this.deviceAnalytics,
            deviceAnalyticsLength: this.deviceAnalytics?.length,
            overviewStats: this.overviewStats,
            hasOverviewMobile: this.overviewStats?.mobileClicks !== undefined,
            hasOverviewDesktop: this.overviewStats?.desktopClicks !== undefined
        });

        // Initialize default values
        let mobileClicks = 0;
        let desktopClicks = 0;

        // Try to use device analytics data first
        if (this.deviceAnalytics && this.deviceAnalytics.length > 0) {
            console.log('✅ Using device analytics data:', this.deviceAnalytics);
            
            // Handle different possible data structures
            this.deviceAnalytics.forEach(item => {
                console.log('📊 Processing device item:', item);
                
                // Try different possible property names for device type
                const deviceType = item.device || item.deviceType || item._id || item.platform;
                const clicks = item.clicks || item.count || item.total || 0;
                
                if (deviceType) {
                    const deviceLower = deviceType.toString().toLowerCase();
                    if (deviceLower.includes('mobile') || deviceLower.includes('phone') || deviceLower.includes('tablet')) {
                        mobileClicks += clicks;
                    } else if (deviceLower.includes('desktop') || deviceLower.includes('computer') || deviceLower.includes('pc')) {
                        desktopClicks += clicks;
                    }
                }
            });
            
            console.log('📱 Device analytics processed:', { mobileClicks, desktopClicks });
        } 
        
        // Fallback to overview stats if device analytics didn't provide data
        if ((mobileClicks === 0 && desktopClicks === 0) && this.overviewStats) {
            console.log('📊 Using overview stats fallback:', {
                mobileClicks: this.overviewStats.mobileClicks,
                desktopClicks: this.overviewStats.desktopClicks,
                mobilePercentage: this.overviewStats.mobilePercentage,
                totalClicks: this.overviewStats.totalClicks
            });
            
            // Use direct mobile/desktop clicks if available
            if (this.overviewStats.mobileClicks !== undefined && this.overviewStats.desktopClicks !== undefined) {
                mobileClicks = this.overviewStats.mobileClicks || 0;
                desktopClicks = this.overviewStats.desktopClicks || 0;
            } 
            // Or calculate from percentage and total
            else if (this.overviewStats.mobilePercentage !== undefined && this.overviewStats.totalClicks) {
                const totalClicks = this.overviewStats.totalClicks || 0;
                const mobilePercentage = this.overviewStats.mobilePercentage || 0;
                mobileClicks = Math.round((totalClicks * mobilePercentage) / 100);
                desktopClicks = totalClicks - mobileClicks;
            }
        }

        // Update chart with calculated values
        console.log('📈 Final device chart data:', { mobileClicks, desktopClicks });
        
        this.deviceChartData = {
            labels: ['Mobile', 'Desktop'],
            datasets: [{
                data: [mobileClicks, desktopClicks],
                backgroundColor: [
                    '#42A5F5',
                    '#FFA726'
                ],
                borderColor: [
                    '#1E88E5',
                    '#FF9800'
                ],
                borderWidth: 1,
                label: 'Device Distribution'
            }]
        };

        console.log('✅ Device chart updated successfully');
    }
    
    updateVenueClicksChart() {
        if (this.popularVenues.length > 0) {
            const topVenues = this.popularVenues.slice(0, 10);
            console.log('Updating venue clicks chart with data:', topVenues);
            
            this.venueClicksChartData = {
                labels: topVenues.map(v => this.getVenueDisplayName(v)),
                datasets: [{
                    label: 'Clicks',
                    data: topVenues.map(v => v.clicks),
                    backgroundColor: '#42A5F5',
                    borderColor: '#1E88E5',
                    borderWidth: 1
                }]
            };
            
            console.log('Venue clicks chart data updated:', this.venueClicksChartData);
        } else {
            console.log('No popular venues data available for chart update');
        }
    }
    
    updateTimelineChart() {
        console.log('📈 Timeline Chart Update - Raw data:', this.timelineAnalytics);
        
        if (!this.timelineAnalytics || this.timelineAnalytics.length === 0) {
            console.log('❌ No timeline analytics data available - chart will be empty');
            this.timelineChartData = {
                labels: [],
                datasets: []
            };
            return;
        }

        console.log('✅ Updating timeline chart with data:', this.timelineAnalytics);
        
        const dates = this.timelineAnalytics.map(item => item.date);
        const clicks = this.timelineAnalytics.map(item => item.clicks || 0);
        const users = this.timelineAnalytics.map(item => item.uniqueUsers || 0);
        const enquiries = this.timelineAnalytics.map(item => item.enquiries || 0);

        console.log('📊 Timeline chart data processed:', {
            totalRecords: this.timelineAnalytics.length,
            dates: dates.length,
            clicks: clicks.length,
            users: users.length,
            enquiries: enquiries.length,
            clicksTotal: clicks.reduce((a, b) => a + b, 0),
            sampleData: this.timelineAnalytics.slice(0, 3)
        });

        this.timelineChartData = {
            labels: dates,
            datasets: [
                {
                    label: 'Clicks',
                    data: clicks,
                    borderColor: '#42A5F5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Unique Users',
                    data: users,
                    borderColor: '#66BB6A',
                    backgroundColor: 'rgba(102, 187, 106, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Enquiries',
                    data: enquiries,
                    borderColor: '#FF7043',
                    backgroundColor: 'rgba(255, 112, 67, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }
    
    updateSubareaChart() {
        console.log('🗺️ Subarea Chart Update - Raw data:', this.topSubareas);
        
        if (!this.topSubareas || this.topSubareas.length === 0) {
            console.log('❌ No top subareas data available - chart will be empty');
            this.subareaChartData = {
                labels: [],
                datasets: []
            };
            return;
        }

        console.log('✅ Updating subarea chart with data:', this.topSubareas);

        const subareas = this.topSubareas.slice(0, 8).map(item => item.subarea);
        const clicks = this.topSubareas.slice(0, 8).map(item => item.clicks);
        
        console.log('📊 Subarea chart data processed:', {
            totalRecords: this.topSubareas.length,
            subareas: subareas.length,
            clicks: clicks.length,
            clicksTotal: clicks.reduce((a, b) => a + b, 0),
            sampleData: this.topSubareas.slice(0, 3)
        });
        
        // Generate colors for the chart
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        this.subareaChartData = {
            labels: subareas,
            datasets: [{
                data: clicks,
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(color => color + 'CC')
            }]
        };
    }

    updateSelectedVenueTimelineChart(timelineData: any[]) {
        if (!timelineData || timelineData.length === 0) {
            this.selectedVenueTimelineData = {
                labels: [],
                datasets: []
            };
            return;
        }

        const dates = timelineData.map(item => item.date);
        const clicks = timelineData.map(item => item.clicks || 0);
        const users = timelineData.map(item => item.uniqueUsers || 0);
        const enquiries = timelineData.map(item => item.enquiries || 0);

        this.selectedVenueTimelineData = {
            labels: dates,
            datasets: [
                {
                    label: 'Clicks',
                    data: clicks,
                    borderColor: '#42A5F5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Unique Users',
                    data: users,
                    borderColor: '#66BB6A',
                    backgroundColor: 'rgba(102, 187, 106, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Enquiries',
                    data: enquiries,
                    borderColor: '#FF7043',
                    backgroundColor: 'rgba(255, 112, 67, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }

    async exportData() {
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
                detail: 'Please wait while we generate your high-quality analytics report...'
            });

            // Ensure all data is loaded first
            await this.waitForDataLoad();
            
            // Force Angular change detection to ensure all templates are rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Temporarily hide loading overlay and dialogs for clean capture
            const originalLoading = this.loading;
            const originalVenueDetails = this.showVenueDetails;
            const originalUserClickDetails = this.showUserClickDetails;
            
            this.loading = false;
            this.showVenueDetails = false;
            this.showUserClickDetails = false;

            // Wait longer for UI to fully update and render all dynamic content
            await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms

            // Get the dashboard element (browser only)
            const dashboardElement = this.isBrowser ? 
                document.querySelector('.analytics-dashboard') as HTMLElement : null;
            
            if (!dashboardElement) {
                throw new Error('Dashboard element not found or not in browser environment');
            }

            // Apply PDF export mode class
            dashboardElement.classList.add('pdf-export-mode');
            
            // Wait a bit more for the PDF mode styles to apply
            await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 300ms to 200ms

            // Show processing message
            this.messageService.add({
                severity: 'info',
                summary: 'Processing',
                detail: 'Capturing dashboard content in high quality...'
            });

            // Configure html2canvas options for better quality and dynamic content capture
            const canvas = await html2canvas(dashboardElement, {
                scale: 2, // Increased from 1 to 1.5 for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                width: dashboardElement.scrollWidth,
                height: dashboardElement.scrollHeight,
                logging: false, // Disable logging to reduce overhead
                ignoreElements: (element) => {
                    // Ignore overlay elements, dialogs, and buttons
                    return element.classList.contains('p-dialog') ||
                           element.classList.contains('p-sidebar') ||
                           element.classList.contains('p-toast') ||
                           element.classList.contains('loading-overlay') ||
                           element.tagName === 'P-DIALOG' ||
                           element.tagName === 'P-SIDEBAR';
                },
                onclone: (clonedDoc) => {
                    console.log('🔄 Processing cloned document for PDF...');
                    
                    // Clean up the cloned document
                    const clonedElement = clonedDoc.querySelector('.analytics-dashboard') as HTMLElement;
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
                        
                        // Ensure table cells and content are visible
                        const tableCells = clonedElement.querySelectorAll('td, th, .p-datatable-tbody tr');
                        tableCells.forEach((cell: any) => {
                            cell.style.opacity = '1';
                            cell.style.visibility = 'visible';
                        });
                        
                        // Force render quality score values
                        const qualityScoreCells = clonedElement.querySelectorAll('[data-quality-score]');
                        qualityScoreCells.forEach((cell: any) => {
                            const score = cell.getAttribute('data-quality-score');
                            if (score && !cell.textContent) {
                                cell.textContent = parseFloat(score).toFixed(2);
                            }
                        });
                        
                        // Make PDF fallback text visible and styled
                        const pdfFallbacks = clonedElement.querySelectorAll('.pdf-fallback');
                        pdfFallbacks.forEach((fallback: any) => {
                            fallback.style.display = 'inline-block';
                            fallback.style.padding = '4px 8px';
                            fallback.style.fontSize = '12px';
                            fallback.style.fontWeight = 'bold';
                            fallback.style.color = '#333';
                            fallback.style.backgroundColor = '#f8f9fa';
                            fallback.style.border = '1px solid #dee2e6';
                            fallback.style.borderRadius = '4px';
                            fallback.style.minWidth = '40px';
                            fallback.style.textAlign = 'center';
                        });
                        
                        // Hide PrimeNG components that might not render properly
                        const pTags = clonedElement.querySelectorAll('p-tag');
                        pTags.forEach((tag: any) => {
                            tag.style.display = 'none';
                        });
                        
                        // Also hide any .p-tag elements (rendered tags)
                        const renderedTags = clonedElement.querySelectorAll('.p-tag');
                        renderedTags.forEach((tag: any) => {
                            tag.style.display = 'none';
                        });
                    }
                }
            });

            // Restore original state
            this.loading = originalLoading;
            this.showVenueDetails = originalVenueDetails;
            this.showUserClickDetails = originalUserClickDetails;
            
            // Remove PDF export mode class
            dashboardElement.classList.remove('pdf-export-mode');

            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            // Create PDF with compression
            const pdf = new (jsPDF as any)({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true // Enable compression
            });
            let position = 0;

            // Add logo to the first page with maximum quality
            try {
                // Try to load SVG logo first for best quality
                const svgLogo = await this.loadSvgLogo();
                
                if (svgLogo) {
                    // Calculate optimal logo dimensions
                    const maxLogoWidth = 50; // 50mm for prominent visibility
                    const aspectRatio = svgLogo.height / svgLogo.width;
                    const logoWidth = maxLogoWidth;
                    const logoHeight = logoWidth * aspectRatio;
                    
                    // Add SVG logo with maximum quality (positioned top-right)
                    pdf.addImage(svgLogo.dataUrl, 'PNG', 210 - logoWidth - 10, 10, logoWidth, logoHeight);
                    
                    console.log('✅ Ultra-high-quality SVG logo added to PDF:', {
                        format: 'SVG->PNG',
                        width: logoWidth,
                        height: logoHeight,
                        aspectRatio: aspectRatio
                    });
                } else {
                    // Fallback to PNG logo with maximum quality
                    const logoImg = new Image();
                    logoImg.crossOrigin = 'anonymous';
                    
                    await new Promise<void>((resolve, reject) => {
                        logoImg.onload = () => resolve();
                        logoImg.onerror = () => {
                            console.warn('Could not load PNG logo either');
                            resolve();
                        };
                        logoImg.src = 'assets/images/eazyvneu-logo.png';
                    });
                    
                    if (logoImg.complete && logoImg.naturalWidth > 0) {
                        const maxLogoWidth = 50;
                        const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
                        const logoWidth = maxLogoWidth;
                        const logoHeight = logoWidth * aspectRatio;
                        
                        // Add PNG logo without any compression
                        pdf.addImage(logoImg.src, 'PNG', 210 - logoWidth - 10, 10, logoWidth, logoHeight);
                        
                        console.log('✅ High-quality PNG logo added to PDF');
                    }
                }
            } catch (error) {
                console.warn('Error adding logo to PDF:', error);
            }

            // Add title page content
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text('EazyVenue', 20, 30);
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Analytics Report', 20, 42);
            
            // Add a horizontal line
            pdf.setDrawColor(44, 62, 80);
            pdf.setLineWidth(0.5);
            pdf.line(20, 50, 190, 50);
            
            pdf.setFontSize(12);
            const reportDate = new Date().toLocaleDateString('en-GB');
            const reportTime = new Date().toLocaleTimeString('en-GB');
            pdf.text(`Generated on: ${reportDate} at ${reportTime}`, 20, 65);
            
            if (this.dateRange && this.dateRange.length === 2) {
                const fromDate = this.dateRange[0].toLocaleDateString('en-GB');
                const toDate = this.dateRange[1].toLocaleDateString('en-GB');
                pdf.text(`Date Range: ${fromDate} - ${toDate}`, 20, 75);
            }
            
            if (this.isVenueOwner && this.currentVenueName) {
                pdf.text(`Venue: ${this.currentVenueName}`, 20, 85);
            } else if (this.isAdmin) {
                pdf.text('Report Type: Admin - All Venues', 20, 85);
            }

            // Add summary statistics
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Summary Statistics:', 20, 105);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            
            let yPos = 115;
            if (this.overviewStats) {
                pdf.text(`Total Clicks: ${this.formatNumber(this.overviewStats.totalClicks || 0)}`, 25, yPos);
                yPos += 8;
                pdf.text(`Active Venues: ${this.formatNumber(this.overviewStats.uniqueVenuesCount || 0)}`, 25, yPos);
                yPos += 8;
                pdf.text(`Unique Visitors: ${this.formatNumber(this.overviewStats.uniqueUsersCount || 0)}`, 25, yPos);
                yPos += 8;
                pdf.text(`Average Quality Score: ${(this.overviewStats.averageQualityScore || 0).toFixed(2)}`, 25, yPos);
                yPos += 8;
                pdf.text(`Mobile Usage: ${(this.overviewStats.mobilePercentage || 0).toFixed(1)}%`, 25, yPos);
                yPos += 8;
                pdf.text(`Desktop Usage: ${(100 - (this.overviewStats.mobilePercentage || 0)).toFixed(1)}%`, 25, yPos);
            }

            // Add new page for dashboard content
            pdf.addPage();

            // Add dashboard screenshot with optimized compression
            const imgData = canvas.toDataURL('image/png'); // Increased from 0.7 to 0.85 for better quality
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const venueText = this.isVenueOwner && this.currentVenueName ? 
                `-${this.currentVenueName.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
            const dateText = new Date().toISOString().split('T')[0];
            const filename = `EazyVenue_Analytics${venueText}_${dateText}.pdf`;

            // Save the PDF
            pdf.save(filename);

            // Show success message
            this.messageService.add({
                severity: 'success',
                summary: 'Export Successful',
                detail: `Analytics report exported as ${filename}`
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Export Failed',
                detail: 'Failed to generate PDF report. Please try again.'
            });
        }
    }
    
    /**
     * Load SVG logo and convert to high-quality PNG for PDF (browser only)
     */
    private async loadSvgLogo(): Promise<{dataUrl: string, width: number, height: number} | null> {
        // Only run in browser
        if (!this.isBrowser) {
            return null;
        }

        try {
            // Fetch the SVG content
            const response = await fetch('assets/images/logo/eazyvneu-logo.svg');
            if (!response.ok) {
                console.warn('Could not fetch SVG logo');
                return null;
            }
            
            const svgText = await response.text();
            
            // Create SVG blob
            const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create image from SVG
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    // Create high-resolution canvas for SVG rendering (browser only)
                    if (!this.isBrowser) {
                        resolve(null);
                        return;
                    }
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Use high DPI for maximum quality
                    const scaleFactor = 4; // 4x resolution for ultra-sharp logo
                    canvas.width = img.width * scaleFactor;
                    canvas.height = img.height * scaleFactor;
                    
                    // Scale context for high-DPI rendering
                    ctx?.scale(scaleFactor, scaleFactor);
                    
                    // Set high-quality rendering settings
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        
                        // Clear canvas with transparent background
                        ctx.clearRect(0, 0, img.width, img.height);
                        
                        // Draw SVG with maximum quality
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                    }
                    
                    // Convert to PNG with maximum quality
                    const dataUrl = canvas.toDataURL('image/png', 1.0); // 100% quality
                    
                    // Clean up
                    URL.revokeObjectURL(svgUrl);
                    
                    console.log('🎨 SVG logo converted to ultra-high-quality PNG:', {
                        originalSize: `${img.width}x${img.height}`,
                        canvasSize: `${canvas.width}x${canvas.height}`,
                        scaleFactor: scaleFactor,
                        quality: '100%'
                    });
                    
                    resolve({
                        dataUrl: dataUrl,
                        width: img.width,
                        height: img.height
                    });
                };
                
                img.onerror = () => {
                    console.warn('Could not load SVG as image');
                    URL.revokeObjectURL(svgUrl);
                    resolve(null);
                };
                
                img.src = svgUrl;
            });
            
        } catch (error) {
            console.warn('Error processing SVG logo:', error);
            return null;
        }
    }
    
    // Helper methods for PDF export
    private async waitForDataLoad(): Promise<void> {
        // Wait for any pending data loads
        while (this.loading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Check if essential data is loaded
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (attempts < maxAttempts) {
            const hasOverviewStats = this.overviewStats && Object.keys(this.overviewStats).length > 0;
            const hasPopularVenues = this.popularVenues && this.popularVenues.length > 0;
            const hasTopSubareas = this.topSubareas && this.topSubareas.length > 0;
            
            if (hasOverviewStats && hasPopularVenues && hasTopSubareas) {
                console.log('✅ All essential data loaded for PDF export');
                break;
            }
            
            console.log(`⏳ Waiting for data... Attempt ${attempts + 1}/${maxAttempts}`, {
                hasOverviewStats,
                hasPopularVenues,
                hasTopSubareas
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Give extra time for charts and tables to render completely
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000ms to 1000ms
        
        console.log('📊 Data check before PDF export:', {
            overviewStats: this.overviewStats,
            popularVenuesCount: this.popularVenues?.length || 0,
            topSubareasCount: this.topSubareas?.length || 0,
            timelineDataCount: this.timelineAnalytics?.length || 0,
            sampleSubarea: this.topSubareas?.[0] || null,
            sampleVenue: this.popularVenues?.[0] || null,
            sampleVenueQualityScore: this.popularVenues?.[0]?.averageQualityScore || 'N/A',
            overviewQualityScore: this.overviewStats?.averageQualityScore || 'N/A'
        });
    }
    
    private enhanceChartsForPdf(): void {
        // Enhance chart colors for better PDF visibility
        this.updateChartColorsForPdf();
    }
    
    private updateChartColorsForPdf(): void {
        // Update device chart colors
        if (this.deviceChartData && this.deviceChartData.datasets) {
            this.deviceChartData.datasets.forEach((dataset: any) => {
                if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
                    dataset.backgroundColor = [
                        '#2C3E50', // Dark blue-gray
                        '#E74C3C', // Red
                        '#F39C12', // Orange
                        '#27AE60', // Green
                        '#8E44AD'  // Purple
                    ];
                }
                if (dataset.borderColor && Array.isArray(dataset.borderColor)) {
                    dataset.borderColor = [
                        '#1A252F', // Darker blue-gray
                        '#C0392B', // Darker red
                        '#D68910', // Darker orange
                        '#1E8449', // Darker green
                        '#6C3483'  // Darker purple
                    ];
                }
            });
        }
        
        // Update venue clicks chart colors
        if (this.venueClicksChartData && this.venueClicksChartData.datasets) {
            this.venueClicksChartData.datasets.forEach((dataset: any) => {
                dataset.backgroundColor = '#2C3E50';
                dataset.borderColor = '#1A252F';
                dataset.hoverBackgroundColor = '#34495E';
            });
        }
        
        // Update timeline chart colors
        if (this.timelineChartData && this.timelineChartData.datasets) {
            this.timelineChartData.datasets.forEach((dataset: any, index: number) => {
                const colors = ['#2C3E50', '#E74C3C', '#F39C12', '#27AE60'];
                dataset.backgroundColor = colors[index % colors.length];
                dataset.borderColor = colors[index % colors.length];
                dataset.pointBackgroundColor = colors[index % colors.length];
                dataset.pointBorderColor = '#FFFFFF';
                dataset.pointBorderWidth = 2;
            });
        }
        
        // Update subarea chart colors
        if (this.subareaChartData && this.subareaChartData.datasets) {
            this.subareaChartData.datasets.forEach((dataset: any) => {
                dataset.backgroundColor = '#2C3E50';
                dataset.borderColor = '#1A252F';
                dataset.hoverBackgroundColor = '#34495E';
            });
        }
    }
    
    private restoreOriginalCharts(): void {
        // Restore original chart colors after PDF export
        this.updateDeviceChart();
        this.updateVenueClicksChart();
        this.updateTimelineChart();
        this.updateSubareaChart();
    }
    
    private hideElementsForPdf(hide: boolean): void {
        // Only run in browser
        if (!this.isBrowser) {
            return;
        }

        if (!this.isBrowser) {
            return;
        }

        const dashboard = document.querySelector('.analytics-dashboard') as HTMLElement;
        const elementsToHide = [
            '.header-actions',
            '.p-button',
            'button',
            '.loading-overlay',
            '.p-sidebar',
            '.p-dialog',
            '.p-toast'
        ];
        
        if (hide) {
            // Add PDF export mode class
            if (dashboard) {
                dashboard.classList.add('pdf-export-mode');
            }
            
            // Add PDF mode to chart contents
            const chartContents = document.querySelectorAll('.chart-content');
            chartContents.forEach((chart: any) => chart.classList.add('pdf-mode'));
        } else {
            // Remove PDF export mode class
            if (dashboard) {
                dashboard.classList.remove('pdf-export-mode');
            }
            
            // Remove PDF mode from chart contents
            const chartContents = document.querySelectorAll('.chart-content');
            chartContents.forEach((chart: any) => chart.classList.remove('pdf-mode'));
        }
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                if (hide) {
                    element.style.display = 'none';
                } else {
                    element.style.display = '';
                }
            });
        });
    }
    
    private addPdfHeader(pdf: any): void {
        // Add header background
        pdf.setFillColor(44, 62, 80); // Dark blue-gray
        pdf.rect(0, 0, 210, 25, 'F');
        
        // Add title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EazyVenue Analytics Dashboard', 20, 15);
        
        // Add generation info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB');
        const timeStr = now.toLocaleTimeString('en-GB');
        pdf.text(`Generated on ${dateStr} at ${timeStr}`, 20, 21);
        
        // Add venue info if applicable
        if (this.isVenueOwner && this.currentVenueName) {
            pdf.text(`Venue: ${this.currentVenueName}`, 120, 15);
        } else if (this.isAdmin) {
            pdf.text('All Venues Report', 120, 15);
        }
        
        // Add date range
        if (this.dateRange && this.dateRange.length === 2) {
            const fromDate = this.dateRange[0].toLocaleDateString('en-GB');
            const toDate = this.dateRange[1].toLocaleDateString('en-GB');
            pdf.text(`Period: ${fromDate} - ${toDate}`, 120, 21);
        }
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
    }
    
    private addPdfFooter(pdf: any, pageNum: number, totalPages: number): void {
        // Add footer line
        pdf.setDrawColor(44, 62, 80);
        pdf.setLineWidth(0.5);
        pdf.line(20, 275, 190, 275);
        
        // Add footer text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        
        // Left side - company info
        pdf.text('EazyVenue Analytics Dashboard', 20, 280);
        pdf.text('© 2025 EazyVenue. All rights reserved.', 20, 285);
        
        // Right side - page number
        pdf.text(`Page ${pageNum} of ${totalPages}`, 190 - 20, 280, { align: 'right' });
        pdf.text(new Date().toLocaleDateString('en-GB'), 190 - 20, 285, { align: 'right' });
    }
    
    formatNumber(num: number): string {
        if (!num && num !== 0) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    getQualityScoreColor(score: number): string {
        if (score === null || score === undefined || isNaN(score)) {
            return 'secondary'; // Gray for N/A
        }
        if (score >= 0.8) return 'success';
        if (score >= 0.6) return 'warning';
        return 'danger';
    }
    
    getEngagementLevel(score: number): string {
        if (score === null || score === undefined || isNaN(score)) {
            return 'Unknown';
        }
        if (score >= 0.8) return 'High';
        if (score >= 0.6) return 'Medium';
        if (score >= 0.4) return 'Low';
        return 'Very Low';
    }
    
    getVenueDisplayName(venue: any): string {
        console.log('🏢 getVenueDisplayName called with venue:', venue);
        
        if (venue.venueName && venue.venueName.trim()) {
            console.log('✅ Using venue name:', venue.venueName);
            // Return full name since CSS will handle line wrapping and truncation
            return venue.venueName.length > 15 ? `${venue.venueName.substring(0, 15)}...` : venue.venueName;
        }
        
        console.log('⚠️ Using fallback for venue:', venue.venueId);
        return `Venue ${venue.venueId ? venue.venueId.substring(0, 8) : 'Unknown'}...`;
    }
    
    getQualityScoreDisplay(venue: any): string {
        const score = venue.averageQualityScore || venue.qualityScore || venue.avgQualityScore;
        
        if (score === null || score === undefined || isNaN(score)) {
            console.log('⚠️ No quality score available for venue:', venue.venueId || venue._id);
            return 'N/A';
        }
        
        return Number(score).toFixed(2);
    }
    
    hasQualityScore(venue: any): boolean {
        const score = venue.averageQualityScore || venue.qualityScore || venue.avgQualityScore;
        return score !== null && score !== undefined && !isNaN(score);
    }
    
    isRegisteredUser(click: any): boolean {
        return !!(click.user?.userId && click.user?.userId !== null);
    }
    
    getUserDisplayInfo(click: any): string {
        if (!this.isRegisteredUser(click)) {
            return 'Anonymous User';
        }
        console.log('getUserDisplayInfo called with:', click);
        
        // Admin can see user names and emails, others see limited info
        if (this.isAdmin) {
            return click.user?.userName || click.user?.userEmail || `User ${click.user?.userId?.substring(0, 8)}...`;
        } else {
            return click.user?.userName;
        }
    }
    
    getEngagementDisplay(click: any): string {
        const quality = click.qualityScore || 0;
        if (quality >= 0.7) return 'High';
        if (quality >= 0.4) return 'Medium';
        return 'Low';
    }
    
    clearDateRange() {
        console.log('Clearing date range filter');
        
        // Set to null to allow calendar to work but remove date filtering
        this.dateRange = null as any;
        
        console.log('Date range cleared, reloading all data');
        this.loadDashboardData();
        
        this.messageService.add({
            severity: 'info',
            summary: 'Date Filter Cleared',
            detail: 'Now showing all data. Use calendar to apply date filters.'
        });
    }
    
    // Add this method to help debug single day selections
    debugSingleDaySelection() {
        if (this.dateRange && this.dateRange.length === 2) {
            const startDate = new Date(this.dateRange[0]);
            const endDate = new Date(this.dateRange[1]);
            const isSingleDay = startDate.toDateString() === endDate.toDateString();
            
            console.log('🔍 SINGLE DAY SELECTION DEBUG:');
            console.log('==============================');
            console.log('Selected dates:', {
                start: this.dateRange[0],
                end: this.dateRange[1],
                isSingleDay: isSingleDay,
                startDateString: startDate.toDateString(),
                endDateString: endDate.toDateString()
            });
            
            if (isSingleDay) {
                console.log('✅ Single day detected - should show data for:', startDate.toDateString());
                console.log('📊 Data counts after API calls:');
                console.log('- Popular Venues:', this.popularVenues?.length || 0);
                console.log('- Device Analytics:', this.deviceAnalytics?.length || 0);
                console.log('- Timeline Analytics:', this.timelineAnalytics?.length || 0);
                console.log('- Top Subareas:', this.topSubareas?.length || 0);
                console.log('- Overview Stats present:', !!this.overviewStats && Object.keys(this.overviewStats).length > 0);
                
                // Check which charts have data
                console.log('📈 Chart data status:');
                console.log('- Device Chart data points:', this.deviceChartData?.datasets?.[0]?.data?.length || 0);
                console.log('- Venue Clicks Chart data points:', this.venueClicksChartData?.datasets?.[0]?.data?.length || 0);
                console.log('- Timeline Chart data points:', this.timelineChartData?.datasets?.[0]?.data?.length || 0);
                console.log('- Subarea Chart data points:', this.subareaChartData?.datasets?.[0]?.data?.length || 0);
            }
            console.log('==============================');
        }
    }
}
