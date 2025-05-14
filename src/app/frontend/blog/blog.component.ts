import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface DestinationVenue {
  name: string;
  link: string;
}

interface WeddingDestination {
  id: string;
  name: string;
  description: string;
  whyChoose: string;
  imageUrl: string;
  venues: DestinationVenue[];
  idealFor: string;
}

interface InstagramPost {
  id: number;
  imageUrl: string;
  link: string;
  isVideo: boolean;
  caption: string;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
    activeTab: string = 'all';
    featuredVideoUrl: SafeResourceUrl;
    instagramPosts: InstagramPost[] = [];
    latestVideo: InstagramPost | null = null;

    destinations: WeddingDestination[] = [
      {
        id: 'lonavala',
        name: 'Lonavala',
        description: 'Just a 2-hour drive from Mumbai and Pune, Lonavala offers breathtaking hill views, pleasant weather, and a range of budget resorts perfect for intimate destination weddings.',
        whyChoose: 'The Hillside Escape',
        imageUrl: 'assets/img/blog/blog4.jpg',
        venues: [
          { name: 'Ikshana Resort', link: 'https://ikshanaresort.com' },
          { name: 'Radisson Resort', link: 'https://radissonhotels.com/lonavala' },
          { name: 'Cloud 9 Hills Resort', link: 'https://cloud9hillsresort.com' }
        ],
        idealFor: 'Nature-themed weddings, pre-wedding photoshoots, and cozy functions.'
      },
      {
        id: 'nashik',
        name: 'Nashik',
        description: 'Known as the wine capital of India, Nashik is a trendy yet affordable wedding destination offering vineyard backdrops and modern resorts.',
        whyChoose: 'The Vineyard Wedding Experience',
        imageUrl: 'assets/img/blog/blog3.jpg',
        venues: [
          { name: 'Rainforest Resort', link: 'https://rainforestresort.in' },
          { name: 'Touchwoord Bliss', link: 'https://touchwoodbliss.com' },
          { name: 'Sula Beyond Vineyard Resort', link: 'https://sulawines.com/beyond' }
        ],
        idealFor: 'Boho vineyard weddings, mehendi pool parties, and cocktail nights.'
      },
      {
        id: 'alibaug',
        name: 'Alibaug',
        description: 'Only a ferry ride from Mumbai, Alibaug gives you the beach vibes without Goa-level pricing.',
        whyChoose: 'Beachside on a Budget',
        imageUrl: 'assets/img/blog/blog2.jpg',
        venues: [
          { name: 'U Tropicana Alibaug', link: 'https://utropicanaalibaug.com' },
          { name: 'Radisson Blu', link: 'https://radissonhotels.com/alibaug' }
        ],
        idealFor: 'Sundowner weddings, beach pheras, and relaxed seaside celebrations.'
      },
      {
        id: 'igatpuri',
        name: 'Igatpuri',
        description: 'If you\'re looking for stunning mountain backdrops and luxurious-yet-affordable resorts, Igatpuri is a rising star.',
        whyChoose: 'Tranquility with a View',
        imageUrl: 'assets/img/blog/blog1.jpg',
        venues: [
          { name: 'GP farm', link: 'https://gpfarm.co.in' },
          { name: 'Radisson Igatpuri', link: 'https://radissonhotels.com/igatpuri' },
          { name: 'Fern Igatpuri', link: 'https://fernigatpuri.com' }
        ],
        idealFor: 'Cozy hilltop ceremonies and wellness-style wedding experiences.'
      }
    ];


    constructor(private sanitizer: DomSanitizer) {
      // Sanitize YouTube URL
      this.featuredVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/YOUR_VIDEO_ID');

      // Fetch Instagram posts (this would typically come from an Instagram API)
      this.fetchInstagramPosts();
    }

    ngOnInit(): void {
    }

    setActiveTab(tab: string): void {
      this.activeTab = tab;
    }

    fetchInstagramPosts(): void {
      // This would typically be an API call to your Instagram feed
      // For demo purposes, we're creating mock data
      this.instagramPosts = [
        {
          id: 1,
          imageUrl: 'assets/img/blog/5.jpg',
          link: 'https://www.instagram.com/reel/DJYajLYyhtr/?igsh=MW1nNzc5MjkzY240dw==',
          isVideo: false,
          caption: 'Stunning decor ideas for your budget wedding'
        },
        {
          id: 2,
          imageUrl: 'assets/img/blog/2.jpg',
          link: 'https://www.instagram.com/reel/DIf8rqrSFJ9/?igsh=OHVtMWR6YjA5d2p5',
          isVideo: true,
          caption: 'Tour of our latest wedding venue in Lonavala'
        },
        {
          id: 3,
          imageUrl: 'assets/img/blog/3.jpg',
          link: 'https://www.instagram.com/reel/DINySP_S0uq/?igsh=MWtkMjN2cnFmeTN2ag==',
          isVideo: false,
          caption: 'Breathtaking mountain wedding in Igatpuri'
        },
        {
          id: 4,
          imageUrl: 'assets/img/blog/4.jpg',
          link: 'https://www.instagram.com/reel/CxGXcuhofiz/?igsh=MXdsbjVranp3Mmlrbg==',
          isVideo: false,
          caption: 'Beach wedding setup in Alibaug'
        },
      ];

      // Set the latest video
      const videos = this.instagramPosts.filter(post => post.isVideo);
      if (videos.length > 0) {
        this.latestVideo = videos[0];
      }
    }
  }