import { Restaurant } from '../data/mockRestaurants';

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PlacesSearchParams {
  location: Location;
  radius?: number; // in meters, default 5000
  type?: string; // restaurant, cafe, etc.
  keyword?: string;
  minPrice?: number; // 0-4
  maxPrice?: number; // 0-4
  openNow?: boolean;
}

export interface GooglePlace {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
}

class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_PLACES_API_KEY;
    if (!this.apiKey) {
      console.warn('Google Places API key not found. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY');
    }
  }

  /**
   * Search for nearby restaurants
   */
  async searchNearbyRestaurants(params: PlacesSearchParams): Promise<Restaurant[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Places API key not configured');
      }

      const searchParams = new URLSearchParams({
        location: `${params.location.latitude},${params.location.longitude}`,
        radius: (params.radius || 5000).toString(),
        type: params.type || 'restaurant',
        key: this.apiKey,
      });

      if (params.keyword) {
        searchParams.append('keyword', params.keyword);
      }

      if (params.minPrice !== undefined) {
        searchParams.append('minprice', params.minPrice.toString());
      }

      if (params.maxPrice !== undefined) {
        searchParams.append('maxprice', params.maxPrice.toString());
      }

      if (params.openNow) {
        searchParams.append('opennow', 'true');
      }

      const response = await fetch(
        `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GooglePlacesResponse = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      // Convert Google Places data to our Restaurant format
      const restaurants = await Promise.all(
        data.results.map(async (place) => {
          // Get additional details for each place
          const details = await this.getPlaceDetails(place.place_id);
          return this.convertPlaceToRestaurant(place, details);
        })
      );

      return restaurants.filter(Boolean) as Restaurant[];
    } catch (error) {
      console.error('Error searching nearby restaurants:', error);
      // Return mock data as fallback
      return this.getMockRestaurants();
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      if (!this.apiKey) {
        return null;
      }

      const searchParams = new URLSearchParams({
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,price_level,types',
        key: this.apiKey,
      });

      const response = await fetch(
        `${GOOGLE_PLACES_BASE_URL}/details/json?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Convert Google Place data to our Restaurant format
   */
  private convertPlaceToRestaurant(place: GooglePlace, details?: PlaceDetails | null): Restaurant | null {
    try {
      // Calculate distance (simplified - in real app, use proper distance calculation)
      const distance = this.calculateDistance(
        { latitude: 40.7128, longitude: -74.0060 }, // Default to NYC coordinates
        { latitude: place.geometry.location.lat, longitude: place.geometry.location.lng }
      );

      // Determine cuisine type from place types
      const cuisine = this.determineCuisineFromTypes(place.types);

      // Generate image URL from photo reference if available
      const image = place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}`
        : this.getDefaultRestaurantImage(cuisine);

      // Determine price range
      const priceRange = this.convertPriceLevel(place.price_level);

      // Generate tags based on place types and details
      const tags = this.generateTags(place.types, details);

      const restaurant: Restaurant = {
        id: place.place_id,
        name: place.name,
        cuisine,
        rating: place.rating || 0,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        priceRange,
        image,
        tags,
        description: this.generateDescription(place, details),
        address: details?.formatted_address,
        phone: details?.formatted_phone_number,
        website: details?.website,
        hours: details?.opening_hours ? this.convertOpeningHours(details.opening_hours) : undefined,
        isOpen: place.opening_hours?.open_now || details?.opening_hours?.open_now,
        tagline: this.generateTagline(place, details),
        highlights: this.generateHighlights(place, details),
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      };

      return restaurant;
    } catch (error) {
      console.error('Error converting place to restaurant:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Determine cuisine type from Google Places types
   */
  private determineCuisineFromTypes(types: string[]): string {
    const cuisineMap: { [key: string]: string } = {
      'restaurant': 'Restaurant',
      'cafe': 'Café',
      'bakery': 'Bakery',
      'bar': 'Bar',
      'pizza': 'Italian',
      'sushi': 'Japanese',
      'chinese_restaurant': 'Chinese',
      'indian_restaurant': 'Indian',
      'mexican_restaurant': 'Mexican',
      'thai_restaurant': 'Thai',
      'vietnamese_restaurant': 'Vietnamese',
      'korean_restaurant': 'Korean',
      'mediterranean_restaurant': 'Mediterranean',
      'greek_restaurant': 'Greek',
      'italian_restaurant': 'Italian',
      'french_restaurant': 'French',
      'spanish_restaurant': 'Spanish',
      'american_restaurant': 'American',
      'steakhouse': 'Steakhouse',
      'seafood_restaurant': 'Seafood',
      'bbq_restaurant': 'BBQ',
      'burger_restaurant': 'American',
      'sandwich_shop': 'Sandwich',
      'deli': 'Deli',
      'fast_food': 'Fast Food',
      'food_court': 'Food Court',
      'meal_takeaway': 'Takeout',
      'meal_delivery': 'Delivery',
    };

    for (const type of types) {
      if (cuisineMap[type]) {
        return cuisineMap[type];
      }
    }

    return 'Restaurant';
  }

  /**
   * Convert Google price level to our format
   */
  private convertPriceLevel(priceLevel?: number): '$' | '$$' | '$$$' | '$$$$' {
    switch (priceLevel) {
      case 0:
        return '$';
      case 1:
        return '$$';
      case 2:
        return '$$$';
      case 3:
        return '$$$$';
      case 4:
        return '$$$$';
      default:
        return '$$';
    }
  }

  /**
   * Generate tags based on place types and details
   */
  private generateTags(types: string[], details?: PlaceDetails | null): string[] {
    const tags: string[] = [];

    // Add cuisine-specific tags
    if (types.includes('pizza')) tags.push('Pizza');
    if (types.includes('sushi')) tags.push('Sushi');
    if (types.includes('steakhouse')) tags.push('Steak');
    if (types.includes('seafood_restaurant')) tags.push('Seafood');
    if (types.includes('bbq_restaurant')) tags.push('BBQ');

    // Add general tags
    if (types.includes('restaurant')) tags.push('Dine-in');
    if (types.includes('meal_takeaway')) tags.push('Takeout');
    if (types.includes('meal_delivery')) tags.push('Delivery');
    if (details?.opening_hours?.open_now) tags.push('Open Now');

    // Add rating-based tags
    if (details?.rating && details.rating >= 4.5) tags.push('Highly Rated');
    if (details?.user_ratings_total && details.user_ratings_total > 100) tags.push('Popular');

    return tags.slice(0, 3); // Limit to 3 tags
  }

  /**
   * Generate description for restaurant
   */
  private generateDescription(place: GooglePlace, details?: PlaceDetails | null): string {
    const parts: string[] = [];

    if (details?.rating && details.rating >= 4.0) {
      parts.push(`Rated ${details.rating} stars`);
    }

    if (place.user_ratings_total && place.user_ratings_total > 50) {
      parts.push(`with ${place.user_ratings_total} reviews`);
    }

    if (details?.formatted_address) {
      parts.push(`Located in ${details.formatted_address.split(',')[1]?.trim() || 'the area'}`);
    }

    return parts.length > 0 ? parts.join('. ') + '.' : 'A great place to eat!';
  }

  /**
   * Generate tagline for restaurant
   */
  private generateTagline(place: GooglePlace, details?: PlaceDetails | null): string {
    const cuisine = this.determineCuisineFromTypes(place.types);
    
    if (place.rating && place.rating >= 4.5) {
      return `Excellent ${cuisine.toLowerCase()} dining`;
    } else if (place.rating && place.rating >= 4.0) {
      return `Great ${cuisine.toLowerCase()} experience`;
    } else {
      return `Local ${cuisine.toLowerCase()} restaurant`;
    }
  }

  /**
   * Generate highlights for restaurant
   */
  private generateHighlights(place: GooglePlace, details?: PlaceDetails | null): string[] {
    const highlights: string[] = [];

    if (details?.opening_hours?.open_now) {
      highlights.push('Open Now');
    }

    if (place.rating && place.rating >= 4.0) {
      highlights.push('Highly Rated');
    }

    if (place.user_ratings_total && place.user_ratings_total > 100) {
      highlights.push('Popular');
    }

    if (details?.website) {
      highlights.push('Online Menu');
    }

    if (place.types.includes('meal_takeaway')) {
      highlights.push('Takeout Available');
    }

    return highlights.slice(0, 4);
  }

  /**
   * Convert Google opening hours to our format
   */
  private convertOpeningHours(openingHours: any): { [key: string]: string } {
    const hours: { [key: string]: string } = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (openingHours.weekday_text) {
      openingHours.weekday_text.forEach((dayText: string, index: number) => {
        const dayName = days[index];
        hours[dayName] = dayText.replace(`${dayName}: `, '');
      });
    }

    return hours;
  }

  /**
   * Get default restaurant image based on cuisine
   */
  private getDefaultRestaurantImage(cuisine: string): string {
    const imageMap: { [key: string]: string } = {
      'Italian': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'Healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      'Seafood': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    };

    return imageMap[cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  }

  /**
   * Get mock restaurants as fallback
   */
  private getMockRestaurants(): Restaurant[] {
    // Import mock data as fallback
    const { mockRestaurants } = require('../data/mockRestaurants');
    return mockRestaurants;
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();