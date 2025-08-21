// import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { BannerService } from '../../services/banner.service';
// import { environment } from 'src/environments/environment';
// import { DomSanitizer } from '@angular/platform-browser';

// @Component({
//   selector: 'app-blog',
//   templateUrl: './blog.component.html',
//   styleUrls: ['./blog.component.scss']
// })
// export class BlogComponent implements OnInit {
//   blogPosts: any[] = [];
//   featuredPosts: any[] = [];
//   instagramPosts: any[] = [];
//   regularPosts: any[] = [];
//   categories: any[] = [];
//   selectedCategory: string = 'all';
//   searchTerm: string = '';
//   currentPage: number = 1;
//   postsPerPage: number = 6;
//   loading: boolean = true;
//   staticPath: string;
//   activeTab: string = 'all';

//   // For Instagram-like section

//   constructor(
//     private bannerService: BannerService,
//     private sanitizer: DomSanitizer,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) { }

//   ngOnInit() {
//     this.staticPath = environment.uploadUrl;
//     this.loadBlogPosts();

//   // Add this debug code temporarily
//   setTimeout(() => {
//     console.log('Current blogPosts:', this.blogPosts);
//     console.log('Featured posts:', this.featuredPosts);
//     console.log('Regular posts:', this.regularPosts);
//   }, 2000);
//   }

//   loadBlogPosts() {
//     this.loading = true;
//     this.bannerService.getBanner('').subscribe(
//       (response) => {
//         console.log('API Response:', response); // Debug log

//         // Handle different response structures
//         if (Array.isArray(response)) {
//             this.blogPosts = response;
//           } else if (response.items && Array.isArray(response.items)) {
//             this.blogPosts = response.items;
//           } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
//             this.blogPosts = response.data.items;
//           } else {
//             this.blogPosts = [];
//             console.error('Unexpected response format:', response);
//           }

//         console.log('Processed blogPosts:', this.blogPosts); // Debug log

//         this.categorizePosts();
//         this.extractCategories();
//         this.loading = false;
//       },
//       (error) => {
//         console.error('Error loading blog posts:', error);
//         this.loading = false;
//       }
//     );
//   }
//   categorizePosts() {
//     // Ensure blogPosts is an array
//     if (!Array.isArray(this.blogPosts)) {
//       console.error('blogPosts is not an array:', this.blogPosts);
//       this.blogPosts = [];
//       return;
//     }

//     this.featuredPosts = this.blogPosts
//       .filter(post => post.post_type === 'featured' && (post.is_published || post.status))
//       .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
//       .slice(0, 6);

//     this.instagramPosts = this.blogPosts
//       .filter(post => post.post_type === 'instagram' && (post.is_published || post.status))
//       .sort((a, b) => new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime())
//       .slice(0, 9);

//     this.regularPosts = this.blogPosts
//       .filter(post => (post.post_type === 'regular' || !post.post_type) && (post.is_published || post.status))
//       .sort((a, b) => new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime());

//     console.log('Categorized posts:', {
//       featured: this.featuredPosts.length,
//       instagram: this.instagramPosts.length,
//       regular: this.regularPosts.length
//     });
//   }

//   extractCategories() {
//     const categorySet = new Set();
//     this.blogPosts.forEach(post => {
//       if (post.category) {
//         categorySet.add(post.category);
//       }
//     });

//     this.categories = Array.from(categorySet).map(cat => ({
//       id: cat,
//       name: this.formatCategoryName(cat as string)
//     }));
//   }

//   formatCategoryName(category: string): string {
//     return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
//   }

//   getFilteredPosts() {
//     let filtered = this.regularPosts;

//     // Apply category filter
//     if (this.selectedCategory !== 'all') {
//       filtered = filtered.filter(post => post.category === this.selectedCategory);
//     }

//     // Apply search filter
//     if (this.searchTerm) {
//       const searchLower = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(post =>
//         post.banner_title.toLowerCase().includes(searchLower) ||
//         post.banner_content.toLowerCase().includes(searchLower) ||
//         post.author.toLowerCase().includes(searchLower) ||
//         (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
//       );
//     }

//     // Apply pagination
//     const startIndex = (this.currentPage - 1) * this.postsPerPage;
//     return filtered.slice(startIndex, startIndex + this.postsPerPage);
//   }

