/**
 * Environment configuration service
 * Centralizes all environment variable access
 */

class Config {
  constructor() {
    // API Configuration
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.realtyxpo.in';
    this.API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
    
    // Environment
    this.APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
    this.IS_PRODUCTION = import.meta.env.PROD;
    this.IS_DEVELOPMENT = import.meta.env.DEV;
    
    // Features
    this.ENABLE_DEVTOOLS = import.meta.env.VITE_ENABLE_DEVTOOLS === 'true';
    this.ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.ENABLE_ERROR_REPORTING = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
    this.LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'debug';
    
    // Third-party Services
    this.SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
    this.ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID;
    
    // File Upload
    this.MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB
    this.ALLOWED_FILE_TYPES = import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['.xlsx', '.xls', '.csv', '.pdf', '.jpg', '.jpeg', '.png'];
    
    // Performance
    this.ENABLE_SERVICE_WORKER = import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true';
    this.CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION) || 3600000; // 1 hour
  }

  // Validation methods
  validateEnvironment() {
    const required = ['API_BASE_URL'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Helper methods
  isFileTypeAllowed(filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.ALLOWED_FILE_TYPES.includes(extension);
  }

  isFileSizeAllowed(size) {
    return size <= this.MAX_FILE_SIZE;
  }

  getApiUrl(endpoint) {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.API_BASE_URL}${cleanEndpoint}`;
  }

  // Debug info (only in development)
  getDebugInfo() {
    if (this.IS_PRODUCTION) {
      return { message: 'Debug info not available in production' };
    }

    return {
      environment: this.APP_ENV,
      apiBaseUrl: this.API_BASE_URL,
      isProduction: this.IS_PRODUCTION,
      isDevelopment: this.IS_DEVELOPMENT,
      enableDevtools: this.ENABLE_DEVTOOLS,
      logLevel: this.LOG_LEVEL,
      maxFileSize: this.MAX_FILE_SIZE,
      allowedFileTypes: this.ALLOWED_FILE_TYPES
    };
  }
}

// Create singleton instance
const config = new Config();

// Validate environment on startup
try {
  config.validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  // In production, you might want to show a user-friendly error page
}

export default config;