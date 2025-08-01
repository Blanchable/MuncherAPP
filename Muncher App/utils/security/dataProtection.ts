import { config } from '../config/environment';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SecurityMetrics {
  requestCount: number;
  lastRequestTime: number;
  blockedRequests: number;
}

class DataProtectionService {
  private userSessions = new Map<string, SecurityMetrics>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /setTimeout\(/i,
    /setInterval\(/i
  ];

  /**
   * Validate and sanitize user input
   */
  validateInput(input: any, type: 'email' | 'zipcode' | 'text' | 'number'): ValidationResult {
    const errors: string[] = [];

    if (input === null || input === undefined) {
      errors.push('Input cannot be null or undefined');
      return { isValid: false, errors };
    }

    const stringInput = String(input).trim();

    // Check for malicious patterns
    if (this.containsSuspiciousContent(stringInput)) {
      errors.push('Input contains potentially malicious content');
      return { isValid: false, errors };
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        if (!this.isValidEmail(stringInput)) {
          errors.push('Invalid email format');
        }
        break;

      case 'zipcode':
        if (!this.isValidZipCode(stringInput)) {
          errors.push('Invalid zip code format');
        }
        break;

      case 'text':
        if (stringInput.length === 0) {
          errors.push('Text input cannot be empty');
        } else if (stringInput.length > 1000) {
          errors.push('Text input too long (max 1000 characters)');
        }
        break;

      case 'number':
        if (isNaN(Number(stringInput))) {
          errors.push('Input must be a valid number');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize string input to prevent XSS
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Check rate limiting for a user/session
   */
  checkRateLimit(sessionId: string): boolean {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    let session = this.userSessions.get(sessionId);
    
    if (!session) {
      session = {
        requestCount: 0,
        lastRequestTime: now,
        blockedRequests: 0
      };
      this.userSessions.set(sessionId, session);
    }

    // Reset counter if more than a minute has passed
    if (now - session.lastRequestTime > oneMinute) {
      session.requestCount = 0;
      session.lastRequestTime = now;
    }

    // Check if rate limit exceeded
    if (session.requestCount >= config.security.maxRequestsPerMinute) {
      session.blockedRequests++;
      
      // Block session temporarily if too many violations
      if (session.blockedRequests > 5) {
        this.blockedIPs.add(sessionId);
        setTimeout(() => {
          this.blockedIPs.delete(sessionId);
        }, 10 * 60 * 1000); // 10 minute timeout
      }
      
      return false;
    }

    session.requestCount++;
    session.lastRequestTime = now;
    return true;
  }

  /**
   * Check if a session/IP is blocked
   */
  isBlocked(sessionId: string): boolean {
    return this.blockedIPs.has(sessionId);
  }

  /**
   * Validate API key format (basic validation)
   */
  validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Basic format validation for Google API keys
    return /^[A-Za-z0-9_-]{30,}$/.test(apiKey);
  }

  /**
   * Generate secure headers for API requests
   */
  getSecureHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  /**
   * Encrypt sensitive data before storing (basic implementation)
   */
  encryptData(data: string, key?: string): string {
    // Simple base64 encoding for basic obfuscation
    // In production, use proper encryption libraries
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  /**
   * Decrypt data
   */
  decryptData(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clean up old sessions
   */
  cleanupSessions(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (now - session.lastRequestTime > oneHour) {
        this.userSessions.delete(sessionId);
      }
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    activeSessions: number;
    blockedIPs: number;
    totalRequestsLastHour: number;
  } {
    this.cleanupSessions();
    
    const totalRequests = Array.from(this.userSessions.values())
      .reduce((sum, session) => sum + session.requestCount, 0);
    
    return {
      activeSessions: this.userSessions.size,
      blockedIPs: this.blockedIPs.size,
      totalRequestsLastHour: totalRequests
    };
  }

  /**
   * Private helper methods
   */
  private containsSuspiciousContent(input: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  private isValidZipCode(zipCode: string): boolean {
    // US zip code formats: 12345 or 12345-6789
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }
}

export const dataProtectionService = new DataProtectionService();

// Clean up sessions periodically
setInterval(() => {
  dataProtectionService.cleanupSessions();
}, 30 * 60 * 1000); // Every 30 minutes