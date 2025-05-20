import { Component, OnInit } from '@angular/core';
import { BannerService } from '../../services/banner.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogPosts: any[] = [];
  featuredPosts: any[] = [];
  loading: boolean = true;
  staticPath: string;
  activeTab: string = 'all';

  // For Instagram-like section
  instagramPosts: any[] = [];

  constructor(
    private bannerService: BannerService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.staticPath = environment.uploadUrl;
    this.loadBlogPosts();
  }

  loadBlogPosts() {
    this.loading = true;
    this.bannerService.getBanner().subscribe(
      (response) => {
        // Access the nested items array in the response
        this.blogPosts = response.data?.items || [];

        // Set featured posts (first 3 active posts)
        this.featuredPosts = this.blogPosts
          .filter(post => post.status)
          .slice(0, 3);

        // Create Instagram-like posts for display (using same data)
        this.createInstagramPosts();

        this.loading = false;
      },
      (error) => {
        console.error('Error loading blog posts:', error);
        this.loading = false;
      }
    );
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/layout/images/no-image.jpg';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Otherwise, prepend the static path
    return this.staticPath + imagePath;
  }

  truncateText(text: string, maxLength: number = 150): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  // Helper method to get unique categories from blog posts (using slug as category)
  getCategories(): any[] {
    const uniqueSlugs = [...new Set(this.blogPosts.map(post => post.slug))];
    return uniqueSlugs.map(slug => ({
      id: slug,
      name: this.formatSlug(slug)
    }));
  }

  formatSlug(slug: string): string {
    if (!slug) return '';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Create Instagram-like posts for the Instagram section
  createInstagramPosts() {
    this.instagramPosts = this.blogPosts
      .filter(post => post.status && post.banner_image?.length)
      .slice(0, 6)
      .map(post => ({
        imageUrl: this.getImageUrl(post.banner_image[0]?.banner_image_src),
        caption: this.truncateText(post.banner_title, 60),
        link: '#', // You can replace with actual post link
        isVideo: false // Can be enhanced with actual video detection
      }));
  }

  // Filter posts by category (slug)
  getFilteredPosts() {
    if (this.activeTab === 'all') {
      return this.blogPosts;
    }
    return this.blogPosts.filter(post => post.slug === this.activeTab);
  }
}