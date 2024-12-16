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
        // Check the route parameters first
        const subarea = this.route.snapshot.params['subarea'];
        const city = this.route.snapshot.params['city'];

        if (city && !subarea) {
            // If only city is present in the route, use just the city
            this.title = `Banquet Halls in ${city.charAt(0).toUpperCase() + city.slice(1)}`;
        } else if (subarea && city) {
            // If both subarea and city are in the route, use them directly
            this.title = `Banquet Halls in ${subarea}, ${city.charAt(0).toUpperCase() + city.slice(1)}`;
        } else if (this.selectedVenueList.length > 0) {
            const { subarea, cityname } = this.selectedVenueList[0];

            // Fallback to first venue details if route params are incomplete
            if (subarea) {
                this.title = `Banquet Halls in ${subarea}, ${cityname}`;
            } else {
                this.title = `Banquet Halls in ${cityname}`;
            }
        } else {
            this.title = 'Banquet Halls';
        }
    }

    updateDescription(): void {
        const city = this.route.snapshot.params['city'];
        const subarea = this.route.snapshot.params['subarea'];

        if (this.selectedVenueList.length > 0) {
            const venue = this.selectedVenueList[0];
            const normalizedSubarea = venue.subarea.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cityname = venue.cityname.toLowerCase().replace(/[^a-z0-9]/g, '');

            if (city && !subarea) {
                // If only city is present, show description for the city
                switch (cityname) {
                    case 'mumbai':
                        this.fullDescription = `
                            <h5>Mumbai’s Versatile Event Hubs</h5>
                            <p>Mumbai, the bustling heart of India, is home to some of the most exquisite banquet halls designed to host events that leave a lasting impression. Whether you're planning a lavish wedding, a corporate gala, a milestone celebration, or a private gathering, Mumbai offers a myriad of banquet halls that blend elegance with modern functionality. Neighborhoods like Bandra, Andheri, Powai, and Juhu are especially known for their premier event venues, catering to diverse preferences and budgets.</p>

                            <h5>Exceptional Banquet Halls Across Mumbai</h5>
                            <p>The banquet halls in Mumbai are renowned for their versatility, catering to events of all sizes and types. From grand ballrooms with luxurious chandeliers and state-of-the-art sound systems to cozy spaces ideal for intimate functions, these venues are tailored to perfection. Many banquet halls offer customizable décor options, in-house catering with gourmet cuisines, and advanced audiovisual setups, making them an ideal choice for weddings, corporate conferences, product launches, and more. Additionally, their professional event management services ensure that every detail is flawlessly executed.</p>

                            <h5>Prime Locations with Seamless Connectivity</h5>
                            <p>Mumbai’s banquet halls are strategically located in areas with excellent connectivity, ensuring ease of access for both local and out-of-town guests. For instance:</p>
                            <ul>
                                <li>Andheri East: Close to the Mumbai International Airport, Andheri East boasts venues perfect for high-profile corporate events and weddings.</li>
                                <li>Bandra and Juhu: These vibrant locales are popular for their proximity to upscale hotels, beaches, and nightlife, adding charm to any celebration.</li>
                                <li>Powai and Navi Mumbai: Ideal for serene lakeside events or large-scale gatherings in spacious banquet halls.</li>
                            </ul>

                            <h5>Why Choose Banquet Halls in Mumbai?</h5>
                            <p>Opting for banquet halls in Mumbai elevates your event, offering a combination of premium facilities and the city’s dynamic energy. These venues cater to every aspect of your celebration:</p>
                            <ul>
                                <li>Comprehensive Event Packages: Many venues offer all-in-one packages that include catering, décor, and entertainment services.</li>
                                <li>Flexibility: Spaces designed to host everything from intimate parties to grand events.</li>
                                <li>Proximity to Attractions: Popular landmarks like Marine Drive, Gateway of India, and Juhu Beach enhance the overall experience for outstation guests.</li>
                            </ul>

                            <h5>Plan Your Event in Style</h5>
                            <p>With their unmatched facilities, strategic locations, and Mumbai's vibrant charm, banquet halls in the city stand out as the ultimate choice for memorable celebrations. Whether it’s a wedding dripping with opulence or a sleek corporate gathering, Mumbai has the perfect venue for every occasion.</p>
                        `;
                        break;
                    default:
                        this.fullDescription = `<p>Description for ${city} is not available.</p>`;
                }
            } else if (subarea && city) {
                // If both subarea and city are present, use them directly
                switch (normalizedSubarea) {
                    case 'chembur':
                        this.fullDescription = `
                            <h5>An Ideal Destination for Events</h5>
                            <p>Chembur, a vibrant suburb in the northeastern part of Mumbai, is a blend of natural beauty and urban amenities, making it an ideal location for hosting a wide variety of events. Known for its picturesque lakes, such as Upvan Lake and Masunda Lake, and lush green landscapes like Yeoor Hills, Chembur offers a tranquil setting that is perfect for both grand celebrations and intimate gatherings.</p>
                            <h5>Versatile Banquet Hall Options</h5>
                            <p>Banquet halls in Chembur come in various sizes and styles, ranging from opulent spaces with grand interiors and state-of-the-art facilities to more modest venues for smaller, personal celebrations. These venues are equipped with modern amenities such as advanced audiovisual systems, in-house catering, and customizable décor options, ensuring that every event is memorable and tailored to the host's preferences.</p>
                            <h5>Accessibility and Nearby Attractions</h5>
                            <p>Chembur is easily accessible from different parts of Mumbai, thanks to its strategic location along the Eastern Express Highway and its well-connected railway station. In addition to its banquet halls, Chembur boasts numerous attractions, including popular shopping centers like Viviana Mall and Korum Mall, which provide excellent leisure and entertainment options for event attendees.</p>
                            <h5>Why Choose Chembur for Your Event?</h5>
                            <p>Choosing Chembur for your event offers numerous advantages. Its serene environment, coupled with a wide range of banquet halls and convenient accessibility, makes it an ideal choice for any celebration.</p>
                        `;
                        break;
                    case 'powai':
                        this.fullDescription = `
                            <h5>A Prime Location for Events</h5>
                            <p>Powai, strategically located near Mumbai's international airport, is one of the city's most dynamic neighborhoods and a popular destination for both corporate and social events. Known for its bustling business centers, luxury hotels, and a wide range of banquet halls, Powai caters to a diverse clientele looking to host everything from high-profile weddings and gala dinners to product launches, conferences, and private parties.</p>
                            <h5>Banquet Halls Tailored for Every Occasion</h5>
                            <p>The banquet halls in Powai are known for their versatility and modern amenities. From upscale venues featuring grand ballrooms and exquisite interiors to mid-sized spaces perfect for seminars and intimate gatherings, Powai offers a multitude of options to suit every type of event. These halls are equipped with high-speed internet, cutting-edge audiovisual equipment, customizable décor options, and professional event management services.</p>
                            <h5>Connectivity and Convenience</h5>
                            <p>One of the biggest advantages of hosting an event in Powai is its excellent connectivity. The area is well-served by the Mumbai Metro, major highways, and is just a short drive from the Mumbai International Airport, making it easily accessible for both local and international guests. In addition, Powai is surrounded by a wide array of amenities, including luxury hotels, shopping malls, restaurants, and entertainment options, all of which contribute to a vibrant atmosphere and enhance the overall experience for event attendees.</p>
                            <h5>Why Powai Stands Out</h5>
                            <p>Choosing Powai for your event provides numerous benefits. Its central location ensures ease of access for guests, while its wide range of banquet halls caters to every taste, size, and budget.</p>
                        `;
                        break;
                    default:
                        this.fullDescription = `<p>Description for ${subarea} is not available.</p>`;
                }
            } else {
                this.fullDescription = `<p>Description is not available.</p>`;
            }

            // Set the initial description to show the first two sections
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.fullDescription, 'text/html');
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
        this.faqs = [
            {
                question: `What are the different banquet halls available in ${this.selectedVenueList[0].subarea}?`,
                answer: `${this.selectedVenueList[0].subarea} has a variety of banquet halls to suit different needs and budgets, including venues such as The Leela, Courtyard by Marriott, The Lalit, Novotel Mumbai, Grand Hyatt, The Orchid, etc. These halls vary in size, amenities, and services offered.`,
            },
            {
                question: `What is the seating capacity range of the banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `Banquet halls in ${this.selectedVenueList[0].subarea} range from small venues that can accommodate a few guests to large halls that can host up to 1000 or more guests, depending on the specific venue.`,
            },
            {
                question: `What is the cost of booking a banquet hall in ${this.selectedVenueList[0].subarea}?`,
                answer: `The cost varies based on the venue, date, time, and duration of the event. Smaller halls may charge less, while larger, premium venues may charge more. Packages often include basic amenities, catering, and decoration, but additional services may incur extra costs.`,
            },
            {
                question: `What types of events can be hosted at banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `The banquet halls in ${this.selectedVenueList[0].subarea} are versatile and can accommodate a range of events, such as weddings, receptions, corporate events, conferences, seminars, birthday parties, anniversaries, product launches, and other social or cultural gatherings.`,
            },
            {
                question: `What are the parking facilities like at banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `Most banquet halls in ${this.selectedVenueList[0].subarea} offer parking facilities, including valet parking services. However, the availability and capacity of parking may vary from one venue to another.`,
            },
            {
                question: `Can I visit multiple banquet halls in ${this.selectedVenueList[0].subarea} to compare them?`,
                answer: `Yes, you can schedule visits to multiple banquet halls in ${this.selectedVenueList[0].subarea} to compare facilities, pricing, and other aspects. It’s recommended to call early and book an appointment to ensure the availability of our venue managers, or you can call us at +91 9372091300.`,
            },
            {
                question: `How can I check availability and make a reservation in ${this.selectedVenueList[0].subarea}?`,
                answer: `You can check availability and make reservations directly through our website. It's advisable to book at least a few months in advance, especially for popular venues or peak seasons.`,
            },
            {
                question: `What is the cancellation policy for banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `The cancellation policy varies by venue. Generally, halls require a deposit to secure the booking, which may be partially or fully refundable if canceled within a specified period. Please check with each hall for their specific cancellation terms.`,
            },
            {
                question: `What safety and hygiene measures are in place at banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `Most banquet halls in ${this.selectedVenueList[0].subarea} follow stringent safety and hygiene protocols, including regular sanitization, temperature checks, social distancing measures, fire safety equipment, CCTV surveillance, and on-site security staff.`,
            },
            {
                question: `Are there banquet halls near public transportation hubs in ${this.selectedVenueList[0].subarea}?`,
                answer: `Yes, many banquet halls in ${this.selectedVenueList[0].subarea} are conveniently located near major public transportation hubs, including railway stations, metro stations, and bus stops.`,
            },
            {
                question: `What catering options are available at banquet halls in ${this.selectedVenueList[0].subarea}?`,
                answer: `Banquet halls in ${this.selectedVenueList[0].subarea} generally offer in-house catering with diverse cuisine options, including Indian, Continental, Chinese, Italian, and other international menus. Some venues also allow external caterers, subject to their policies and additional fees.`,
            },
            {
                question: `Do banquet halls in ${this.selectedVenueList[0].subarea} provide decoration services?`,
                answer: `Many banquet halls in ${this.selectedVenueList[0].subarea} offer in-house decoration services or have tie-ups with professional decorators to help customize the venue to your theme or style. Guests can also hire their own decorators, but this might require prior approval from the venue.`,
            },
            {
                question: `Are there any noise restrictions or event curfews in ${this.selectedVenueList[0].subarea}?`,
                answer: `Yes, according to local regulations, events must generally conclude by 11:00 PM to comply with noise control guidelines. This applies to most venues in ${this.selectedVenueList[0].subarea}; however, some may have their own specific rules.`,
            },
            {
                question: `Are there hotels nearby for guests who need accommodation in ${this.selectedVenueList[0].subarea}?`,
                answer: `Yes, there are numerous hotels in ${this.selectedVenueList[0].subarea}, ranging from budget options to luxury stays. Many banquet halls have tie-ups with nearby hotels to offer special rates for event guests.`,
            },
            {
                question: `Do banquet halls in ${this.selectedVenueList[0].subarea} offer discounts or packages for special occasions?`,
                answer: `Yes, many banquet halls in ${this.selectedVenueList[0].subarea} provide discounts for weekday events, off-peak seasons, or special occasions. They may also offer package deals for weddings, corporate events, and multiple bookings.`,
            },
        ];
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
