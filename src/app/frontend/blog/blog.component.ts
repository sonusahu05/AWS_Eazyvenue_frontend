import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  instagramPosts: any[] = [];
  regularPosts: any[] = [];
  categories: any[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  currentPage: number = 1;
  postsPerPage: number = 6;
  loading: boolean = true;
  staticPath: string;
  activeTab: string = 'all';

  // For Instagram-like section

  constructor(
    private bannerService: BannerService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.staticPath = environment.uploadUrl;
    this.loadBlogPosts();

  // Add this debug code temporarily
  setTimeout(() => {
    console.log('Current blogPosts:', this.blogPosts);
    console.log('Featured posts:', this.featuredPosts);
    console.log('Regular posts:', this.regularPosts);
  }, 2000);
  }

  loadBlogPosts() {
    this.loading = true;
    this.bannerService.getBanner('').subscribe(
      (response) => {
        console.log('API Response:', response); // Debug log

        // Handle different response structures
        if (Array.isArray(response)) {
            this.blogPosts = response;
          } else if (response.items && Array.isArray(response.items)) {
            this.blogPosts = response.items;
          } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
            this.blogPosts = response.data.items;
          } else {
            this.blogPosts = [];
            console.error('Unexpected response format:', response);
          }

        console.log('Processed blogPosts:', this.blogPosts); // Debug log

        this.categorizePosts();
        this.extractCategories();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading blog posts:', error);
        this.loading = false;
      }
    );
  }
  categorizePosts() {
    // Ensure blogPosts is an array
    if (!Array.isArray(this.blogPosts)) {
      console.error('blogPosts is not an array:', this.blogPosts);
      this.blogPosts = [];
      return;
    }

    this.featuredPosts = this.blogPosts
      .filter(post => post.post_type === 'featured' && (post.is_published || post.status))
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
      .slice(0, 6);

    this.instagramPosts = this.blogPosts
      .filter(post => post.post_type === 'instagram' && (post.is_published || post.status))
      .sort((a, b) => new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime())
      .slice(0, 9);

    this.regularPosts = this.blogPosts
      .filter(post => (post.post_type === 'regular' || !post.post_type) && (post.is_published || post.status))
      .sort((a, b) => new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime());

    console.log('Categorized posts:', {
      featured: this.featuredPosts.length,
      instagram: this.instagramPosts.length,
      regular: this.regularPosts.length
    });
  }

  extractCategories() {
    const categorySet = new Set();
    this.blogPosts.forEach(post => {
      if (post.category) {
        categorySet.add(post.category);
      }
    });

    this.categories = Array.from(categorySet).map(cat => ({
      id: cat,
      name: this.formatCategoryName(cat as string)
    }));
  }

  formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  }

  getFilteredPosts() {
    let filtered = this.regularPosts;

    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.banner_title.toLowerCase().includes(searchLower) ||
        post.banner_content.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    return filtered.slice(startIndex, startIndex + this.postsPerPage);
  }

  getTotalPages(): number {
    const filtered = this.getFilteredPostsCount();
    return Math.ceil(filtered / this.postsPerPage);
  }

  getFilteredPostsCount(): number {
    let filtered = this.regularPosts;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === this.selectedCategory);
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.banner_title.toLowerCase().includes(searchLower) ||
        post.banner_content.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower)
      );
    }

    return filtered.length;
  }

  setActiveCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page
  }

  onSearch() {
    this.currentPage = 1; // Reset to first page
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  openInstagramPost(instagramUrl: string) {
    if (instagramUrl && isPlatformBrowser(this.platformId)) {
      window.open(instagramUrl, '_blank');
    }
  }

  getPostTags(post: any): string[] {
    return post.tags || [];
  }

  getRelatedPosts(currentPost: any, limit: number = 3): any[] {
    return this.regularPosts
      .filter(post =>
        post.id !== currentPost.id &&
        post.category === currentPost.category
      )
      .slice(0, limit);
  }

  sharePost(post: any, platform: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip sharing on server-side
    }

    const url = encodeURIComponent(window.location.origin + '/blog/' + post.slug);
    const title = encodeURIComponent(post.banner_title);
    const text = encodeURIComponent(post.meta_description || post.banner_content.substring(0, 100));

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title} ${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
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
}