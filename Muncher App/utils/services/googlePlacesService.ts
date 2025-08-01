import { config } from '../config/environment';
import { Location } from './locationService';
import { Restaurant } from '../../data/mockRestaurants';

export interface PlacesSearchParams {
  location: Location;
  radius?: number;
  cuisine?: string[];
  priceLevel?: number[];
  minRating?: number;
  openNow?: boolean;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  price_level?: number;
  photos?: { photo_reference: string }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  types: string[];
  user_ratings_total?: number;
}

class GooglePlacesService {
  private readonly baseUrl = config.googlePlaces.baseUrl;
  private readonly apiKey = config.googlePlaces.apiKey;
  private requestCount = 0;
  private lastResetTime = Date.now();

  /**
   * Rate limiting check
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    // Reset counter every minute
    if (now - this.lastResetTime > oneMinute) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= config.security.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.requestCount++;
    return true;
  }

  /**
   * Search for restaurants near a location
   */
  async searchRestaurants(params: PlacesSearchParams): Promise<Restaurant[]> {
    this.checkRateLimit();
    
    if (!this.apiKey) {
      throw new Error('Google Places API key is not configured');
    }

    try {
      const {
        location,
        radius = config.app.defaultSearchRadius,
        cuisine = [],
        priceLevel = [],
        minRating = config.app.minRating,
        openNow = false
      } = params;

      // Build search query
      const searchParams = new URLSearchParams({
        location: `${location.latitude},${location.longitude}`,
        radius: radius.toString(),
        type: 'restaurant',
        key: this.apiKey
      });

      if (openNow) {
        searchParams.append('opennow', 'true');
      }

      // Add cuisine filter as keyword if specified
      if (cuisine.length > 0) {
        searchParams.append('keyword', cuisine.join(' '));
      }

      const response = await fetch(
        `${this.baseUrl}/nearbysearch/json?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (!data.results || data.results.length === 0) {
        return [];
      }

      // Filter and transform results
      let restaurants = data.results
        .filter((place: PlaceDetails) => this.isValidRestaurant(place, minRating, priceLevel))
        .slice(0, config.app.maxRestaurantsPerSearch)
        .map((place: PlaceDetails) => this.transformToRestaurant(place, location));

      return restaurants;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a restaurant
   */
  async getRestaurantDetails(placeId: string): Promise<Partial<Restaurant>> {
    this.checkRateLimit();

    try {
      const searchParams = new URLSearchParams({
        place_id: placeId,
        fields: 'name,rating,price_level,photos,geometry,formatted_address,formatted_phone_number,website,opening_hours,types,user_ratings_total',
        key: this.apiKey
      });

      const response = await fetch(
        `${this.baseUrl}/details/json?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return this.transformDetailedRestaurant(data.result);
    } catch (error) {
      console.error('Error getting restaurant details:', error);
      throw error;
    }
  }

  /**
   * Get photo URL for a place
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!photoReference || !this.apiKey) {
      return this.getFallbackImage();
    }

    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Check if a place is a valid restaurant
   */
  private isValidRestaurant(place: PlaceDetails, minRating: number, priceLevel: number[]): boolean {
    // Must have a name
    if (!place.name) return false;

    // Check rating
    if (place.rating && place.rating < minRating) return false;

    // Check price level if specified
    if (priceLevel.length > 0 && place.price_level !== undefined) {
      if (!priceLevel.includes(place.price_level)) return false;
    }

    // Must be a restaurant/food establishment
    const foodTypes = ['restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'cafe'];
    if (!place.types.some(type => foodTypes.includes(type))) return false;

    return true;
  }

  /**
   * Transform Google Places result to Restaurant interface
   */
  private transformToRestaurant(place: PlaceDetails, userLocation: Location): Restaurant {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    const cuisine = this.extractCuisine(place.types);
    const priceRange = this.mapPriceLevel(place.price_level);
    const imageUrl = place.photos && place.photos.length > 0 
      ? this.getPhotoUrl(place.photos[0].photo_reference)
      : this.getFallbackImage();

    return {
      id: place.place_id,
      name: place.name,
      cuisine,
      rating: place.rating || 3.0,
      distance,
      priceRange,
      image: imageUrl,
      tags: this.generateTags(place),
      description: `${cuisine} restaurant${place.user_ratings_total ? ` with ${place.user_ratings_total} reviews` : ''}`,
      address: place.vicinity || place.formatted_address,
      isOpen: place.opening_hours?.open_now,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng
    };
  }

  /**
   * Transform detailed place data
   */
  private transformDetailedRestaurant(place: PlaceDetails): Partial<Restaurant> {
    return {
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      hours: place.opening_hours?.weekday_text ? 
        this.formatHours(place.opening_hours.weekday_text) : undefined,
      isOpen: place.opening_hours?.open_now,
    };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Extract cuisine type from Google Places types
   */
  private extractCuisine(types: string[]): string {
    const cuisineMap: { [key: string]: string } = {
      'chinese_restaurant': 'Chinese',
      'italian_restaurant': 'Italian',
      'japanese_restaurant': 'Japanese',
      'mexican_restaurant': 'Mexican',
      'indian_restaurant': 'Indian',
      'thai_restaurant': 'Thai',
      'korean_restaurant': 'Korean',
      'french_restaurant': 'French',
      'american_restaurant': 'American',
      'mediterranean_restaurant': 'Mediterranean',
      'pizza': 'Pizza',
      'bakery': 'Bakery',
      'cafe': 'Cafe',
      'fast_food': 'Fast Food',
      'seafood_restaurant': 'Seafood'
    };

    for (const type of types) {
      if (cuisineMap[type]) {
        return cuisineMap[type];
      }
    }

    return 'Restaurant';
  }

  /**
   * Map Google price level to our price range
   */
  private mapPriceLevel(priceLevel?: number): '$' | '$$' | '$$$' | '$$$$' {
    switch (priceLevel) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$$';
    }
  }

  /**
   * Generate tags based on place data
   */
  private generateTags(place: PlaceDetails): string[] {
    const tags: string[] = [];
    
    if (place.rating && place.rating >= 4.5) tags.push('Highly Rated');
    if (place.price_level === 1) tags.push('Budget Friendly');
    if (place.price_level === 4) tags.push('Fine Dining');
    if (place.opening_hours?.open_now) tags.push('Open Now');
    if (place.types.includes('meal_delivery')) tags.push('Delivery');
    if (place.types.includes('meal_takeaway')) tags.push('Takeout');
    
    return tags;
  }

  /**
   * Format opening hours
   */
  private formatHours(weekdayText: string[]): { [key: string]: string } {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours: { [key: string]: string } = {};
    
    weekdayText.forEach((text, index) => {
      if (index < days.length) {
        // Remove day name from the beginning of the text
        const timeText = text.replace(/^[^:]+:\s*/, '');
        hours[days[index]] = timeText;
      }
    });
    
    return hours;
  }

  /**
   * Get fallback image for restaurants without photos
   */
  private getFallbackImage(): string {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  }
}

export const googlePlacesService = new GooglePlacesService();