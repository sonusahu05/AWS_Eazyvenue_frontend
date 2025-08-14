import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment'; // Adjust the path as necessary

@Component({
  selector: 'app-ai-search',
  templateUrl: './ai-search.component.html',
  styleUrls: ['./ai-search.component.scss'],
//   standalone: true,
})
export class AiSearchComponent {
  prompt = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  search() {
    this.loading = true;
    this.error = '';

    // this.http.post<any>('http://localhost:3006/api/aisearch', { prompt: this.prompt }).subscribe({
    this.http.post<any>(`${environment.apiUrl}aisearch`, { prompt: this.prompt }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/venue-list'], {
            state: { aiVenueNames: res.venues }
          });
        } else {
          this.error = res.error || 'Search failed';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Server error';
      }
    });
  }
}
