import { config } from '../config/environment';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'GEOCODING_FAILED';
  message: string;
}

export interface GeocodingResult {
  location: Location;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

class LocationService {
  private getCurrentPositionOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
  };

  /**
   * Get current GPS location
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by this browser'
        } as LocationError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let locationError: LocationError;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              locationError = {
                code: 'PERMISSION_DENIED',
                message: 'Location access denied by user'
              };
              break;
            case error.POSITION_UNAVAILABLE:
              locationError = {
                code: 'POSITION_UNAVAILABLE',
                message: 'Location information is unavailable'
              };
              break;
            case error.TIMEOUT:
              locationError = {
                code: 'TIMEOUT',
                message: 'Location request timed out'
              };
              break;
            default:
              locationError = {
                code: 'POSITION_UNAVAILABLE',
                message: 'An unknown error occurred'
              };
          }
          
          reject(locationError);
        },
        this.getCurrentPositionOptions
      );
    });
  }

  /**
   * Convert zip code to coordinates using Google Geocoding API
   */
  async geocodeZipCode(zipCode: string): Promise<GeocodingResult> {
    try {
      const response = await fetch(
        `${config.googlePlaces.baseUrl}/geocoding/json?address=${encodeURIComponent(zipCode)}&key=${config.googlePlaces.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error('No results found for this zip code');
      }

      const result = data.results[0];
      const location = result.geometry.location;
      
      // Extract address components
      const addressComponents = result.address_components;
      const getComponent = (type: string) => 
        addressComponents.find((comp: any) => comp.types.includes(type))?.long_name || '';

      return {
        location: {
          latitude: location.lat,
          longitude: location.lng
        },
        address: result.formatted_address,
        city: getComponent('locality') || getComponent('administrative_area_level_2'),
        state: getComponent('administrative_area_level_1'),
        zipCode: getComponent('postal_code')
      };
    } catch (error) {
      throw {
        code: 'GEOCODING_FAILED',
        message: `Failed to geocode zip code: ${error instanceof Error ? error.message : 'Unknown error'}`
      } as LocationError;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if geolocation is supported
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission without getting location
   */
  async requestLocationPermission(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
        return 'prompt';
      }
    }
    return 'prompt';
  }
}

export const locationService = new LocationService();