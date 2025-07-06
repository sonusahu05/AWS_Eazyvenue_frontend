import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-analytics-dashboard',
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();
    
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
        private confirmationService: ConfirmationService
    ) {
        // Initialize dateRange immediately in constructor to prevent undefined errors
        this.setDefaultDateRange();
    }
    
    ngOnInit() {
        this.setDefaultDateRange(); // Set default dates FIRST
        this.checkUserAccess();
        this.initializeChartOptions();
        this.initializeChartData();
        this.loadDashboardData();
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
            // Ultimate fallback - just use current timestamp
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            this.dateRange = [thirtyDaysAgo, now];
        }
    }
    
    loadDashboardData() {
        this.loading = true;
        const params = this.getDateParams();
        console.log('Loading dashboard data with params:', params);
        
        // Track completed requests
        let completedRequests = 0;
        const totalRequests = 5; // overview, venues, devices, timeline, subareas
        
        const checkAllComplete = () => {
            completedRequests++;
            if (completedRequests >= totalRequests) {
                this.loading = false;
                console.log('All dashboard data loaded successfully');
            }
        };
        
        // Load overview stats
        this.subscriptions.add(
            this.analyticsService.getOverviewStats(params).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.overviewStats = response.data[0] || {};
                        this.updateDeviceChart();
                        console.log('Overview stats loaded:', this.overviewStats);
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
                        console.log('Popular venues received:', this.popularVenues);
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
        
        // Add date range if both dates are selected and valid
        if (this.dateRange && Array.isArray(this.dateRange) && 
            this.dateRange.length === 2 && 
            this.dateRange[0] instanceof Date && this.dateRange[1] instanceof Date &&
            !isNaN(this.dateRange[0].getTime()) && !isNaN(this.dateRange[1].getTime())) {
            
            params.from = this.dateRange[0].toISOString();
            params.to = this.dateRange[1].toISOString();
            
            console.log('Valid date params created:', params);
        } else {
            console.log('No valid date range available, using default params');
        }
        
        // Add venue filter for non-admin users
        if (!this.isAdmin && this.isVenueOwner && this.currentVenueName) {
            params.venueFilter = this.currentVenueName;
            console.log('🏢 Adding venue filter for non-admin user:', this.currentVenueName);
        }
        
        console.log('Final params with filters:', params);
        return params;
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
        if (this.overviewStats) {
            this.deviceChartData = {
                labels: ['Mobile', 'Desktop'],
                datasets: [{
                    data: [
                        this.overviewStats.mobileClicks || 0,
                        this.overviewStats.desktopClicks || 0
                    ],
                    backgroundColor: [
                        '#42A5F5',
                        '#FFA726'
                    ],
                    borderColor: [
                        '#1E88E5',
                        '#FF9800'
                    ],
                    borderWidth: 1
                }]
            };
        }
    }
    
    updateVenueClicksChart() {
        if (this.popularVenues.length > 0) {
            const topVenues = this.popularVenues.slice(0, 10);
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
        }
    }
    
    updateTimelineChart() {
        if (!this.timelineAnalytics || this.timelineAnalytics.length === 0) {
            this.timelineChartData = {
                labels: [],
                datasets: []
            };
            return;
        }

        const dates = this.timelineAnalytics.map(item => item.date);
        const clicks = this.timelineAnalytics.map(item => item.clicks || 0);
        const users = this.timelineAnalytics.map(item => item.uniqueUsers || 0);
        const enquiries = this.timelineAnalytics.map(item => item.enquiries || 0);

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
        if (!this.topSubareas || this.topSubareas.length === 0) {
            this.subareaChartData = {
                labels: [],
                datasets: []
            };
            return;
        }

        const subareas = this.topSubareas.slice(0, 8).map(item => item.subarea);
        const clicks = this.topSubareas.slice(0, 8).map(item => item.clicks);
        
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

    exportData() {
        // Prepare data for export
        const exportData = {
            overviewStats: this.overviewStats,
            popularVenues: this.popularVenues,
            deviceAnalytics: this.deviceAnalytics,
            dateRange: this.dateRange,
            exportedAt: new Date()
        };
        
        // Convert to JSON and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Analytics data exported successfully'
        });
    }
    
    formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    }
    
    getQualityScoreColor(score: number): string {
        if (score >= 0.8) return 'success';
        if (score >= 0.6) return 'warning';
        return 'danger';
    }
    
    getEngagementLevel(score: number): string {
        if (score >= 0.8) return 'High';
        if (score >= 0.6) return 'Medium';
        if (score >= 0.4) return 'Low';
        return 'Very Low';
    }
    
    getVenueDisplayName(venue: any): string {
        // console.log('getVenueDisplayName called with:', venue); // Debug log
        if (venue.venueName && venue.venueName.trim()) {
            // console.log('Using venue name:', venue.venueName); // Debug log
            return venue.venueName.length > 25 ? 
                venue.venueName.substring(0, 25) + '...' : 
                venue.venueName;
        }
        console.log('Using fallback for venue:', venue.venueId); // Debug log
        return `Venue ${venue.venueId.substring(0, 8)}...`;
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
        
        // Reset to default date range instead of empty array to prevent calendar errors
        this.setDefaultDateRange();
        
        console.log('Date range reset to default, reloading all data');
        this.loadDashboardData();
        
        // If venue details are currently open, refresh them with new date range
        if (this.showVenueDetails && this.selectedVenue) {
            console.log('Refreshing venue details after clearing date filter');
            this.loadVenueInsights(this.selectedVenue.venueId);
        }
        
        // If user click details are currently open, refresh them with new date range
        if (this.showUserClickDetails && this.selectedVenue) {
            console.log('Refreshing user click details after clearing date filter');
            this.loadUserClickDetails(this.selectedVenue.venueId);
        }
        
        this.messageService.add({
            severity: 'info',
            summary: 'Date Filter Cleared',
            detail: 'Showing data for the last 30 days'
        });
    }
}
