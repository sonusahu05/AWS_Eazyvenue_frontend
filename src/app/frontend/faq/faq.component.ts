import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit, OnChanges {
    @Input() selectedVenueList: {
        subarea: string;
        cityname: string;
        statename: string;
        id: string;
    }[] = [];

    faqs: { question: string; answer: string }[] = [];
    activeIndex: number | null = null;
    showMore: boolean = false;

    frequentSearches: string[] = [];
    nearMeSearches: string[] = [];
    localitySearches: string[] = [];
    relatedSearches: string[] = [];

    displayLocation: string = 'Selected Location';
    title: string = 'Banquet Halls';
    description: string = '';
    fullDescription: string = '';
    initialDescription: string = '';
    isFullDescriptionVisible: boolean = false;

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.selectedVenueList = this.parseParam(params['venue']) as {
                subarea: string;
                cityname: string;
                statename: string;
                id: string;
            }[];
            this.updateContent();
            this.generateFaqSchema();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedVenueList']) {
            this.updateContent();
        }
    }

    parseParam(param: string | undefined): any {
        if (!param) return [];
        try {
            return JSON.parse(param);
        } catch {
            return [];
        }
    }

    updateContent(): void {
        this.updateDisplayLocation();
        this.updateTitle();
        this.updateDescription();
        this.updateFaqs();
        this.updateSearches();
    }

    updateDisplayLocation(): void {
        if (this.selectedVenueList.length > 0) {
            this.displayLocation = `${this.selectedVenueList[0].subarea}, ${this.selectedVenueList[0].cityname}`;
        } else {
            this.displayLocation = 'Unknown Location';
        }
    }

    updateTitle(): void {
        // Function to capitalize first letter of each word
        const capitalizeWords = (str: string) => {
            return str
                .split(' ')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(' ');
        };
        // Check the route parameters first
        const subarea = this.route.snapshot.params['subarea'];
        const city = this.route.snapshot.params['city'];

        if (city && !subarea) {
            // If only city is present in the route, use just the city
            this.title = `Banquet Halls in ${capitalizeWords(city)}`;
        } else if (subarea && city) {
            // If both subarea and city are in the route, use them directly
            this.title = `Banquet Halls in ${capitalizeWords(subarea)}`;
        } else if (this.selectedVenueList.length > 0) {
            const { subarea, cityname } = this.selectedVenueList[0];

            // Fallback to first venue details if route params are incomplete
            if (subarea) {
                this.title = `Banquet Halls in ${capitalizeWords(
                    subarea
                )}, ${capitalizeWords(cityname)}`;
            } else {
                this.title = `Banquet Halls in ${capitalizeWords(cityname)}`;
            }
        } else {
            this.title = 'Venue Not Available';
        }
    }

    updateDescription(): void {
        const capitalizeWords = (str: string) => {
            return str
                .split(' ')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(' ');
        };
        const city = this.route.snapshot.params['city'];
        const subarea = this.route.snapshot.params['subarea'];

        if (this.selectedVenueList.length > 0) {
            const venue = this.selectedVenueList[0];
            const normalizedSubarea = venue.subarea
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
            const cityname = venue.cityname
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');

            if (city && !subarea) {
                // If only city is present, show description for the city
                switch (cityname) {
                    case 'mumbai':
                        this.fullDescription = `<h5>Best Banquet Halls in Mumbai</h5>
                            <p>Weddings or receptions & parties are cherished events in a person's life, so booking the best wedding banquet hall / venue is a must. All the celebrations associated with them are very important to all of us. So we provide a range of party halls in Mumbaifor you to choose from.
At Eazy Venue, we understand the sentimental value of all the celebrations you plan and hence help you book the best wedding venues in Mumbai. The bright, open space in the venue will make your wedding day a joyful one, as it should be from the moment you enter.
There is no better feeling than serving our guests on such special occasions. To ensure our clients get the best banquet hall, we always go the extra mile. We offer our guests a unique experience, combining modern comfort with traditional hospitality. So, we will offer the best venue that fits your needs and makes the entire event exciting for you and your guests.
</p>

                            <h5>Book the Best Banquet Halls in Mumbai</h5>
                            <p>Mumbai is located at the heart of Mumbai city and is known for its posh residential areas. It is home to many prominent personalities from various fields. The area is well connected to the rest of the city through public transport and is a popular place for tourists.
Banquet halls are perfect for any type of event, whether it is a birthday party, wedding reception, corporate meeting, holiday celebration, or even a family reunion. We offer a wide variety of options, from indoor and outdoor venues to fully furnished banquet rooms.
</p>

<h5>Book Banquet Halls for Corporate Events</h5>
                            <p>Corporate events are a great way to bring employees together. We are also aware of the fact that such events are a good way to reward employees for their hard work. Whether it’s a company picnic, a team-building event, or a company retreat, they are a fun and productive way to bond with coworkers. Our Team will help you with the best Venue & catering service for such events.</p>

                            <h5>Book Your Comfortable Stay with Us</h5>
                            <p>Your guests need a wonderful location and a comfortable stay when you invite them to an event. So, whether it is corporate or personal, we have tie ups with the best hotels, resorts, etc. to book your stay.
You can expect flexible services and neat rooms that are sanitized and well maintained. The staff at the hotel will take care of your needs and you can enjoy the various amenities and facilities as well. Let us know the dates in advance so we can give you the best options and hence make your stay count.
</p>`;
                        break;
                    default:
                        this.fullDescription = `${capitalizeWords(
                            city
                        )},the bustling heart of India, is home to some of the most exquisite banquet halls designed to host events that leave a lasting impression. Whether you're planning a lavish wedding, a corporate gala, a milestone celebration, or a private gathering, Mumbai offers a myriad of banquet halls that blend elegance with modern functionality.</p>The banquet halls are renowned for their versatility, catering to events of all sizes and types. From grand ballrooms with luxurious chandeliers and state-of-the-art sound systems to cozy spaces ideal for intimate functions, these venues are tailored to perfection.</p>`;
                }
            } else if (subarea && city) {
                // Templates for different location groups
                const firstGroup = ['chembur', 'powai', 'andheri','malad'];
                const secondGroup = ['juhu', 'ghatkopar', 'thane', 'mulund','kurla'];

                const capitalizedSubarea = capitalizeWords(subarea);

                if (firstGroup.includes(normalizedSubarea)) {
                    this.fullDescription = `<h5>Banquet Halls in ${capitalizedSubarea}, Mumbai</h5>
                        <p>Weddings or receptions & parties are cherished events in a person's life, so booking the best wedding banquet hall / venue is a must. All the celebrations associated with them are very important to all of us. So we provide a range of party halls in Powai for you to choose from.
At Eazy Venue, we understand the sentimental value of all the celebrations you plan and hence help you book the best wedding venues in Powai. The bright, open space in the venue will make your wedding day a joyful one, as it should be from the moment you enter.
There is no better feeling than serving our guests on such special occasions. To ensure our clients get the best banquet hall, we always go the extra mile. We offer our guests a unique experience, combining modern comfort with traditional hospitality. So, we will offer the best venue that fits your needs and makes the entire event exciting for you and your guests.
</p>

                        <h5>Book Your Comfortable Stay with Us</h5>
                        <p>Your guests need a wonderful location and a comfortable stay when you invite them to an event. So, whether it is corporate or personal, we have tie ups with the best hotels, resorts, etc. to book your stay.
You can expect flexible services and neat rooms that are sanitized and well maintained. The staff at the hotel will take care of your needs and you can enjoy the various amenities and facilities as well. Let us know the dates in advance so we can give you the best options and hence make your stay count.
</p>

                        <h5>Book Banquet Halls for Corporate Events</h5>
                        <p>Corporate events are a great way to bring employees together. We are also aware of the fact that such events are a good way to reward employees for their hard work. Whether it’s a company picnic, a team-building event, or a company retreat, they are a fun and productive way to bond with coworkers. Our Team will help you with the best Venue & catering service for such events.x</p>

                        <h5>Why Choose ${capitalizedSubarea} for Your Event?</h5>
                        <p>The combination of versatile venues, strategic location, and excellent amenities makes ${capitalizedSubarea} an ideal choice for hosting events ranging from weddings and corporate gatherings to private parties and social celebrations.</p>`;
                } else if (secondGroup.includes(normalizedSubarea)) {
                    this.fullDescription = `<h5>A Prime Business and Event Hub</h5>
                        <p>${capitalizedSubarea} stands out as a sophisticated and modern location in Mumbai, renowned for its premium event spaces and professional infrastructure. Whether you're planning a corporate conference, a lavish wedding, or a private celebration, this area offers exceptional venues that meet the highest standards.</p>

                        <h5>Premium Banquet Halls for Every Occasion</h5>
                        <p>Banquet halls in ${capitalizedSubarea} are designed to cater to diverse event requirements. These venues feature cutting-edge facilities, including high-speed internet, advanced audiovisual equipment, flexible space configurations, and professional event management services.</p>

                        <h5>Strategic Location and Connectivity</h5>
                        <p>${capitalizedSubarea} boasts excellent connectivity with major highways, metro stations, and proximity to business districts. This makes it an attractive destination for hosting events that require convenience and accessibility for attendees.</p>

                        <h5>Why ${capitalizedSubarea} is an Ideal Event Destination</h5>
                        <p>With its blend of modern infrastructure, versatile venues, and strategic location, ${capitalizedSubarea} provides the perfect setting for creating unforgettable event experiences across various domains.</p>`;
                } else {
                    this.fullDescription = `${capitalizedSubarea} the bustling heart of India, is home to some of the most exquisite banquet halls designed to host events that leave a lasting impression. Whether you're planning a lavish wedding, a corporate gala, a milestone celebration, or a private gathering, Mumbai offers a myriad of banquet halls that blend elegance with modern functionality.</p>The banquet halls are renowned for their versatility, catering to events of all sizes and types. From grand ballrooms with luxurious chandeliers and state-of-the-art sound systems to cozy spaces ideal for intimate functions, these venues are tailored to perfection.</p>`;
                }
            } else {
                this.fullDescription = `the bustling heart of India, is home to some of the most exquisite banquet halls designed to host events that leave a lasting impression. Whether you're planning a lavish wedding, a corporate gala, a milestone celebration, or a private gathering, Mumbai offers a myriad of banquet halls that blend elegance with modern functionality.</p>The banquet halls are renowned for their versatility, catering to events of all sizes and types. From grand ballrooms with luxurious chandeliers and state-of-the-art sound systems to cozy spaces ideal for intimate functions, these venues are tailored to perfection.</p>`;
            }

            // Set the initial description to show the first two sections
            const parser = new DOMParser();
            const doc = parser.parseFromString(
                this.fullDescription,
                'text/html'
            );
            const sections = doc.querySelectorAll('h5, p');
            let initialDescriptionHtml = '';
            for (let i = 0; i < Math.min(4, sections.length); i++) {
                initialDescriptionHtml += sections[i].outerHTML;
            }
            this.initialDescription = initialDescriptionHtml;
        } else {
            this.fullDescription = '';
            this.initialDescription = '';
        }
    }

    toggleFullDescription(event: Event): void {
        event.preventDefault();
        this.isFullDescriptionVisible = !this.isFullDescriptionVisible;
    }

    toggleAccordion(index: number): void {
        this.activeIndex = this.activeIndex === index ? null : index;
    }

    toggleShowMore(): void {
        this.showMore = !this.showMore;
    }

    updateFaqs(): void {
        // Function to capitalize first letter of each word
        const capitalizeWords = (str: string) => {
            return str
                .split(' ')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(' ');
        };

        const { city, subarea } = this.route.snapshot.params;
        const displayLocation = subarea
            ? `${capitalizeWords(subarea)}, ${capitalizeWords(city)}`
            : capitalizeWords(city);

        this.faqs = [
            {
                question: `What are the different banquet halls available in ${displayLocation}?`,
                answer: `${displayLocation} has a variety of banquet halls to suit different needs and budgets, including venues such as The Leela, Courtyard by Marriott, The Lalit, Novotel Mumbai, Grand Hyatt, The Orchid, etc. These halls vary in size, amenities, and services offered.`,
            },
            {
                question: `What is the seating capacity range of the banquet halls in ${displayLocation}?`,
                answer: `Banquet halls in ${displayLocation} range from small venues that can accommodate a few guests to large halls that can host up to 1000 or more guests, depending on the specific venue.`,
            },
            {
                question: `What is the cost of booking a banquet hall in ${displayLocation}?`,
                answer: `The cost varies based on the venue, date, time, and duration of the event. Smaller halls may charge less, while larger, premium venues may charge more. Packages often include basic amenities, catering, and decoration, but additional services may incur extra costs.`,
            },
            {
                question: `What types of events can be hosted at banquet halls in ${displayLocation}?`,
                answer: `The banquet halls in ${displayLocation} are versatile and can accommodate a range of events, such as weddings, receptions, corporate events, conferences, seminars, birthday parties, anniversaries, product launches, and other social or cultural gatherings.`,
            },
            {
                question: `What are the parking facilities like at banquet halls in ${displayLocation}?`,
                answer: `Most banquet halls in ${displayLocation} offer parking facilities, including valet parking services. However, the availability and capacity of parking may vary from one venue to another.`,
            },
            {
                question: `Can I visit multiple banquet halls in ${displayLocation} to compare them?`,
                answer: `Yes, you can schedule visits to multiple banquet halls in ${displayLocation} to compare facilities, pricing, and other aspects. It’s recommended to call early and book an appointment to ensure the availability of our venue managers, or you can call us at +91 9372091300.`,
            },
            {
                question: `How can I check availability and make a reservation in ${displayLocation}?`,
                answer: `You can check availability and make reservations directly through our website. It's advisable to book at least a few months in advance, especially for popular venues or peak seasons.`,
            },
            {
                question: `What is the cancellation policy for banquet halls in ${displayLocation}?`,
                answer: `The cancellation policy varies by venue. Generally, halls require a deposit to secure the booking, which may be partially or fully refundable if canceled within a specified period. Please check with each hall for their specific cancellation terms.`,
            },
            {
                question: `What safety and hygiene measures are in place at banquet halls in ${displayLocation}?`,
                answer: `Most banquet halls in ${displayLocation} follow stringent safety and hygiene protocols, including regular sanitization, temperature checks, social distancing measures, fire safety equipment, CCTV surveillance, and on-site security staff.`,
            },
            {
                question: `Are there banquet halls near public transportation hubs in ${displayLocation}?`,
                answer: `Yes, many banquet halls in ${displayLocation} are conveniently located near major public transportation hubs, including railway stations, metro stations, and bus stops.`,
            },
            {
                question: `What catering options are available at banquet halls in ${displayLocation}?`,
                answer: `Banquet halls in ${displayLocation} generally offer in-house catering with diverse cuisine options, including Indian, Continental, Chinese, Italian, and other international menus. Some venues also allow external caterers, subject to their policies and additional fees.`,
            },
            {
                question: `Do banquet halls in ${displayLocation} provide decoration services?`,
                answer: `Many banquet halls in ${displayLocation} offer in-house decoration services or have tie-ups with professional decorators to help customize the venue to your theme or style. Guests can also hire their own decorators, but this might require prior approval from the venue.`,
            },
            {
                question: `Are there any noise restrictions or event curfews in ${displayLocation}?`,
                answer: `Yes, according to local regulations, events must generally conclude by 11:00 PM to comply with noise control guidelines. This applies to most venues in ${displayLocation}; however, some may have their own specific rules.`,
            },
            {
                question: `Are there hotels nearby for guests who need accommodation in ${displayLocation}?`,
                answer: `Yes, there are numerous hotels in ${displayLocation}, ranging from budget options to luxury stays. Many banquet halls have tie-ups with nearby hotels to offer special rates for event guests.`,
            },
            {
                question: `Do banquet halls in ${displayLocation} offer discounts or packages for special occasions?`,
                answer: `Yes, many banquet halls in ${displayLocation} provide discounts for weekday events, off-peak seasons, or special occasions. They may also offer package deals for weddings, corporate events, and multiple bookings.`,
            },
        ];
        this.generateFaqSchema();
    }

    generateFaqSchema(): void {
        const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: this.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        };

        // Remove any existing JSON-LD script
        const existingScript = document.querySelector(
            'script[type="application/ld+json"]'
        );
        if (existingScript) {
            existingScript.remove();
        }

        // Create new script element
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(faqSchema);

        // Append to head
        document.head.appendChild(script);
    }

    updateSearches(): void {
        this.frequentSearches = [
            `Affordable Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `AC Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Top Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Best Banquet Halls with price in ${this.selectedVenueList[0].cityname}`,
            `Affordable Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `AC Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Top Banquet Halls in ${this.selectedVenueList[0].cityname}`,
            `Best Banquet Halls with price in ${this.selectedVenueList[0].cityname}`,
            // Add more dynamic frequent searches
        ];
    }

    onSearchClick(): void {
        const selectedSubarea =
            this.selectedVenueList.length > 0
                ? this.selectedVenueList[0].subarea
                : '';
        const cityname =
            this.selectedVenueList.length > 0
                ? this.selectedVenueList[0].cityname.toLowerCase()
                : '';
        const navigationPath = `/banquet-halls/wedding/mumbai/${selectedSubarea}`;

        console.log(`Search clicked, navigating to ${navigationPath}`);
        this.router
            .navigate([navigationPath])
            .then(() => {
                console.log('Navigation complete');
            })
            .catch((error) => {
                console.error('Navigation error:', error);
            });
    }
}
