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
  updated_at: Date;

  // ✅ optional thumbnail field
  thumbnail?: string;
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

  constructor(private http: HttpClient) {}

  /**
   * Get all Instagram embeds
   */
  getInstagramEmbeds(limit: number = 10, published: boolean = true): Observable<InstagramApiResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('published', published.toString());

    return this.http.get<InstagramApiResponse>(this.baseUrl, { params });
  }

  /**
   * Get single Instagram embed by ID
   */
  getInstagramEmbed(id: number): Observable<SingleInstagramResponse> {
    return this.http.get<SingleInstagramResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get Instagram embeds for specific account
   */
  getInstagramEmbedsByAccount(account: string, limit: number = 10): Observable<InstagramApiResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<InstagramApiResponse>(`${this.baseUrl}/account/${account}`, { params });
  }

  /**
   * ✅ Generate thumbnail URL (if API doesn’t return it)
   */
  getThumbnailUrl(post: InstagramEmbed): string {
    if (post.thumbnail) {
      return post.thumbnail;
    }
    return `https://www.instagram.com/p/${post.post_id}/media/?size=l`;
  }
}
