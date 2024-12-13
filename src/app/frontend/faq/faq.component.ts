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
        if (this.selectedVenueList.length > 0) {
            const { subarea } = this.selectedVenueList[0];
            this.title = `Banquet Halls in ${subarea}`;
        } else {
            this.title = 'Banquet Halls';
        }
    }

    updateDescription(): void {
        if (this.selectedVenueList.length > 0) {
            const { subarea } = this.selectedVenueList[0];
            const normalizedSubarea = subarea.toLowerCase().replace(/[^a-z0-9]/g, '');

            switch (normalizedSubarea) {
                case 'chembur':
                    this.fullDescription = `
                        <h5>An Ideal Destination for Events</h5>
                        <p>Thane West, a vibrant suburb in the northeastern part of Mumbai, is a blend of natural beauty and urban amenities, making it an ideal location for hosting a wide variety of events. Known for its picturesque lakes, such as Upvan Lake and Masunda Lake, and lush green landscapes like Yeoor Hills, Thane West offers a tranquil setting that is perfect for both grand celebrations and intimate gatherings. The area is home to numerous banquet halls that cater to all types of events, including weddings, corporate meetings, birthday parties, and anniversaries, offering a wide range of choices to meet every need.</p>

                        <h5>Versatile Banquet Hall Options</h5>
                        <p>Banquet halls in Thane West come in various sizes and styles, ranging from opulent spaces with grand interiors and state-of-the-art facilities to more modest venues for smaller, personal celebrations. These venues are equipped with modern amenities such as advanced audiovisual systems, in-house catering, and customizable décor options, ensuring that every event is memorable and tailored to the host's preferences. The diversity of options allows event organizers to select venues that align with their specific requirements, whether they seek luxury, comfort, or affordability.</p>

                        <h5>Accessibility and Nearby Attractions</h5>
                        <p>Thane West is easily accessible from different parts of Mumbai, thanks to its strategic location along the Eastern Express Highway and its well-connected railway station. This makes it a convenient choice for guests traveling from nearby areas. In addition to its banquet halls, Thane West boasts numerous attractions, including popular shopping centers like Viviana Mall and Korum Mall, which provide excellent leisure and entertainment options for event attendees. These amenities enhance the overall experience for guests, making Thane West a favored destination for hosting events.</p>

                        <h5>Why Choose Thane West for Your Event?</h5>
                        <p>Choosing Thane West for your event offers numerous advantages. Its serene environment, coupled with a wide range of banquet halls and convenient accessibility, makes it an ideal choice for any celebration. The area's rich mix of natural beauty and urban amenities provides a unique backdrop that adds charm and sophistication to any occasion. Whether you are planning a wedding, a corporate function, or a social gathering, Thane West ensures a memorable experience for both hosts and guests alike.</p>
                    `;
                    break;
                case 'powai':
                    this.fullDescription = `
                        <h5>A Prime Location for Events</h5>
                        <p>Andheri East, strategically located near Mumbai's international airport, is one of the city's most dynamic neighborhoods and a popular destination for both corporate and social events. Known for its bustling business centers, luxury hotels, and a wide range of banquet halls, Andheri East caters to a diverse clientele looking to host everything from high-profile weddings and gala dinners to product launches, conferences, and private parties. The area's cosmopolitan vibe and extensive facilities make it an ideal choice for events of all sizes.</p>

                        <h5>Banquet Halls Tailored for Every Occasion</h5>
                        <p>The banquet halls in Andheri East are known for their versatility and modern amenities. From upscale venues featuring grand ballrooms and exquisite interiors to mid-sized spaces perfect for seminars and intimate gatherings, Andheri East offers a multitude of options to suit every type of event. These halls are equipped with high-speed internet, cutting-edge audiovisual equipment, customizable décor options, and professional event management services. Many venues also offer comprehensive packages that include catering, entertainment, and décor, ensuring a seamless experience from start to finish.</p>

                        <h5>Connectivity and Convenience</h5>
                        <p>One of the biggest advantages of hosting an event in Andheri East is its excellent connectivity. The area is well-served by the Mumbai Metro, major highways, and is just a short drive from the Mumbai International Airport, making it easily accessible for both local and international guests. In addition, Andheri East is surrounded by a wide array of amenities, including luxury hotels, shopping malls, restaurants, and entertainment options, all of which contribute to a vibrant atmosphere and enhance the overall experience for event attendees.</p>

                        <h5>Why Andheri East Stands Out</h5>
                        <p>Choosing Andheri East for your event provides numerous benefits. Its central location ensures ease of access for guests, while its wide range of banquet halls caters to every taste, size, and budget. The area's vibrant energy, combined with its proximity to key city attractions such as Juhu Beach, Powai Lake, and the popular Lokhandwala Market, adds an extra dimension to any event. Andheri East truly stands out as a prime location for celebrations that require both style and substance.</p>
                    `;
                    break;
                default:
                    this.fullDescription = `<p>Description for ${subarea} is not available.</p>`;
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
