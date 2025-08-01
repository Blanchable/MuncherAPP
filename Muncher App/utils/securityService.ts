import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SecureData {
  userPreferences?: any;
  favorites?: any[];
  searchHistory?: any[];
  locationData?: any;
}

class SecurityService {
  private readonly ENCRYPTION_KEY = 'muncher_secure_key';
  private readonly STORAGE_PREFIX = 'muncher_secure_';

  /**
   * Encrypt sensitive data before storage
   */
  private encryptData(data: any): string {
    try {
      // In a production app, use a proper encryption library like react-native-crypto
      // For now, we'll use a simple base64 encoding with additional obfuscation
      const jsonString = JSON.stringify(data);
      const encoded = btoa(jsonString);
      const timestamp = Date.now().toString();
      const obfuscated = `${timestamp}_${encoded}_${this.ENCRYPTION_KEY}`;
      return btoa(obfuscated);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data from storage
   */
  private decryptData(encryptedData: string): any {
    try {
      const decoded = atob(encryptedData);
      const parts = decoded.split('_');
      if (parts.length < 3) {
        throw new Error('Invalid encrypted data format');
      }
      const encoded = parts[1];
      const jsonString = atob(encoded);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Securely store data
   */
  async secureStore(key: string, data: any): Promise<void> {
    try {
      const encryptedData = this.encryptData(data);
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      await AsyncStorage.setItem(storageKey, encryptedData);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error('Failed to store data securely');
    }
  }

  /**
   * Securely retrieve data
   */
  async secureRetrieve(key: string): Promise<any | null> {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      const encryptedData = await AsyncStorage.getItem(storageKey);
      
      if (!encryptedData) {
        return null;
      }

      return this.decryptData(encryptedData);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  /**
   * Securely remove data
   */
  async secureRemove(key: string): Promise<void> {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing secure data:', error);
    }
  }

  /**
   * Clear all secure data
   */
  async clearAllSecureData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Error clearing secure data:', error);
    }
  }

  /**
   * Sanitize user input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Generate a secure random string
   */
  generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (for comparison, not storage)
   */
  hashData(data: string): string {
    // In production, use a proper hashing library
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate location data
   */
  isValidLocation(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Anonymize location data for analytics
   */
  anonymizeLocation(latitude: number, longitude: number): { latitude: number; longitude: number } {
    // Round to 2 decimal places to anonymize location
    return {
      latitude: Math.round(latitude * 100) / 100,
      longitude: Math.round(longitude * 100) / 100,
    };
  }

  /**
   * Check if device is secure
   */
  async isDeviceSecure(): Promise<boolean> {
    try {
      // In a real app, you would check for:
      // - Jailbreak/root detection
      // - Emulator detection
      // - Screen lock status
      // - Biometric availability
      
      // For now, return true (assume secure)
      return true;
    } catch (error) {
      console.error('Error checking device security:', error);
      return false;
    }
  }

  /**
   * Get device fingerprint for security
   */
  getDeviceFingerprint(): string {
    const platform = Platform.OS;
    const version = Platform.Version;
    const isPad = Platform.isPad;
    const isTV = Platform.isTV;
    
    const fingerprint = `${platform}_${version}_${isPad}_${isTV}_${this.generateSecureId()}`;
    return this.hashData(fingerprint);
  }

  /**
   * Validate API response data
   */
  validateApiResponse(data: any): boolean {
    try {
      // Check if data is an object
      if (!data || typeof data !== 'object') {
        return false;
      }

      // Check for required fields in restaurant data
      if (data.id && data.name && data.cuisine) {
        return true;
      }

      // Check for required fields in user data
      if (data.id && data.email) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating API response:', error);
      return false;
    }
  }

  /**
   * Rate limiting for API calls
   */
  private apiCallTimestamps: { [key: string]: number[] } = {};

  isRateLimited(endpoint: string, maxCalls: number = 10, timeWindow: number = 60000): boolean {
    const now = Date.now();
    const timestamps = this.apiCallTimestamps[endpoint] || [];
    
    // Remove timestamps older than the time window
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < timeWindow);
    
    // Update timestamps
    this.apiCallTimestamps[endpoint] = recentTimestamps;
    
    // Check if we're over the limit
    if (recentTimestamps.length >= maxCalls) {
      return true;
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    this.apiCallTimestamps[endpoint] = recentTimestamps;
    
    return false;
  }

  /**
   * Log security events (in production, send to security monitoring service)
   */
  logSecurityEvent(event: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      deviceFingerprint: this.getDeviceFingerprint(),
    };
    
    console.log('Security Event:', logEntry);
    
    // In production, send to security monitoring service
    // await securityMonitoringService.log(logEntry);
  }
}

// Export singleton instance
export const securityService = new SecurityService();