import { supabase } from './client';
import { dataProtectionService } from '../security/dataProtection';

export interface UserPreferences {
  userId: string;
  location?: {
    type: 'gps' | 'zipcode';
    latitude?: number;
    longitude?: number;
    zipCode?: string;
    address?: string;
  };
  filters?: {
    distance: number;
    cuisines: string[];
    dietaryRestrictions: string[];
    priceRange: number[];
    minRating: number;
  };
  privacy?: {
    shareLocation: boolean;
    sharePreferences: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class UserPreferencesService {
  private tableName = 'user_preferences';

  /**
   * Get user preferences from Supabase
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found
          return null;
        }
        throw error;
      }

      // Decrypt sensitive data
      const preferences: UserPreferences = {
        userId: data.user_id,
        location: data.location ? this.decryptLocationData(data.location) : undefined,
        filters: data.filters,
        privacy: data.privacy || { shareLocation: false, sharePreferences: false },
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  /**
   * Save user preferences to Supabase
   */
  async saveUserPreferences(preferences: Partial<UserPreferences> & { userId: string }): Promise<void> {
    try {
      // Validate input data
      this.validatePreferences(preferences);

      // Encrypt sensitive data
      const encryptedData = {
        user_id: preferences.userId,
        location: preferences.location ? this.encryptLocationData(preferences.location) : null,
        filters: preferences.filters,
        privacy: preferences.privacy || { shareLocation: false, sharePreferences: false },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(this.tableName)
        .upsert(encryptedData, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  /**
   * Update specific preference fields
   */
  async updatePreferences(
    userId: string, 
    updates: Partial<Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const existing = await this.getUserPreferences(userId);
      
      const updatedPreferences = {
        userId,
        ...existing,
        ...updates,
      };

      await this.saveUserPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Delete user preferences
   */
  async deleteUserPreferences(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }

  /**
   * Save user favorites securely
   */
  async saveFavorites(userId: string, favorites: any[]): Promise<void> {
    try {
      // Encrypt favorite restaurant data
      const encryptedFavorites = favorites.map(fav => ({
        ...fav,
        // Remove sensitive location data for privacy
        latitude: undefined,
        longitude: undefined,
        phone: fav.phone ? dataProtectionService.encryptData(fav.phone) : undefined
      }));

      const { error } = await supabase
        .from('user_favorites')
        .upsert({
          user_id: userId,
          favorites: encryptedFavorites,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }

  /**
   * Get user favorites
   */
  async getFavorites(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('favorites')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return [];
        }
        throw error;
      }

      // Decrypt sensitive data
      const favorites = data.favorites.map((fav: any) => ({
        ...fav,
        phone: fav.phone ? dataProtectionService.decryptData(fav.phone) : undefined
      }));

      return favorites;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Validate preferences data
   */
  private validatePreferences(preferences: Partial<UserPreferences>): void {
    if (!preferences.userId) {
      throw new Error('User ID is required');
    }

    // Validate location data
    if (preferences.location) {
      const loc = preferences.location;
      
      if (loc.zipCode) {
        const validation = dataProtectionService.validateInput(loc.zipCode, 'zipcode');
        if (!validation.isValid) {
          throw new Error(`Invalid zip code: ${validation.errors.join(', ')}`);
        }
      }

      if (loc.latitude !== undefined && (loc.latitude < -90 || loc.latitude > 90)) {
        throw new Error('Invalid latitude');
      }

      if (loc.longitude !== undefined && (loc.longitude < -180 || loc.longitude > 180)) {
        throw new Error('Invalid longitude');
      }
    }

    // Validate filters
    if (preferences.filters) {
      const filters = preferences.filters;
      
      if (filters.distance < 0 || filters.distance > 100) {
        throw new Error('Distance must be between 0 and 100 km');
      }

      if (filters.minRating < 0 || filters.minRating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }

      if (filters.cuisines && filters.cuisines.length > 20) {
        throw new Error('Too many cuisine preferences');
      }
    }
  }

  /**
   * Encrypt location data for storage
   */
  private encryptLocationData(location: UserPreferences['location']): any {
    if (!location) return null;

    return {
      type: location.type,
      latitude: location.latitude ? dataProtectionService.encryptData(location.latitude.toString()) : undefined,
      longitude: location.longitude ? dataProtectionService.encryptData(location.longitude.toString()) : undefined,
      zipCode: location.zipCode ? dataProtectionService.encryptData(location.zipCode) : undefined,
      address: location.address ? dataProtectionService.encryptData(location.address) : undefined
    };
  }

  /**
   * Decrypt location data from storage
   */
  private decryptLocationData(encryptedLocation: any): UserPreferences['location'] {
    if (!encryptedLocation) return undefined;

    return {
      type: encryptedLocation.type,
      latitude: encryptedLocation.latitude ? 
        parseFloat(dataProtectionService.decryptData(encryptedLocation.latitude)) : undefined,
      longitude: encryptedLocation.longitude ? 
        parseFloat(dataProtectionService.decryptData(encryptedLocation.longitude)) : undefined,
      zipCode: encryptedLocation.zipCode ? 
        dataProtectionService.decryptData(encryptedLocation.zipCode) : undefined,
      address: encryptedLocation.address ? 
        dataProtectionService.decryptData(encryptedLocation.address) : undefined
    };
  }

  /**
   * Get anonymized analytics data (privacy-safe)
   */
  async getAnalyticsData(): Promise<{ totalUsers: number; popularCuisines: string[] }> {
    try {
      // Only get aggregated, non-personal data
      const { data, error } = await supabase
        .from(this.tableName)
        .select('filters')
        .not('filters', 'is', null);

      if (error) {
        throw error;
      }

      const totalUsers = data.length;
      const cuisineCounts: { [key: string]: number } = {};

      data.forEach(item => {
        if (item.filters?.cuisines) {
          item.filters.cuisines.forEach((cuisine: string) => {
            cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
          });
        }
      });

      const popularCuisines = Object.entries(cuisineCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([cuisine]) => cuisine);

      return { totalUsers, popularCuisines };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { totalUsers: 0, popularCuisines: [] };
    }
  }
}

export const userPreferencesService = new UserPreferencesService();