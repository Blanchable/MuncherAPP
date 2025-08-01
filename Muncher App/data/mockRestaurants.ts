export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  image: string;
  tags: string[];
  description?: string;
  // Additional data for detail view
  address?: string;
  phone?: string;
  website?: string;
  hours?: {
    [key: string]: string;
  };
  isOpen?: boolean;
  openUntil?: string;
  tagline?: string;
  highlights?: string[];
  latitude?: number;
  longitude?: number;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: "Tony's Brick Oven Pizza",
    cuisine: 'Italian',
    rating: 4.8,
    distance: 0.3,
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    tags: ['Pizza', 'Authentic', 'Wood-fired'],
    description: 'Award-winning wood-fired pizza with locally sourced ingredients and craft beer selection.',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567',
    website: 'tonysbricky.com',
    hours: {
      'Monday': '11:00 AM - 10:00 PM',
      'Tuesday': '11:00 AM - 10:00 PM', 
      'Wednesday': '11:00 AM - 10:00 PM',
      'Thursday': '11:00 AM - 10:00 PM',
      'Friday': '11:00 AM - 11:00 PM',
      'Saturday': '11:00 AM - 11:00 PM',
      'Sunday': '12:00 PM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '10:00 PM',
    tagline: 'Best wood-fired pizza downtown',
    highlights: ['Outdoor seating', 'Good for groups', 'Family-friendly', 'Craft beer'],
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: '2',
    name: 'Sakura Sushi Bar',
    cuisine: 'Japanese',
    rating: 4.6,
    distance: 0.7,
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    tags: ['Sushi', 'Fresh', 'Traditional'],
    description: 'Fresh sushi made daily with premium ingredients from Japan.',
    address: '456 Oak Avenue, Midtown',
    phone: '(555) 234-5678',
    website: 'sakurasushi.com',
    hours: {
      'Monday': 'Closed',
      'Tuesday': '5:00 PM - 10:00 PM',
      'Wednesday': '5:00 PM - 10:00 PM',
      'Thursday': '5:00 PM - 10:00 PM',
      'Friday': '5:00 PM - 11:00 PM',
      'Saturday': '5:00 PM - 11:00 PM',
      'Sunday': '5:00 PM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '10:00 PM',
    tagline: 'Premium sushi experience',
    highlights: ['Omakase available', 'Sake selection', 'Fresh daily', 'Intimate dining'],
    latitude: 40.7589,
    longitude: -73.9851
  },
  {
    id: '3',
    name: 'Casa Miguel',
    cuisine: 'Mexican',
    rating: 4.4,
    distance: 1.2,
    priceRange: '$',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    tags: ['Tacos', 'Authentic', 'Family-owned'],
    description: 'Authentic family recipes passed down through generations.',
    address: '789 Pine Street, East Side',
    phone: '(555) 345-6789',
    hours: {
      'Monday': '11:00 AM - 9:00 PM',
      'Tuesday': '11:00 AM - 9:00 PM',
      'Wednesday': '11:00 AM - 9:00 PM',
      'Thursday': '11:00 AM - 9:00 PM',
      'Friday': '11:00 AM - 10:00 PM',
      'Saturday': '10:00 AM - 10:00 PM',
      'Sunday': '10:00 AM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '9:00 PM',
    tagline: 'Authentic street tacos',
    highlights: ['Family-owned', 'Vegetarian options', 'Spicy', 'Quick service'],
    latitude: 40.6892,
    longitude: -74.0445
  },
  {
    id: '4',
    name: 'The Burger Joint',
    cuisine: 'American',
    rating: 4.3,
    distance: 0.5,
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    tags: ['Burgers', 'Local beef', 'Craft beer'],
    description: 'Gourmet burgers made with locally sourced beef and fresh ingredients.',
    address: '321 Elm Drive, West End',
    phone: '(555) 456-7890',
    website: 'burgerjoint.com',
    hours: {
      'Monday': '12:00 PM - 11:00 PM',
      'Tuesday': '12:00 PM - 11:00 PM',
      'Wednesday': '12:00 PM - 11:00 PM',
      'Thursday': '12:00 PM - 11:00 PM',
      'Friday': '12:00 PM - 12:00 AM',
      'Saturday': '11:00 AM - 12:00 AM',
      'Sunday': '11:00 AM - 10:00 PM'
    },
    isOpen: true,
    openUntil: '11:00 PM',
    tagline: 'Local beef, bold flavors',
    highlights: ['Outdoor seating', 'Good for groups', 'Craft beer', 'Late night'],
    latitude: 40.7505,
    longitude: -73.9934
  },
  {
    id: '5',
    name: 'Green Garden Café',
    cuisine: 'Healthy',
    rating: 4.7,
    distance: 0.8,
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    tags: ['Salads', 'Organic', 'Vegan options'],
    description: 'Fresh, organic ingredients sourced from local farms.',
    address: '654 Garden Way, Green District',
    phone: '(555) 567-8901',
    website: 'greengarden.com',
    hours: {
      'Monday': '7:00 AM - 8:00 PM',
      'Tuesday': '7:00 AM - 8:00 PM',
      'Wednesday': '7:00 AM - 8:00 PM',
      'Thursday': '7:00 AM - 8:00 PM',
      'Friday': '7:00 AM - 8:00 PM',
      'Saturday': '8:00 AM - 8:00 PM',
      'Sunday': '8:00 AM - 7:00 PM'
    },
    isOpen: true,
    openUntil: '8:00 PM',
    tagline: 'Farm to table freshness',
    highlights: ['Vegan-friendly', 'Organic', 'Gluten-free options', 'Healthy'],
    latitude: 40.7282,
    longitude: -73.7949
  },
  {
    id: '6',
    name: 'Nonna Rosa',
    cuisine: 'Italian',
    rating: 4.9,
    distance: 1.5,
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    tags: ['Pasta', 'Wine', 'Romantic'],
    description: 'Traditional Italian pasta house with an extensive wine collection.',
    address: '987 Vineyard Lane, Little Italy',
    phone: '(555) 678-9012',
    website: 'nonnarosa.com',
    hours: {
      'Monday': 'Closed',
      'Tuesday': '5:00 PM - 10:00 PM',
      'Wednesday': '5:00 PM - 10:00 PM',
      'Thursday': '5:00 PM - 10:00 PM',
      'Friday': '5:00 PM - 11:00 PM',
      'Saturday': '5:00 PM - 11:00 PM',
      'Sunday': '4:00 PM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '10:00 PM',
    tagline: 'Romantic Italian dining',
    highlights: ['Romantic', 'Wine selection', 'Date night', 'Intimate dining'],
    latitude: 40.7194,
    longitude: -73.9927
  },
  {
    id: '7',
    name: 'Spice Route',
    cuisine: 'Indian',
    rating: 4.5,
    distance: 1.1,
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    tags: ['Curry', 'Authentic', 'Spicy'],
    description: 'Authentic Indian flavors with traditional spices and cooking methods.',
    address: '147 Spice Street, Curry Hill',
    phone: '(555) 789-0123',
    website: 'spiceroute.com',
    hours: {
      'Monday': '11:30 AM - 9:30 PM',
      'Tuesday': '11:30 AM - 9:30 PM',
      'Wednesday': '11:30 AM - 9:30 PM',
      'Thursday': '11:30 AM - 9:30 PM',
      'Friday': '11:30 AM - 10:00 PM',
      'Saturday': '11:30 AM - 10:00 PM',
      'Sunday': '12:00 PM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '9:30 PM',
    tagline: 'Authentic Indian spices',
    highlights: ['Spicy', 'Vegetarian options', 'Authentic', 'Lunch buffet'],
    latitude: 40.7505,
    longitude: -73.9857
  },
  {
    id: '8',
    name: 'Ocean Breeze Seafood',
    cuisine: 'Seafood',
    rating: 4.2,
    distance: 2.1,
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    tags: ['Fresh fish', 'Lobster', 'Ocean view'],
    description: 'Fresh catch daily with stunning ocean views and sustainable sourcing.',
    address: '888 Coastal Highway, Waterfront',
    phone: '(555) 890-1234',
    website: 'oceanbreeze.com',
    hours: {
      'Monday': '4:00 PM - 10:00 PM',
      'Tuesday': '4:00 PM - 10:00 PM',
      'Wednesday': '4:00 PM - 10:00 PM',
      'Thursday': '4:00 PM - 10:00 PM',
      'Friday': '4:00 PM - 11:00 PM',
      'Saturday': '12:00 PM - 11:00 PM',
      'Sunday': '12:00 PM - 9:00 PM'
    },
    isOpen: true,
    openUntil: '10:00 PM',
    tagline: 'Fresh catch with ocean views',
    highlights: ['Ocean view', 'Fresh daily', 'Romantic', 'Sustainable'],
    latitude: 40.5795,
    longitude: -74.1502
  }
];