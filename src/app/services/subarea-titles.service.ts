import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class SubareaSpecificTitlesService {
    private subareaSpecificTitles = {
      'malad': {
        baseTitle: 'Discover Exceptional Banquet Halls in Malad\'s Vibrant Locale',
        baseDescription: 'Explore a curated selection of stunning banquet halls in Malad. From intimate gatherings to grand celebrations, find the perfect venue that matches your event\'s unique style and requirements.',
        occasionTemplate: 'Best {occasion} Banquet Halls in Malad'
      },
      'powai': {
        baseTitle: 'Premium Banquet Halls in Powai\'s Tech and Leisure Hub',
        baseDescription: 'Uncover elegant banquet halls in Powai, blending modern amenities with sophisticated spaces. Ideal for weddings, corporate events, and special celebrations in Mumbai\'s most dynamic neighborhood.',
        occasionTemplate: 'Best Banquet Halls in Powai for Weddings'
      },
      'bandra': {
        baseTitle: 'Stylish Banquet Halls in the Trendy Bandra Locale',
        baseDescription: 'Discover chic and luxurious banquet halls in Bandra, known for its vibrant atmosphere and sophisticated venues. Perfect for creating memorable events in one of Mumbai\'s most iconic areas.',
        occasionTemplate: 'Premier {occasion} Spaces in Bandra'
      },
      'andheri': {
        baseTitle: 'Top-Rated Banquet Halls in Andheri\'s Versatile Landscape',
        baseDescription: 'Find the most versatile and well-equipped banquet halls in Andheri. From corporate events to grand weddings, our curated list offers spaces that cater to every occasion and style.',
        occasionTemplate: 'Best Banquet Halls in Andheri'
      },
      'juhu': {
        baseTitle: 'Exclusive Banquet Halls in the Iconic Juhu Area',
        baseDescription: 'Experience premium banquet halls in Juhu, blending luxury, convenience, and breathtaking ambiance. Ideal for those seeking a remarkable venue in one of Mumbai\'s most prestigious neighborhoods.',
        occasionTemplate: 'Explore Banquet Halls in Juhu for Events'
      },
      'default': {
        baseTitle: 'Explore The Top Banquet Halls',
        baseDescription: 'Explore exquisite banquet halls near you for weddings, parties, and corporate events. EazyVenue.com offers a curated selection of premier event spaces, blending sophistication and charm.',
        occasionTemplate: 'List of best {occasion} Banquet Halls'
      }
    };

    private citySpecificTitles = {
        'mumbai': {
          baseTitle: 'Premier Banquet Halls in Mumbai - Your Perfect Venue Awaits',
          baseDescription: 'Discover Mumbai\'s finest banquet halls for all occasions. From luxurious wedding venues to corporate event spaces, find the perfect location in the city of dreams.',
          occasionTemplate: 'Top Recommended Banquet Halls in Mumbai'
        },
        'delhi': {
          baseTitle: 'Discover Distinguished Banquet Halls in Delhi',
          baseDescription: 'Explore Delhi\'s most elegant banquet halls, perfect for weddings, corporate events, and celebrations. Find venues that blend tradition with modern luxury.',
          occasionTemplate: 'Best {occasion} Banquet Halls in Delhi'
        },
        'default': {
          baseTitle: 'Explore The Top Banquet Halls',
          baseDescription: 'Explore exquisite banquet halls near you for weddings, parties, and corporate events. EazyVenue.com offers a curated selection of premier event spaces, blending sophistication and charm.',
          occasionTemplate: 'List of best {occasion} Banquet Halls'
        }
      };

      getSubareaSpecificTitle(
        subarea_slug: string | null,
        occasion_slug: string | null,
        city_slug: string | null
      ): { title: string, description: string } {
        // Normalize the slugs
        const normalizedSubarea = subarea_slug ? subarea_slug.toLowerCase() : null;
        const normalizedCity = city_slug ? city_slug.toLowerCase() : null;

        // Determine which metadata to use based on URL pattern
        let baseDetails;
        if (normalizedSubarea) {
          // Prioritize subarea if it exists
          baseDetails = this.subareaSpecificTitles[normalizedSubarea] || {
            baseTitle: `Discover Banquet Halls in ${this.capitalizeWords(normalizedSubarea)}`,
            baseDescription: `Find the perfect banquet hall for your event in ${this.capitalizeWords(normalizedSubarea)}. Browse through our carefully curated selection of venues suitable for all occasions.`,
            occasionTemplate: `Best {occasion} Banquet Halls in ${this.capitalizeWords(normalizedSubarea)}`
          };
        } else if (normalizedCity) {
          // Use city-specific metadata if no subarea
          baseDetails = this.citySpecificTitles[normalizedCity] || {
            baseTitle: `Explore Banquet Halls in ${this.capitalizeWords(normalizedCity)}`,
            baseDescription: `Discover the finest banquet halls in ${this.capitalizeWords(normalizedCity)}. From intimate gatherings to grand celebrations, find your perfect venue.`,
            occasionTemplate: `Best {occasion} Banquet Halls in ${this.capitalizeWords(normalizedCity)}`
          };
        } else {
          // Fallback to default if neither exists
          baseDetails = this.citySpecificTitles['default'];
        }

        // If no occasion, return base details
        if (!occasion_slug) {
          return {
            title: `${baseDetails.baseTitle} - Eazyvenue.com`,
            description: baseDetails.baseDescription
          };
        }

        // Format the occasion
        const formattedOccasion = this.capitalizeWords(occasion_slug);

        // Generate dynamic title and description
        const dynamicTitle = baseDetails.occasionTemplate
          .replace('{occasion}', formattedOccasion)
          .concat(' - Eazyvenue.com');

        const dynamicDescription = baseDetails.baseDescription
          .replace(/\{occasion\}/g, formattedOccasion);

        return {
          title: dynamicTitle,
          description: dynamicDescription
        };
      }

      // Utility method to capitalize words
      private capitalizeWords(str: string): string {
        return str
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
