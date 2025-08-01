import { googlePlacesService, PlacesSearchParams } from './googlePlacesService';
import { locationService, Location, LocationError } from './locationService';
import { Restaurant, mockRestaurants } from '../../data/mockRestaurants';
import { config, validateEnvironment } from '../config/environment';

export interface RestaurantSearchParams {
  location?: Location;
  zipCode?: string;
  radius?: number;
  cuisines?: string[];
  priceLevel?: number[];
  minRating?: number;
  openNow?: boolean;
  useRealData?: boolean;
}

export interface RestaurantSearchResult {
  restaurants: Restaurant[];
  location: Location;
  source: 'google' | 'mock';
  error?: string;
}

class RestaurantService {
  private cache = new Map<string, { data: Restaurant[]; timestamp: number }>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes
  private fallbackToMock = true;

  /**
   * Search for restaurants based on parameters
   */
  async searchRestaurants(params: RestaurantSearchParams): Promise<RestaurantSearchResult> {
    try {
      // Determine user location
      const location = await this.resolveLocation(params);
      
      // Check if we should use real data
      const shouldUseRealData = this.shouldUseRealData(params.useRealData);
      
      if (shouldUseRealData) {
        try {
          const restaurants = await this.searchWithGooglePlaces(location, params);
          return {
            restaurants,
            location,
            source: 'google'
          };
        } catch (error) {
          console.warn('Google Places API failed, falling back to mock data:', error);
          
          if (!this.fallbackToMock) {
            throw error;
          }
        }
      }
      
      // Use mock data (either by choice or as fallback)
      const restaurants = this.searchMockRestaurants(location, params);
      return {
        restaurants,
        location,
        source: 'mock',
        error: shouldUseRealData ? 'Using mock data due to API unavailability' : undefined
      };
      
    } catch (error) {
      console.error('Restaurant search failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed restaurant information
   */
  async getRestaurantDetails(restaurant: Restaurant): Promise<Restaurant> {
    try {
      // If it's from Google Places and has a place_id, get more details
      if (restaurant.id.length > 10) { // Google place IDs are long
        const details = await googlePlacesService.getRestaurantDetails(restaurant.id);
        return { ...restaurant, ...details };
      }
      
      // Return restaurant as-is for mock data
      return restaurant;
    } catch (error) {
      console.warn('Failed to get restaurant details, using existing data:', error);
      return restaurant;
    }
  }

  /**
   * Resolve user location from various inputs
   */
  private async resolveLocation(params: RestaurantSearchParams): Promise<Location> {
    // Use provided location if available
    if (params.location) {
      return params.location;
    }
    
    // Use zip code if provided
    if (params.zipCode) {
      try {
        const result = await locationService.geocodeZipCode(params.zipCode);
        return result.location;
      } catch (error) {
        throw new Error(`Failed to resolve location from zip code: ${params.zipCode}`);
      }
    }
    
    // Try to get current GPS location
    try {
      return await locationService.getCurrentLocation();
    } catch (error) {
      const locationError = error as LocationError;
      throw new Error(`Location access failed: ${locationError.message}`);
    }
  }

  /**
   * Determine whether to use real Google Places data
   */
  private shouldUseRealData(preference?: boolean): boolean {
    // Check environment configuration
    const { isValid } = validateEnvironment();
    
    // If API key is not configured, use mock data
    if (!isValid) {
      return false;
    }
    
    // Use user preference if specified
    if (preference !== undefined) {
      return preference;
    }
    
    // Default to using real data if available
    return true;
  }

  /**
   * Search restaurants using Google Places API
   */
  private async searchWithGooglePlaces(
    location: Location, 
    params: RestaurantSearchParams
  ): Promise<Restaurant[]> {
    const cacheKey = this.generateCacheKey(location, params);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const placesParams: PlacesSearchParams = {
      location,
      radius: params.radius,
      cuisine: params.cuisines,
      priceLevel: params.priceLevel,
      minRating: params.minRating,
      openNow: params.openNow
    };

    const restaurants = await googlePlacesService.searchRestaurants(placesParams);
    
    // Cache the results
    this.cache.set(cacheKey, {
      data: restaurants,
      timestamp: Date.now()
    });

    return restaurants;
  }

  /**
   * Search mock restaurants with filtering
   */
  private searchMockRestaurants(
    location: Location,
    params: RestaurantSearchParams
  ): Restaurant[] {
    let restaurants = [...mockRestaurants];
    
    // Apply filters
    if (params.cuisines && params.cuisines.length > 0) {
      restaurants = restaurants.filter(r => 
        params.cuisines!.some(cuisine => 
          r.cuisine.toLowerCase().includes(cuisine.toLowerCase())
        )
      );
    }
    
    if (params.minRating) {
      restaurants = restaurants.filter(r => r.rating >= params.minRating!);
    }
    
    if (params.priceLevel && params.priceLevel.length > 0) {
      const priceMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
      restaurants = restaurants.filter(r => 
        params.priceLevel!.includes(priceMap[r.priceRange])
      );
    }
    
    if (params.openNow) {
      restaurants = restaurants.filter(r => r.isOpen);
    }
    
    // Calculate distances based on user location
    restaurants = restaurants.map(restaurant => ({
      ...restaurant,
      distance: restaurant.latitude && restaurant.longitude 
        ? locationService.calculateDistance(
            location.latitude,
            location.longitude,
            restaurant.latitude,
            restaurant.longitude
          )
        : Math.random() * 5 + 0.1 // Random distance for mock data
    }));
    
    // Filter by radius if specified
    if (params.radius) {
      const radiusKm = params.radius / 1000;
      restaurants = restaurants.filter(r => r.distance <= radiusKm);
    }
    
    // Sort by distance
    restaurants.sort((a, b) => a.distance - b.distance);
    
    // Limit results
    return restaurants.slice(0, config.app.maxRestaurantsPerSearch);
  }

  /**
   * Generate cache key for location and parameters
   */
  private generateCacheKey(location: Location, params: RestaurantSearchParams): string {
    const key = `${Math.round(location.latitude * 1000)},${Math.round(location.longitude * 1000)}`;
    const filters = `${params.radius || 5000},${(params.cuisines || []).join(',')},${(params.priceLevel || []).join(',')},${params.minRating || 3.0},${params.openNow || false}`;
    return `${key}-${filters}`;
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Configure fallback behavior
   */
  setFallbackToMock(enable: boolean): void {
    this.fallbackToMock = enable;
  }

  /**
   * Get service status
   */
  getStatus(): { 
    googlePlacesAvailable: boolean; 
    cacheSize: number; 
    fallbackEnabled: boolean;
  } {
    const { isValid } = validateEnvironment();
    
    return {
      googlePlacesAvailable: isValid,
      cacheSize: this.cache.size,
      fallbackEnabled: this.fallbackToMock
    };
  }
}

export const restaurantService = new RestaurantService();