import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-analytics-test',
  template: `
    <div class="test-analytics p-4">
      <h2>Analytics Service Test</h2>
      
      <div class="test-section p-mb-4">
        <h3>Test Venue Click Tracking</h3>
        <button 
          pButton 
          pRipple 
          label="Track Test Click" 
          icon="pi pi-play"
          (click)="testVenueClick()"
          class="p-mr-2">
        </button>
        <p *ngIf="trackingResult" class="p-mt-2">
          Result: {{ trackingResult | json }}
        </p>
      </div>
      
      <div class="test-section p-mb-4">
        <h3>Test Health Check</h3>
        <button 
          pButton 
          pRipple 
          label="Check API Health" 
          icon="pi pi-heart"
          (click)="testHealth()"
          class="p-mr-2">
        </button>
        <p *ngIf="healthResult" class="p-mt-2">
          Result: {{ healthResult | json }}
        </p>
      </div>
      
      <div class="test-section p-mb-4" *ngIf="isAdmin">
        <h3>Test Admin Analytics</h3>
        <button 
          pButton 
          pRipple 
          label="Get Overview Stats" 
          icon="pi pi-chart-bar"
          (click)="testOverviewStats()"
          class="p-mr-2">
        </button>
        <button 
          pButton 
          pRipple 
          label="Get Popular Venues" 
          icon="pi pi-building"
          (click)="testPopularVenues()"
          class="p-mr-2">
        </button>
        <div *ngIf="adminResults" class="p-mt-2">
          <h4>Admin Results:</h4>
          <pre>{{ adminResults | json }}</pre>
        </div>
      </div>
      
      <div class="info-section">
        <h3>Current Session Info</h3>
        <ul>
          <li><strong>Session ID:</strong> {{ sessionId }}</li>
          <li><strong>Device Info:</strong> {{ deviceInfo | json }}</li>
          <li><strong>User Agent:</strong> {{ userAgent }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .test-analytics {
      max-width: 800px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .test-section {
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    
    .info-section ul {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    
    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      max-height: 300px;
    }
  `]
})
export class AnalyticsTestComponent implements OnInit {
  sessionId: string;
  deviceInfo: any;
  userAgent: string;
  trackingResult: any;
  healthResult: any;
  adminResults: any;
  isAdmin: boolean = false;

  constructor(private analyticsService: AnalyticsService) {
    this.sessionId = this.analyticsService.getSessionId();
    this.deviceInfo = this.analyticsService.getDeviceInfo();
    this.userAgent = navigator.userAgent;
    
    // Check if user has admin token (simple check)
    this.isAdmin = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  ngOnInit(): void {
  }

  testVenueClick() {
    const testData = {
      venueId: 'TEST_VENUE_' + Date.now(),
      venueName: 'Test Venue for Analytics',
      sessionId: this.sessionId,
      userId: 'test_user_123',
      userName: 'Test User',
      userEmail: 'test@example.com',
      location: {
        lat: 19.0760,
        lng: 72.8777,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001'
      },
      device: this.deviceInfo,
      engagement: {
        timeSpentSeconds: Math.floor(Math.random() * 120) + 30,
        scrollDepthPercent: Math.floor(Math.random() * 100),
        submittedEnquiry: Math.random() > 0.7
      }
    };

    this.analyticsService.trackVenueClick(testData).subscribe({
      next: (result) => {
        this.trackingResult = result;
        console.log('Tracking successful:', result);
      },
      error: (error) => {
        this.trackingResult = { error: error.message };
        console.error('Tracking failed:', error);
      }
    });
  }

  testHealth() {
    this.analyticsService.checkHealth().subscribe({
      next: (result) => {
        this.healthResult = result;
        console.log('Health check successful:', result);
      },
      error: (error) => {
        this.healthResult = { error: error.message };
        console.error('Health check failed:', error);
      }
    });
  }

  testOverviewStats() {
    if (!this.isAdmin) return;
    
    this.analyticsService.getOverviewStats().subscribe({
      next: (result) => {
        this.adminResults = { overviewStats: result };
        console.log('Overview stats:', result);
      },
      error: (error) => {
        this.adminResults = { error: 'Overview stats failed: ' + error.message };
        console.error('Overview stats failed:', error);
      }
    });
  }

  testPopularVenues() {
    if (!this.isAdmin) return;
    
    this.analyticsService.getPopularVenues({ limit: 5 }).subscribe({
      next: (result) => {
        this.adminResults = { popularVenues: result };
        console.log('Popular venues:', result);
      },
      error: (error) => {
        this.adminResults = { error: 'Popular venues failed: ' + error.message };
        console.error('Popular venues failed:', error);
      }
    });
  }
}
