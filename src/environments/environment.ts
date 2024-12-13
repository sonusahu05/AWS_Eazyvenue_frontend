export const environment = {
    production: false,
    // apiUrl: 'https://labs-api.eazyvenue.com/api/',
    apiUrl: 'http://localhost:3006/api/', //local
    ageDiff: 18,
    defaultDate: "february 01 1950 00:00",
    minYear: "1950",
    yearRange: "2022:2060",
    yearDiff: 1,
    pagination: [10, 20, 50, 100, 1000, { showAll: 'All' }],
    productUploadUrl: 'https://labs-api.eazyvenue.com/uploads/',
    uploadUrl: 'src/public/uploads/cmsPic/',
    imageSize: 2000000,
    videoSize: 20000000,
    defaultDays: 5,
    frontEnd: {
        domain: 'https://labs.eazyvenue.com',
        picPath: 'https://labs-api.eazyvenue.com'
    },
    picture: {
        profilePicFolder: 'src/public/uploads/profilepic/',
        showPicFolderPath: 'uploads/profilepic/',
        defaultPicFolderPath: 'images/',
        bannerImageFolder: 'src/public/uploads/bannerimage/',
        showBannerPicFolderPath: 'uploads/bannerimage/',
    },
    api: {
        port: 3006,
        root: '/api',
    },
    maxVenuePrice: 1000000,
    minVenuePrice: 10000,
    capacity: [
        {
            'id': 1, 'label': "30-80", condition: 'lte', value: 80, status: false
        },
        {
            'id': 2, 'label': "30-100", condition: 'lte', value: 100, status: false
        },
        {
            'id': 3, 'label': "30-200", condition: 'lte', value: 200, status: false
        },
        {
            'id': 4, 'label': "30-300", condition: 'lte', value: 300, status: false
        },
        {
            'id': 5, 'label': "30-400", condition: 'lte', value: 400, status: false
        },
        {
            'id': 6, 'label': "30-500", condition: 'lte', value: 500, status: false
        },
        {
            'id': 7, 'label': "30-600", condition: 'lte', value: 600, status: false
        },
        {
            'id': 8, 'label': "30-700", condition: 'lte', value: 700, status: false
        },
        {
            'id': 10, 'label': "30-800", condition: 'lte', value: 800, status: false
        },
        {
            'id': 11, 'label': "30-900", condition: 'lte', value: 900, status: false
        },
        {
            'id': 12, 'label': "30-1000", condition: 'lte', value: 1000, status: false
        },
        {
            'id': 13, 'label': "30-1200", condition: 'lte', value: 1200, status: false
        },
        {
            'id': 14, 'label': "30-1300", condition: 'lte', value: 1300, status: false
        },
        {
            'id': 15, 'label': "30-1400", condition: 'lte', value: 1400, status: false
        },
        {
            'id': 16, 'label': "30-1500", condition: 'lte', value: 1500, status: false
        },
        {
            'id': 17, 'label': "Above 1500", condition: 'gte', value: 1600, status: false
        },
    ],
    googleRating: [
        { name: 1, value: 1 },
        { name: 1.5, value: 1.5 },
        { name: 2, value: 2 },
        { name: 2.5, value: 2.5 },
        { name: 3, value: 3 },
        { name: 3.5, value: 3.5 },
        { name: 4, value: 4 },
        { name: 4.5, value: 4.5 },
        { name: 5, value: 5 },
    ],
    eazyVenueRating: [
        { name: 1, value: 1 },
        { name: 1.5, value: 1.5 },
        { name: 2, value: 2 },
        { name: 2.5, value: 2.5 },
        { name: 3, value: 3 },
        { name: 3.5, value: 3.5 },
        { name: 4, value: 4 },
        { name: 4.5, value: 4.5 },
        { name: 5, value: 5 },
    ],
    amenitiesArray: [
        { name: 'Swimming Pool', slug: 'swimming_pool', status: false },
        { name: 'Parking', slug: 'parking', status: false },
        { name: 'AC', slug: 'ac', status: false },
        { name: 'Green Rooms', slug: 'green_rooms', status: false },
        { name: 'Power Backup', slug: 'power_backup', status: false },
        { name: 'DJ', slug: 'dj', status: false },
        { name: 'Entertainment License', slug: 'entertainment_license', status: false },
    ],
};

/*
 * by miDuration value represent year,month,day,hour,min,Second,millisecond
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