//   getTotalPages(): number {
//     const filtered = this.getFilteredPostsCount();
//     return Math.ceil(filtered / this.postsPerPage);
//   }

//   getFilteredPostsCount(): number {
//     let filtered = this.regularPosts;

//     if (this.selectedCategory !== 'all') {
//       filtered = filtered.filter(post => post.category === this.selectedCategory);
//     }

//     if (this.searchTerm) {
//       const searchLower = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(post =>
//         post.banner_title.toLowerCase().includes(searchLower) ||
//         post.banner_content.toLowerCase().includes(searchLower) ||
//         post.author.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered.length;
//   }

//   setActiveCategory(category: string) {
//     this.selectedCategory = category;
//     this.currentPage = 1; // Reset to first page
//   }

//   onSearch() {
//     this.currentPage = 1; // Reset to first page
//   }

//   nextPage() {
//     if (this.currentPage < this.getTotalPages()) {
//       this.currentPage++;
//     }
//   }

//   prevPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   goToPage(page: number) {
//     this.currentPage = page;
//   }

//   openInstagramPost(instagramUrl: string) {
//     if (instagramUrl && isPlatformBrowser(this.platformId)) {
//       window.open(instagramUrl, '_blank');
//     }
//   }

//   getPostTags(post: any): string[] {
//     return post.tags || [];
//   }

//   getRelatedPosts(currentPost: any, limit: number = 3): any[] {
//     return this.regularPosts
//       .filter(post =>
//         post.id !== currentPost.id &&
//         post.category === currentPost.category
//       )
//       .slice(0, limit);
//   }

//   sharePost(post: any, platform: string) {
//     if (!isPlatformBrowser(this.platformId)) {
//       return; // Skip sharing on server-side
//     }

//     const url = encodeURIComponent(window.location.origin + '/blog/' + post.slug);
//     const title = encodeURIComponent(post.banner_title);
//     const text = encodeURIComponent(post.meta_description || post.banner_content.substring(0, 100));

//     let shareUrl = '';

//     switch (platform) {
//       case 'facebook':
//         shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
//         break;
//       case 'twitter':
//         shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
//         break;
//       case 'linkedin':
//         shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
//         break;
//       case 'whatsapp':
//         shareUrl = `https://wa.me/?text=${title} ${url}`;
//         break;
//     }

//     if (shareUrl) {
//       window.open(shareUrl, '_blank', 'width=600,height=400');
//     }
//   }

//   getImageUrl(imagePath: string): string {
//     if (!imagePath) return 'assets/layout/images/no-image.jpg';

//     if (imagePath.startsWith('http')) {
//       return imagePath;
//     }

//     // Otherwise, prepend the static path
//     return this.staticPath + imagePath;
//   }

//   truncateText(text: string, maxLength: number = 150): string {
//     if (!text) return '';
//     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
//   }

//   setActiveTab(tabId: string) {
//     this.activeTab = tabId;
//   }

//   // Helper method to get unique categories from blog posts (using slug as category)
//   getCategories(): any[] {
//     const uniqueSlugs = [...new Set(this.blogPosts.map(post => post.slug))];
//     return uniqueSlugs.map(slug => ({
//       id: slug,
//       name: this.formatSlug(slug)
//     }));
//   }

//   formatSlug(slug: string): string {
//     if (!slug) return '';
//     return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   }

//   // Create Instagram-like posts for the Instagram section
//   createInstagramPosts() {
//     this.instagramPosts = this.blogPosts
//       .filter(post => post.status && post.banner_image?.length)
//       .slice(0, 6)
//       .map(post => ({
//         imageUrl: this.getImageUrl(post.banner_image[0]?.banner_image_src),
//         caption: this.truncateText(post.banner_title, 60),
//         link: '#', // You can replace with actual post link
//         isVideo: false // Can be enhanced with actual video detection
//       }));
//   }

