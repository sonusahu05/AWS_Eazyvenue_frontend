import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InstagramEmbed {
  id: number;
  post_id: string;
  url: string;
  embed_code: string;
  account: string;
  title: string;
  description: string;
  is_video?: boolean;
  is_published: boolean;
  created_at: Date;
  thumbnail?: string;
  updated_at: Date;
}

export interface InstagramApiResponse {
  success: boolean;
  count: number;
  data: InstagramEmbed[];
}

export interface SingleInstagramResponse {
  success: boolean;
  data: InstagramEmbed;
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private baseUrl = `${environment.apiUrl}instagram`;

  constructor(private http: HttpClient) { }

  /**
   * Get all Instagram embeds for blog
   * @param limit - Number of posts to retrieve (default: 10)
   * @param published - Filter by published status (default: true)
   */
  getInstagramEmbeds(limit: number = 10, published: boolean = true): Observable<InstagramApiResponse> {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());
    params = params.set('published', published.toString());

    return this.http.get<InstagramApiResponse>(this.baseUrl, { params });
  }

  /**
   * Get single Instagram embed by ID
   * @param id - Instagram embed ID
   */
  getInstagramEmbed(id: number): Observable<SingleInstagramResponse> {
    return this.http.get<SingleInstagramResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get Instagram embeds for specific account
   * @param account - Account name (e.g., 'eazyvenue')
   * @param limit - Number of posts to retrieve (default: 10)
   */
  getInstagramEmbedsByAccount(account: string, limit: number = 10): Observable<InstagramApiResponse> {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());

    return this.http.get<InstagramApiResponse>(`${this.baseUrl}/account/${account}`, { params });
  }

  /**
   * Get Instagram embed script
   */
  getInstagramScript(): Observable<{success: boolean, script: string, usage: string}> {
    return this.http.get<{success: boolean, script: string, usage: string}>(`${this.baseUrl}/script/embed`);
  }

  /**
   * Load Instagram embed script dynamically
   * This should be called once per page to enable Instagram embeds
   */
  loadInstagramScript(): void {
    if (typeof window !== 'undefined' && !document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  /**
   * Process Instagram embeds after they are loaded into the DOM
   * This should be called after embedding Instagram content
   */
  processEmbeds(): void {
    if (typeof window !== 'undefined' && (window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }
}
