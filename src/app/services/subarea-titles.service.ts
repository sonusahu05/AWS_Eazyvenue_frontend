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
        occasionTemplate: 'Top {occasion} Venues in Powai'
      },
      'bandra': {
        baseTitle: 'Stylish Banquet Halls in the Trendy Bandra Locale',
        baseDescription: 'Discover chic and luxurious banquet halls in Bandra, known for its vibrant atmosphere and sophisticated venues. Perfect for creating memorable events in one of Mumbai\'s most iconic areas.',
        occasionTemplate: 'Premier {occasion} Spaces in Bandra'
      },
      'andheri': {
        baseTitle: 'Top-Rated Banquet Halls in Andheri\'s Versatile Landscape',
        baseDescription: 'Find the most versatile and well-equipped banquet halls in Andheri. From corporate events to grand weddings, our curated list offers spaces that cater to every occasion and style.',
        occasionTemplate: 'Best {occasion} Venues in Andheri'
      },
      'juhu': {
        baseTitle: 'Exclusive Banquet Halls in the Iconic Juhu Area',
        baseDescription: 'Experience premium banquet halls in Juhu, blending luxury, convenience, and breathtaking ambiance. Ideal for those seeking a remarkable venue in one of Mumbai\'s most prestigious neighborhoods.',
        occasionTemplate: 'Top {occasion} Banquet Halls in Juhu'
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
      // Normalize the subarea slug
      const normalizedSubarea = subarea_slug ? subarea_slug.toLowerCase() : 'default';

      // Get the base details
      let subareaDetails = this.subareaSpecificTitles[normalizedSubarea] ||
                           this.subareaSpecificTitles['default'];

      // Modify baseTitle dynamically for subareas not explicitly defined
      if (!this.subareaSpecificTitles[normalizedSubarea] && subarea_slug) {
        const formattedSubarea = this.capitalizeWords(subarea_slug);
        subareaDetails = {
          ...subareaDetails,
          occasionTemplate: `Explore The Top Banquet Halls in ${formattedSubarea} - Eazyvenue.com`
        };
      }

      // If no occasion, return base details
      if (!occasion_slug) {
        return {
          title: subareaDetails.baseTitle,
          description: subareaDetails.baseDescription
        };
      }

      // Format the occasion and location
      const formattedOccasion = this.capitalizeWords(occasion_slug);
      const formattedCity = city_slug ? ` in ${this.capitalizeWords(city_slug)}` : '';
      const formattedSubarea = subarea_slug ? `, ${this.capitalizeWords(subarea_slug)}` : '';

      // Generate dynamic title
      const dynamicTitle = subareaDetails.occasionTemplate
        .replace('{occasion}', formattedOccasion)
        .concat(` - Eazyvenue.com`);

      // Generate dynamic description
      const dynamicDescription = subareaDetails.baseDescription
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