//   // Filter posts by category (slug)
// }


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-blog',
//   templateUrl: './blog.component.html',
//   styleUrls: ['./blog.component.scss']
// })
// export class BlogComponent {
//   blogPosts = [
//     {
//       title: 'How to Plan a Perfect Wedding',
//       category: 'Weddings',
//       date: 'Jul 11, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Planning a wedding is exciting but requires careful preparation. Learn how to organize your perfect day...',
//       fullContent: 'Full content goes here. Wedding planning involves multiple stages like selecting a venue, booking vendors, and making sure everything is well coordinated on the big day. Learn more about it here...',
//       tags: ['trending', 'new'],
//       author: 'Adil Pathan',
//       imageUrl: 'https://images.pexels.com/photos/32994468/pexels-photo-32994468.jpeg'
//     },
//     {
//       title: 'Choosing the Right Venue for Your Event',
//       category: 'Events',
//       date: 'May 22, 2025',
//       readingTime: '3 min read',
//       excerpt: 'Selecting the perfect venue is one of the most critical steps in planning your event. Here’s how to choose the best one...',
//       fullContent: 'Full content goes here. The right venue makes a big difference. When selecting a venue, you should consider your event type, guest count, location, and budget. Learn more about the process here...',
//       tags: ['sponsored', 'new'],
//       author: 'Ravi Sharma',
//       imageUrl: 'https://images.pexels.com/photos/33417235/pexels-photo-33417235.jpeg'
//     },
//     {
//       title: 'Wedding Trends for 2025',
//       category: 'Weddings',
//       date: 'Jun 5, 2025',
//       readingTime: '6 min read',
//       excerpt: 'Wedding trends are constantly evolving. Here are some things to expect in 2025, from decor to attire...',
//       fullContent: 'Full content goes here. In 2025, expect to see a shift in wedding themes, attire, and more sustainable options for brides and grooms. Learn the top trends here...',
//       tags: ['popular', 'new'],
//       author: 'Sonia Kapoor',
//       imageUrl: 'https://images.pexels.com/photos/32854444/pexels-photo-32854444.jpeg'
//     },
//     {
//       title: 'Event Planning on a Budget',
//       category: 'Events',
//       date: 'Mar 18, 2025',
//       readingTime: '4 min read',
//       excerpt: 'Hosting an event without breaking the bank is possible with these tips. Learn how to save money while planning your next event...',
//       fullContent: 'Full content goes here. Event planning doesn’t have to be expensive. With the right tips and tools, you can create a memorable event without going over budget. Here’s how...',
//       tags: ['trending'],
//       author: 'Anil Verma',
//       imageUrl: 'https://images.pexels.com/photos/6863331/pexels-photo-6863331.jpeg'
//     },
//     {
//       title: 'How to Make Your Wedding Special',
//       category: 'Weddings',
//       date: 'Aug 10, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Your wedding should reflect your unique style. Here’s how to make it memorable and special...',
//       fullContent: 'Full content goes here. Every couple has a unique love story, and your wedding should reflect that. From personalized decor to special moments, here are ideas to make your wedding unforgettable...',
//       tags: ['exclusive', 'popular'],
//       author: 'Maya Singh',
//       imageUrl: 'https://images.pexels.com/photos/3339117/pexels-photo-3339117.jpeg'
//     },
//     {
//       title: 'The Best Wedding Photography Tips',
//       category: 'Weddings',
//       date: 'Sep 1, 2025',
//       readingTime: '3 min read',
//       excerpt: 'Capturing the best moments of your wedding can be tricky. Here are some tips for great wedding photography...',
//       fullContent: 'Full content goes here. Wedding photography is one of the most important aspects of the event. To capture timeless memories, here are the best tips for brides and grooms...',
//       tags: ['popular'],
//       author: 'Rajeev Joshi',
//       imageUrl: 'https://images.pexels.com/photos/136422/pexels-photo-136422.jpeg'
//     },
//     {
//       title: 'Venue Selection for Corporate Events',
//       category: 'Corporate',
//       date: 'Jul 21, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Choosing the right venue for corporate events can make a huge difference. Learn how to select a venue that fits your business event...',
//       fullContent: 'Full content goes here. Selecting a corporate venue requires considering factors like the number of attendees, location, amenities, and cost. Here’s a guide to help you choose the best venue...',
//       tags: ['sponsored'],
//       author: 'Alok Kumar',
//       imageUrl: 'https://images.pexels.com/photos/7648043/pexels-photo-7648043.jpeg'
//     },
//     {
//       title: 'Destination Weddings: What You Need to Know',
//       category: 'Weddings',
//       date: 'Jan 5, 2025',
//       readingTime: '7 min read',
//       excerpt: 'Thinking about a destination wedding? Here’s everything you need to consider before you start planning...',
//       fullContent: 'Full content goes here. Destination weddings are becoming more popular. From choosing the right location to understanding the logistics, here’s what you need to know before booking your dream destination wedding...',
//       tags: ['new', 'trending'],
//       author: 'Shreya Patel',
//       imageUrl: 'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg'
//     },
//     {
//       title: 'The Benefits of Hiring an Event Planner',
//       category: 'Events',
//       date: 'May 11, 2025',
//       readingTime: '4 min read',
//       excerpt: 'Event planners can save you time and effort. Here’s how they make your event easier to organize...',
//       fullContent: 'Full content goes here. Event planners have a wealth of experience and connections. Here’s how hiring one can help streamline the process and make your event more successful...',
//       tags: ['sponsored'],
//       author: 'Neha Mishra',
//       imageUrl: 'https://images.pexels.com/photos/811572/pexels-photo-811572.jpeg'
//     },
//     {
//       title: 'Top Wedding Catering Trends for 2025',
//       category: 'Weddings',
//       date: 'Dec 10, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Food is an essential part of any wedding. Check out the latest catering trends for 2025...',
//       fullContent: 'Full content goes here. Wedding catering trends are constantly changing. In 2025, couples will demand more diverse and sustainable catering options. Learn more about the top trends in wedding catering...',
//       tags: ['trending', 'new'],
//       author: 'Adil Pathan',
//       imageUrl: 'https://images.pexels.com/photos/57980/pexels-photo-57980.jpeg'
//     },
//     {
//       title: 'How to Choose the Perfect Wedding Dress',
//       category: 'Weddings',
//       date: 'Oct 1, 2025',
//       readingTime: '6 min read',
//       excerpt: 'Choosing the right wedding dress can be overwhelming. Here are some tips to help you find the perfect one...',
//       fullContent: 'Full content goes here. The perfect wedding dress is a reflection of your personality. From classic to contemporary, here are some tips to help you pick the perfect dress for your big day...',
//       tags: ['trending', 'exclusive'],
//       author: 'Priya Sharma',
//       imageUrl: 'https://images.pexels.com/photos/1566435/pexels-photo-1566435.jpeg'
//     },
    
