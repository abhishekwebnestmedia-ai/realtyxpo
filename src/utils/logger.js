/**
 * Production-ready logging service
 * Replaces console.log statements with proper logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = import.meta.env.PROD ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
    this.isProduction = import.meta.env.PROD;
  }

  error(message, error = null, context = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      const logData = {
        level: 'ERROR',
        message,
        error: error ? this.serializeError(error) : null,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      if (this.isProduction) {
        // In production, send to logging service
        this.sendToLoggingService(logData);
      } else {
        console.error('🔴 [ERROR]', message, error, context);
      }
    }
  }

  warn(message, data = null, context = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      const logData = {
        level: 'WARN',
        message,
        data,
        context,
        timestamp: new Date().toISOString()
      };

      if (this.isProduction) {
        this.sendToLoggingService(logData);
      } else {
        console.warn('🟡 [WARN]', message, data, context);
      }
    }
  }

  info(message, data = null, context = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      const logData = {
        level: 'INFO',
        message,
        data,
        context,
        timestamp: new Date().toISOString()
      };

      if (!this.isProduction) {
        console.info('🔵 [INFO]', message, data, context);
      }
    }
  }

  debug(message, data = null, context = {}) {
    if (this.level >= LOG_LEVELS.DEBUG && !this.isProduction) {
      console.log('🟢 [DEBUG]', message, data, context);
    }
  }

  // API specific logging
  apiError(endpoint, error, requestData = null) {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      requestData: this.sanitizeData(requestData),
      responseStatus: error?.response?.status,
      responseData: error?.response?.data
    });
  }

  apiSuccess(endpoint, responseData = null) {
    this.debug(`API Success: ${endpoint}`, this.sanitizeData(responseData));
  }

  // User action logging for analytics
  userAction(action, data = null) {
    const logData = {
      level: 'INFO',
      message: `User Action: ${action}`,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString()
    };

    if (!this.isProduction) {
      console.info('🔵 [USER_ACTION]', action, this.sanitizeData(data));
    } else {
      this.sendToLoggingService(logData);
    }
  }

  // Performance logging
  performance(metric, value, context = {}) {
    this.info(`Performance: ${metric}`, { value, ...context });
  }

  serializeError(error) {
    if (!error) return null;
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error.status || error.response?.status,
      data: error.response?.data
    };
  }

  sanitizeData(data) {
    if (!data) return null;
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'auth', 'secret', 'key', 'authorization'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        }
      });
      return sanitized;
    }
    
    return data;
  }

  async sendToLoggingService(logData) {
    try {
      // In production, send to your logging service (e.g., Sentry, LogRocket, etc.)
      // For now, we'll store in localStorage for debugging and send to a hypothetical endpoint
      
      // Store locally for debugging
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logData);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));

      // TODO: Replace with actual logging service endpoint
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // });
      
    } catch (error) {
      // Fallback: if logging service fails, at least log to console in dev
      if (!this.isProduction) {
        console.error('Failed to send log to service:', error);
        console.error('Original log data:', logData);
      }
    }
  }

  // Method to get logs for debugging
  getLogs() {
    return JSON.parse(localStorage.getItem('app_logs') || '[]');
  }

  // Clear logs
  clearLogs() {
    localStorage.removeItem('app_logs');
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;