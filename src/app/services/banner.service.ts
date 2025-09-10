import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap, catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

const USER_API = environment.apiUrl;

export interface PostFilter {
  post_type?: string;
  category?: string;
  author?: string;
  is_published?: boolean;
  status?: boolean;
  publish_date?: Date;
  created_at?: Date;
  search?: string;
}

export interface PostListResponse {
  totalCount: number;
  items: any[];
  data: {
    items: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  message?: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Get banners/posts with query parameters
   * SSR-safe with timeout and error handling
   */
  getBanner(query: string = ''): Observable<any> {
    const url = query ? USER_API + "banner" + query : USER_API + "banner";
    return this.http.get(url)
      .pipe(
        timeout(3000), // 3 second timeout for SSR
        tap(
          response => console.log('Banner API response:', response),
          error => console.error('Banner API error:', error)
        ),
        catchError(err => {
          console.error('SSR banner fetch failed:', err?.message || err);
          // Return safe default instead of throwing
          return of({ 
            items: [], 
            data: { items: [], totalCount: 0 },
            message: 'Banner service unavailable',
            success: false 
          });
        })
      );
  }

  /**
   * Get banner list with enhanced filtering and pagination
   * SSR-safe with timeout and error handling
   */
  // getbannerList(query: string = ''): Observable<PostListResponse> {
  //   return this.http.get<PostListResponse>(USER_API + "banner" + query)
  //     .pipe(
  //       timeout(3000), // 3 second timeout for SSR
  //       tap(
  //         response => console.log('Banner list response:', response),
  //         error => console.error('Banner list error:', error)
  //       ),
  //       catchError(err => {
  //         console.error('SSR banner list fetch failed:', err?.message || err);
  //         // Return safe default instead of throwing
  //         return of({
  //           totalCount: 0,
  //           items: [],
  //           data: {
  //             items: [],
  //             totalCount: 0,
  //             currentPage: 1,
  //             totalPages: 0
  //           },
  //           message: 'Banner service unavailable',
  //           success: false
  //         });
  //       })
  //     );
  // }
  getbannerList(query: string = ''): Observable<PostListResponse> {
  return this.http.get<PostListResponse>(USER_API + "banner" + query)
    .pipe(
      timeout(10000), // Increased timeout to 10 seconds
      tap(
        response => console.log('Banner list response:', response),
        error => console.error('Banner list error:', error)
      ),
      catchError(err => {
        console.error('SSR banner list fetch failed:', err?.message || err);
        // Return safe default instead of throwing
        return of({
          totalCount: 0,
          items: [],
          data: {
            items: [],
            totalCount: 0,
            currentPage: 1,
            totalPages: 0
          },
          message: 'Banner service unavailable',
          success: false
        });
      })
    );
}


  /**
   * Get posts with structured filtering
   */
  getPosts(filters: PostFilter = {}, page: number = 1, pageSize: number = 10, sortBy?: string, orderBy?: 'ASC' | 'DESC'): Observable<PostListResponse> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString())
      .set('filterByDisable', 'false');

    // Add filters
    if (filters.post_type) {
      params = params.set('filterByPostType', filters.post_type);
    }
    if (filters.category) {
      params = params.set('filterByCategory', filters.category);
    }
    if (filters.author) {
      params = params.set('filterByAuthor', filters.author);
    }
    if (filters.is_published !== undefined) {
      params = params.set('filterByIsPublished', filters.is_published.toString());
    }
    if (filters.status !== undefined) {
      params = params.set('filterByStatus', filters.status.toString());
    }
    if (filters.search) {
      params = params.set('filterByBannerTitle', filters.search);
    }