//     // 2. Additional Blog Post
//     {
//       title: 'Creative Wedding Decor Ideas for 2025',
//       category: 'Weddings',
//       date: 'Nov 15, 2025',
//       readingTime: '4 min read',
//       excerpt: 'Looking for fresh and unique wedding decor ideas? Here are some of the most creative ideas for your 2025 wedding...',
//       fullContent: 'Full content goes here. Wedding decor is a big part of the event. From floral arrangements to lighting setups, here are some creative wedding decor ideas that will wow your guests...',
//       tags: ['new', 'creative'],
//       author: 'Neha Singh',
//       imageUrl: 'https://images.pexels.com/photos/11503477/pexels-photo-11503477.jpeg'
//     },

//     // 3. Additional Blog Post
//     {
//       title: 'How to Plan a Corporate Event on a Budget',
//       category: 'Corporate',
//       date: 'Feb 14, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Planning a corporate event on a budget doesn’t have to mean sacrificing quality. Learn how to make the most of your budget...',
//       fullContent: 'Full content goes here. Planning a corporate event can be tricky, especially when you have a tight budget. Here are some tips to help you organize a successful event without breaking the bank...',
//       tags: ['sponsored', 'budget'],
//       author: 'Amit Verma',
//       imageUrl: 'https://images.pexels.com/photos/1181311/pexels-photo-1181311.jpeg'
//     },

//     // 4. Additional Blog Post
//     {
//       title: 'Tips for a Stress-Free Wedding Day',
//       category: 'Weddings',
//       date: 'Sep 20, 2025',
//       readingTime: '4 min read',
//       excerpt: 'Your wedding day should be one of the happiest days of your life. Here’s how to make sure it’s stress-free...',
//       fullContent: 'Full content goes here. Weddings can be stressful, but with the right planning, you can avoid common pitfalls. Here are some tips for keeping your big day calm and enjoyable...',
//       tags: ['tips', 'stress-free'],
//       author: 'Alok Kumar',
//       imageUrl: 'https://images.pexels.com/photos/7232828/pexels-photo-7232828.jpeg'
//     },

