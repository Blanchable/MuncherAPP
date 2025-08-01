import * as Location from 'expo-location';
import { Location as LocationType } from './googlePlaces';

export interface LocationResult {
  success: boolean;
  location?: LocationType;
  error?: string;
  permissionStatus?: Location.PermissionStatus;
}

export interface GeocodeResult {
  success: boolean;
  location?: LocationType;
  address?: string;
  error?: string;
}

class LocationService {
  private hasRequestedPermission = false;

  /**
   * Request location permissions and get current location
   */
  async getCurrentLocation(): Promise<LocationResult> {
    try {
      // Check if we have permission
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus !== Location.PermissionStatus.GRANTED) {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== Location.PermissionStatus.GRANTED) {
          return {
            success: false,
            error: 'Location permission denied',
            permissionStatus: status,
          };
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 100, // 100 meters
      });

      return {
        success: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        permissionStatus: Location.PermissionStatus.GRANTED,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      };
    }
  }

  /**
   * Geocode a zip code to get coordinates
   */
  async geocodeZipCode(zipCode: string): Promise<GeocodeResult> {
    try {
      // Validate zip code format (US zip codes)
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (!zipCodeRegex.test(zipCode)) {
        return {
          success: false,
          error: 'Invalid zip code format',
        };
      }

      // Geocode the zip code
      const results = await Location.geocodeAsync(`${zipCode}, USA`);
      
      if (results.length === 0) {
        return {
          success: false,
          error: 'Could not find location for this zip code',
        };
      }

      const result = results[0];
      
      return {
        success: true,
        location: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
        address: `${zipCode}, USA`,
      };
    } catch (error) {
      console.error('Error geocoding zip code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to geocode zip code',
      };
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(location: LocationType): Promise<GeocodeResult> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (results.length === 0) {
        return {
          success: false,
          error: 'Could not find address for this location',
        };
      }

      const result = results[0];
      const addressParts = [
        result.street,
        result.city,
        result.region,
        result.postalCode,
        result.country,
      ].filter(Boolean);

      return {
        success: true,
        location,
        address: addressParts.join(', '),
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reverse geocode',
      };
    }
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get location permission status
   */
  async getPermissionStatus(): Promise<Location.PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return Location.PermissionStatus.UNDETERMINED;
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1: LocationType, point2: LocationType): number {
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
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 5280)} ft`; // Convert to feet
    } else {
      return `${distance.toFixed(1)} mi`;
    }
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Get location from various sources (GPS, zip code, etc.)
   */
  async getLocationFromSource(source: 'gps' | 'zipcode', value?: string): Promise<LocationResult> {
    try {
      if (source === 'gps') {
        return await this.getCurrentLocation();
      } else if (source === 'zipcode' && value) {
        const geocodeResult = await this.geocodeZipCode(value);
        if (geocodeResult.success && geocodeResult.location) {
          return {
            success: true,
            location: geocodeResult.location,
          };
        } else {
          return {
            success: false,
            error: geocodeResult.error || 'Failed to geocode zip code',
          };
        }
      } else {
        return {
          success: false,
          error: 'Invalid location source',
        };
      }
    } catch (error) {
      console.error('Error getting location from source:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      };
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();