    // Add sorting
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<PostListResponse>(USER_API + "banner", { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get single banner/post details
   */
  getBannerDetails(id: string): Observable<any> {
    return this.http.get(USER_API + "banner/" + id)
      .pipe(
        tap(
          response => console.log('Banner details response:', response),
          error => console.error('Banner details error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Add new banner/post
   */
  addBanner(bannerdata: any): Observable<any> {
    // Handle both string and object data
    const data = typeof bannerdata === 'string' ? bannerdata : JSON.stringify(bannerdata);

    return this.http.post(USER_API + 'banner', data, this.httpOptions)
      .pipe(
        tap(
          response => console.log('Add banner response:', response),
          error => console.error('Add banner error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Update banner/post
   */
  updateBanner(id: string, bannerdata: any): Observable<any> {
    // Handle both string and object data
    const data = typeof bannerdata === 'string' ? bannerdata : JSON.stringify(bannerdata);

    return this.http.put(USER_API + 'banner/' + id, data, this.httpOptions)
      .pipe(
        tap(
          response => console.log('Update banner response:', response),
          error => console.error('Update banner error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Delete banner/post (soft delete by setting disable flag)
   */
  deleteBanner(id: string): Observable<any> {
    return this.http.delete(USER_API + 'banner/' + id)
      .pipe(
        tap(
          response => console.log('Delete banner response:', response),
          error => console.error('Delete banner error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Soft delete banner by updating disable flag
   */
  softDeleteBanner(id: string, disable: boolean = true): Observable<any> {
    const data = JSON.stringify({ disable: disable });
    return this.updateBanner(id, data);
  }

  /**
   * Duplicate a banner/post
   */
  duplicateBanner(bannerId: string): Observable<any> {
    return this.http.post(USER_API + 'banner/' + bannerId + '/duplicate', {}, this.httpOptions)
      .pipe(
        tap(
          response => console.log('Duplicate banner response:', response),
          error => console.error('Duplicate banner error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Get all banner lists (simple list without pagination)
   */
  getBannerLists(): Observable<any[]> {
    return this.http.get<any[]>(USER_API + 'banner?simple=true')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get post types
   */
  getPostTypes(): Observable<any[]> {
    return this.http.get<any[]>(USER_API + 'banner/post-types')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get categories
   */
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(USER_API + 'banner/categories')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get available tags
   */
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(USER_API + 'banner/tags')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get featured posts
   */
  getFeaturedPosts(): Observable<any[]> {
    return this.http.get<any[]>(USER_API + 'banner?filterByPostType=featured&filterByIsPublished=true')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update featured order
   */
  updateFeaturedOrder(id: string, order: number): Observable<any> {
    const data = JSON.stringify({ featured_order: order });
    return this.updateBanner(id, data);
  }

  /**
   * Publish/Unpublish post
   */
  togglePublishStatus(id: string, isPublished: boolean): Observable<any> {
    const data = JSON.stringify({ is_published: isPublished });
    return this.updateBanner(id, data);
  }

  /**
   * Schedule post for future publishing
   */
  schedulePost(id: string, publishDate: Date): Observable<any> {
    const data = JSON.stringify({
      publish_date: publishDate.toISOString(),
      is_published: false
    });
    return this.updateBanner(id, data);
  }

  /**
   * Get statistics for dashboard
   */
  getPostStatistics(): Observable<any> {
    return this.http.get(USER_API + 'banner/statistics')
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload images for banner/post
   */
  uploadImages(files: FormData): Observable<any> {
    return this.http.post(USER_API + 'upload/banner-images', files)
      .pipe(
        tap(
          response => console.log('Upload images response:', response),
          error => console.error('Upload images error:', error)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Generate slug from title
   */
  generateSlug(title: string): Observable<{ slug: string }> {
    return this.http.post<{ slug: string }>(USER_API + 'banner/generate-slug', { title }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate Instagram URL
   */
  validateInstagramUrl(url: string): Observable<{ valid: boolean; data?: any }> {
    return this.http.post<{ valid: boolean; data?: any }>(
      USER_API + 'banner/validate-instagram',
      { url },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get SEO suggestions
   */
  getSeoSuggestions(content: string, title: string): Observable<any> {
    return this.http.post(USER_API + 'banner/seo-suggestions',
      { content, title },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    console.error('BannerService Error:', error);

    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.statusText}`;
      }
    }

    return throwError(errorMessage);
  }
}