//     // 5. Additional Blog Post
//     {
//       title: '5 Ways to Enhance Your Event with Technology',
//       category: 'Events',
//       date: 'Oct 25, 2025',
//       readingTime: '5 min read',
//       excerpt: 'Technology can help make your event memorable. Here are 5 ways to incorporate tech into your next event...',
//       fullContent: 'Full content goes here. From virtual reality to event apps, there are many ways to enhance your event using technology. Here’s how to integrate the latest tech trends into your event planning...',
//       tags: ['technology', 'events'],
//       author: 'Simran Kaur',
//       imageUrl: 'https://images.pexels.com/photos/6249821/pexels-photo-6249821.jpeg'
//     }
//   ];
// }


import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BannerService, PostFilter, PostListResponse } from '../../services/banner.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  allPosts: any[] = [];
  featuredPosts: any[] = [];
  instagramPosts: any[] = [];
  regularPosts: any[] = [];
  loading: boolean = true;
  activeTab: string = 'all';
  showCreateForm: boolean = false;
  error: string = '';
  categories: any[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  currentPage: number = 1;
  postsPerPage: number = 6;
  totalPosts: number = 0;
  totalPages: number = 0;
  selectedPost: any = null; // For showing full post content
  newPost: any = {
    title: '',
    category: 'general',
    content: '',
    imageBase64: null,
    linkedin_url: '',
    twitter_url: ''
  };
  selectedFile: File | null = null;
  loggedInUser: string = 'Admin';
  staticPath: string;

  // Added the default image URLs as requested
  defaultImageUrls: string[] = [
    //'https://images.pexels.com/photos/6863331/pexels-photo-6863331.jpeg',
    //'https://images.pexels.com/photos/32854444/pexels-photo-32854444.jpeg',
    // 'https://images.pexels.com/photos/3339117/pexels-photo-3339117.jpeg',
    'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg',
    // 'https://images.pexels.com/photos/811572/pexels-photo-811572.jpeg',
    // 'https://images.pexels.com/photos/57980/pexels-photo-57980.jpeg',
    // 'https://images.pexels.com/photos/11503477/pexels-photo-11503477.jpeg',
    // 'https://images.pexels.com/photos/1181311/pexels-photo-1181311.jpeg'
  ];

  constructor(
    private bannerService: BannerService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.staticPath = environment.uploadUrl;
  }

  ngOnInit() {
    this.loadBlogPosts();
  }

  loadBlogPosts() {
    this.loading = true;
    this.error = '';
    const filters: PostFilter = { is_published: true, status: true };

    this.bannerService.getPosts(filters, 1, 100, 'created_at', 'DESC').pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (response: PostListResponse) => {
        if (response && Array.isArray(response.items)) {
          this.allPosts = response.items;
          this.totalPosts = response.totalCount;
          this.categorizePosts();
          if (this.allPosts.length === 0) {
            this.error = 'No blog posts found.';
          }
        } else {
          // ... (rest of the block)
        }
        
        this.loadCategories(); 

      },
      error: (err) => {
        this.error = err.message || 'Failed to load blog posts. Please try again.';
        this.allPosts = [];
        this.totalPosts = 0;

        this.loadCategories();
      }
    });
  }

  loadCategories() {
    this.bannerService.getCategories().subscribe({
      next: (categories: any[]) => {
        if (Array.isArray(categories)) {
          this.categories = categories.map(cat => ({
            id: cat.id || cat.name || cat,
            name: cat.name || this.formatCategoryName(cat.id || cat)
          }));
        } else {
          this.extractCategoriesFromPosts();
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.extractCategoriesFromPosts();
      }
    });
  }

  categorizePosts() {
    if (!Array.isArray(this.allPosts)) return;
    this.featuredPosts = this.allPosts
      .filter(p => p && p.post_type === 'featured')
      .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))
      .slice(0, 5);
    this.instagramPosts = this.allPosts
      .filter(p => p && p.post_type === 'instagram')
      .sort((a, b) => new Date(b.publish_date || b.created_at || 0).getTime() - new Date(a.publish_date || a.created_at || 0).getTime())
      .slice(0, 12);
    this.regularPosts = this.allPosts
      .filter(p => p && (p.post_type === 'regular' || !p.post_type))
      .sort((a, b) => new Date(b.publish_date || b.created_at || 0).getTime() - new Date(a.publish_date || a.created_at || 0).getTime());
  }

  extractCategoriesFromPosts() {
    if (!Array.isArray(this.allPosts)) return;
    const categoryNames = [...new Set(this.allPosts.map(p => p?.category).filter(Boolean))];
    this.categories = categoryNames.map(name => ({ id: name, name: this.formatCategoryName(name) }));
  }
   /**
   * Opens the full post view in a modal overlay
   * @param post The post to display in full
   */
  openFullPost(post: any): void {
    this.selectedPost = post;
    // Prevent body scrolling when modal is open
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }
  
  /**
   * Closes the full post view
   */
  closeFullPost(): void {
    this.selectedPost = null;
    // Re-enable body scrolling
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.newPost.imageBase64 = reader.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  createPost() {
    if (!this.newPost.title?.trim() || !this.newPost.category?.trim() || !this.newPost.content?.trim() || !this.newPost.imageBase64) {
      alert('Please fill all fields and upload an image.');
      return;
    }
    const postPayload = {
      banner_title: this.newPost.title.trim(),
      category: this.newPost.category,
      banner_content: this.newPost.content.trim(),
      author: this.loggedInUser,
      post_type: 'regular',
      status: true,
      is_published: true,
      slug: this.generateSlug(this.newPost.title),
      publish_date: new Date().toISOString(),
      banner_images: [{ file: this.newPost.imageBase64, alt: this.newPost.title.trim(), default: true }],
      linkedin_url: this.newPost.linkedin_url?.trim(),
      twitter_url: this.newPost.twitter_url?.trim()
    };
    this.bannerService.addBanner(postPayload).subscribe({
      next: (res: any) => {
        alert('Blog post created successfully!');
        this.loadBlogPosts();
        this.resetAndHideForm();
      },
      error: (err) => {
        alert(err.message || 'Failed to create blog post.');
      }
    });
  }

  generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  resetAndHideForm() {
    this.newPost = { 
        title: '', 
        category: 'general', 
        content: '', 
        imageBase64: null,
        linkedin_url: '',
        twitter_url: ''
    };
    this.selectedFile = null;
    this.showCreateForm = false;
  }

  getFilteredPosts(): any[] {
    if (!Array.isArray(this.regularPosts)) return [];
    let filtered = [...this.regularPosts];
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p?.category === this.selectedCategory);
    }
    if (this.searchTerm?.trim()) {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p?.banner_title?.toLowerCase().includes(lowerCaseSearch) ||
        p?.banner_content?.toLowerCase().includes(lowerCaseSearch)
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.postsPerPage);
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    return filtered.slice(startIndex, startIndex + this.postsPerPage);
  }

  getTotalPages(): number {
    return this.totalPages;
  }

  setActiveCategory(categoryValue: string) {
    this.selectedCategory = categoryValue;
    this.currentPage = 1;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  onSearch() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
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

  // Updated getImageUrl to use a random default image
  getImageUrl(post: any): string {
    if (post && Array.isArray(post.banner_image) && post.banner_image.length > 0 && post.banner_image[0]?.banner_image_src) {
      return post.banner_image[0].banner_image_src;
    }
    return this.getRandomDefaultImage();
  }
  
  // Helper method to get a random image from the default list
  getRandomDefaultImage(): string {
    if (!this.defaultImageUrls || this.defaultImageUrls.length === 0) {
      return 'assets/layout/images/no-image.jpg'; // Ultimate fallback
    }
    const randomIndex = Math.floor(Math.random() * this.defaultImageUrls.length);
    return this.defaultImageUrls[randomIndex];
  }

  formatCategoryName(category: string): string {
    if (!category) return 'General';
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  truncateText(text: string, maxLength: number = 120): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }


  openInstagramPost(url: string): void {
    if (url && isPlatformBrowser(this.platformId)) {
      console.log(`Opening Instagram URL: ${url}`);
      window.open(url, '_blank');
    }
  }

  getPostTags(post: any): string[] {
    if (post && post.tags) {
      if (Array.isArray(post.tags)) {
        return post.tags;
      }
      if (typeof post.tags === 'string') {
        return post.tags.split(',').map(tag => tag.trim());
      }
    }
    return [];
  }
  /**
  * Shares a post on social media platforms.
  * @param post The post to share.
  * @param platform The social media platform.
  */
  sharePost(post: any, platform: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const url = encodeURIComponent(window.location.href);
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
}