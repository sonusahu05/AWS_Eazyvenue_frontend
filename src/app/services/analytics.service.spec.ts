import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import { environment } from '../../environments/environment';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService]
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track venue click', () => {
    const mockClickData = {
      venueId: 'test-venue-123',
      userId: 'test-user-456',
      sessionId: 'test-session-789',
      location: {
        lat: 19.0760,
        lng: 72.8777,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001'
      },
      device: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        platform: 'desktop',
        browser: 'Chrome',
        isMobile: false
      },
      engagement: {
        timeSpentSeconds: 120,
        scrollDepthPercent: 75,
        submittedEnquiry: false
      }
    };

    const mockResponse = {
      success: true,
      message: 'Venue interest tracked successfully',
      data: {
        id: 'click-id-123',
        venueId: 'test-venue-123',
        timestamp: new Date().toISOString()
      }
    };

    service.trackVenueClick(mockClickData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}analytics/geography/track-venue-click`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockClickData);
    req.flush(mockResponse);
  });

  it('should generate session ID', () => {
    const sessionId = service.generateSessionId();
    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  it('should get device info', () => {
    const deviceInfo = service.getDeviceInfo();
    expect(deviceInfo.userAgent).toBeDefined();
    expect(deviceInfo.platform).toBeDefined();
    expect(deviceInfo.browser).toBeDefined();
    expect(deviceInfo.isMobile).toBeDefined();
    expect(typeof deviceInfo.isMobile).toBe('boolean');
  });

  it('should get session ID from localStorage or create new one', () => {
    // Clear localStorage first
    localStorage.removeItem('analytics_session_id');
    
    const sessionId1 = service.getSessionId();
    expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
    
    // Should return the same session ID on subsequent calls
    const sessionId2 = service.getSessionId();
    expect(sessionId2).toBe(sessionId1);
  });

  it('should check health', () => {
    const mockHealthResponse = {
      success: true,
      message: 'Analytics Geography API is healthy',
      timestamp: new Date().toISOString()
    };

    service.checkHealth().subscribe(response => {
      expect(response).toEqual(mockHealthResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}analytics/geography/health`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHealthResponse);
  });
});
