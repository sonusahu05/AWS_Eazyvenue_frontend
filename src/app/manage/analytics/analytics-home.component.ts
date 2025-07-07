import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics-home',
  template: `
    <div class="analytics-home">
      <div class="welcome-section">
        <h1>Welcome to Venue Analytics</h1>
        <p>Get comprehensive insights into your venue performance</p>
        
        <div class="quick-actions">
          <button 
            pButton 
            pRipple 
            label="View Geography Dashboard" 
            icon="pi pi-chart-bar"
            routerLink="/manage/analytics/geography"
            class="p-button-lg p-mr-3">
          </button>
          
          <button 
            pButton 
            pRipple 
            label="Test Analytics API" 
            icon="pi pi-cog"
            routerLink="/manage/analytics/geography/test"
            class="p-button-lg p-button-outlined">
          </button>
        </div>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <i class="pi pi-map-marker"></i>
          <h3>Geographic Analytics</h3>
          <p>Track visitor locations and geographic distribution</p>
        </div>
        
        <div class="feature-card">
          <i class="pi pi-mobile"></i>
          <h3>Device Analytics</h3>
          <p>Monitor device types and platform usage</p>
        </div>
        
        <div class="feature-card">
          <i class="pi pi-clock"></i>
          <h3>Engagement Metrics</h3>
          <p>Measure time spent and user interaction quality</p>
        </div>
        
        <div class="feature-card">
          <i class="pi pi-chart-line"></i>
          <h3>Performance Insights</h3>
          <p>Get actionable insights to improve venue performance</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-home {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .welcome-section h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    
    .welcome-section p {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 30px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-card i {
      font-size: 3rem;
      color: #3498db;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    
    .feature-card p {
      color: #7f8c8d;
    }
  `]
})
export class AnalyticsHomeComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
