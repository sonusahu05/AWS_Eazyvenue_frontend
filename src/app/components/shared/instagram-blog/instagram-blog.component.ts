import { Component, OnInit, OnDestroy, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InstagramService, InstagramEmbed } from '../../../services/instagram.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-instagram-blog',
  templateUrl: './instagram-blog.component.html',
  styleUrls: ['./instagram-blog.component.scss']
})
export class InstagramBlogComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() limit: number = 6;
  @Input() account: string = 'eazyvenue';
  @Input() showTitle: boolean = true;
  @Input() gridColumns: number = 3; // 2, 3, or 4 columns

  instagramPosts: InstagramEmbed[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private instagramService: InstagramService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadInstagramPosts();
  }

  ngAfterViewInit(): void {
    // Load Instagram script after view is initialized
    if (isPlatformBrowser(this.platformId)) {
      this.instagramService.loadInstagramScript();
      
      // Process embeds after a short delay to ensure content is rendered
      setTimeout(() => {
        this.instagramService.processEmbeds();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadInstagramPosts(): void {
    this.loading = true;
    this.error = null;

    if (this.account) {
      // Load posts for specific account
      this.instagramService.getInstagramEmbedsByAccount(this.account, this.limit)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.instagramPosts = response.data;
            } else {
              this.error = 'Failed to load Instagram posts';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading Instagram posts:', error);
            this.error = 'Failed to load Instagram posts';
            this.loading = false;
          }
        });
    } else {
      // Load all posts
      this.instagramService.getInstagramEmbeds(this.limit)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.instagramPosts = response.data;
            } else {
              this.error = 'Failed to load Instagram posts';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading Instagram posts:', error);
            this.error = 'Failed to load Instagram posts';
            this.loading = false;
          }
        });
    }
  }

  getSafeHtml(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  refreshPosts(): void {
    this.loadInstagramPosts();
  }

  getGridClass(): string {
    switch (this.gridColumns) {
      case 2:
        return 'col-lg-6 col-md-6';
      case 3:
        return 'col-lg-4 col-md-6';
      case 4:
        return 'col-lg-3 col-md-6';
      default:
        return 'col-lg-4 col-md-6';
    }
  }

  onPostClick(post: InstagramEmbed): void {
    // Optional: Track analytics or perform actions when post is clicked
    console.log('Instagram post clicked:', post.title);
  }

  trackByPostId(index: number, post: InstagramEmbed): number {
    return post.id;
  }
}
