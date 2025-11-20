/**
 * Client-side security enhancements
 * Provides additional security measures for production deployment
 */

import { showAlert } from '../services/modalService';

class SecurityManager {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.allowedDomains = ['realtyxpo.in', 'backend.realtyxpo.in'];
    this.init();
  }

  init() {
    this.preventClickjacking();
    this.setupConsoleWarning();
    this.preventRightClick();
    this.preventKeyboardShortcuts();
    this.setupFormSecurity();
    this.monitorDevTools();
    this.validateCSP();
  }

  // Prevent clickjacking attacks
  preventClickjacking() {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  }

  // Show security warning in console
  setupConsoleWarning() {
    if (this.isProduction) {
      console.clear();
      console.log(
        '%c⚠️ SECURITY WARNING',
        'color: red; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
      );
      console.log(
        '%cThis is a browser feature intended for developers. Do not paste any code here that someone tells you to paste. This could allow attackers to steal your information or take control of your account.',
        'color: #ff6b6b; font-size: 16px; font-weight: bold; line-height: 1.5;'
      );
      console.log(
        '%cIf someone told you to copy/paste something here, it is a scam and they are trying to hack your account.',
        'color: #ff6b6b; font-size: 14px; margin-top: 10px;'
      );
    }
  }

  // Prevent right-click in production
  preventRightClick() {
    if (this.isProduction) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });

      // Prevent text selection
      document.addEventListener('selectstart', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          return false;
        }
      });

      // Prevent drag and drop
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
    }
  }

  // Prevent developer keyboard shortcuts
  preventKeyboardShortcuts() {
    if (this.isProduction) {
      document.addEventListener('keydown', (e) => {
        // Disable F12
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }

        // Disable Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }

        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'U') {
          e.preventDefault();
          return false;
        }

        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          return false;
        }

        // Disable Ctrl+Shift+C (Element Inspector)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          return false;
        }

        // Disable Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          return false;
        }
      });
    }
  }

  // Setup form security
  setupFormSecurity() {
    // Clear sensitive form data on page unload
    window.addEventListener('beforeunload', () => {
      this.clearSensitiveData();
    });

    // Clear data on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clearSensitiveData();
      }
    });

    // Prevent autocomplete on sensitive fields
    document.addEventListener('DOMContentLoaded', () => {
      const sensitiveFields = document.querySelectorAll(
        'input[type="password"], input[data-sensitive], input[name*="token"]'
      );
      
      sensitiveFields.forEach(field => {
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('spellcheck', 'false');
      });
    });
  }

  // Clear sensitive form data
  clearSensitiveData() {
    const sensitiveSelectors = [
      'input[type="password"]',
      'input[data-sensitive]',
      'input[name*="token"]',
      'input[name*="password"]',
      'input[name*="secret"]'
    ];

    sensitiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.value) {
          element.value = '';
        }
      });
    });

    // Clear localStorage of sensitive data
    const sensitiveKeys = ['token', 'auth', 'password', 'secret'];
    sensitiveKeys.forEach(key => {
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.toLowerCase().includes(key)) {
          localStorage.removeItem(storageKey);
        }
      });
    });
  }

  // Monitor for DevTools
  monitorDevTools() {
    if (this.isProduction) {
      let devtools = false;
      
      const threshold = 160;
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools) {
            devtools = true;
            this.handleDevToolsOpen();
          }
        } else {
          devtools = false;
        }
      }, 500);

      // Detect console access
      let devToolsOpen = false;
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          devToolsOpen = true;
          throw new Error('DevTools detected');
        }
      });

      setInterval(() => {
        devToolsOpen = false;
        try {
          console.log(element);
          console.clear();
        } catch {
          if (devToolsOpen) {
            this.handleDevToolsOpen();
          }
        }
      }, 1000);
    }
  }

  // Handle DevTools detection
  handleDevToolsOpen() {
    console.clear();
    showAlert('Developer tools detected. For security reasons, this action has been logged.');
    
    // Log security event
    this.logSecurityEvent('devtools_opened', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Validate Content Security Policy
  validateCSP() {
    if (this.isProduction) {
      // Check if CSP is properly set
      const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      if (metaTags.length === 0) {
        console.warn('CSP not found in meta tags. Ensure server headers are configured.');
      }

      // Monitor CSP violations
      document.addEventListener('securitypolicyviolation', (e) => {
        this.logSecurityEvent('csp_violation', {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  // Log security events
  logSecurityEvent(eventType, details) {
    const securityEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      details
    };

    // Store locally for debugging
    const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    securityLogs.push(securityEvent);
    
    // Keep only last 50 events
    if (securityLogs.length > 50) {
      securityLogs.splice(0, securityLogs.length - 50);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(securityLogs));

    // Send to security endpoint if available
    if (import.meta.env.VITE_SECURITY_ENDPOINT) {
      fetch(import.meta.env.VITE_SECURITY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(securityEvent)
      }).catch(() => {
        // Fail silently - security logging shouldn't break the app
      });
    }
  }

  // Validate URL parameters for potential XSS
  validateUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:text\/html/i
    ];

    for (const [key, value] of urlParams) {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          this.logSecurityEvent('xss_attempt', {
            parameter: key,
            value: value,
            pattern: pattern.toString()
          });
          
          // Remove dangerous parameter
          urlParams.delete(key);
          const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
          window.history.replaceState({}, '', newUrl);
          break;
        }
      }
    }
  }

  // Initialize security checks
  runSecurityChecks() {
    this.validateUrlParameters();
    
    // Check for common security issues
    setTimeout(() => {
      this.checkForMixedContent();
      this.validateOrigin();
    }, 1000);
  }

  // Check for mixed content
  checkForMixedContent() {
    if (window.location.protocol === 'https:') {
      const httpResources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
      if (httpResources.length > 0) {
        this.logSecurityEvent('mixed_content', {
          count: httpResources.length,
          resources: Array.from(httpResources).map(el => el.src || el.href)
        });
      }
    }
  }

  // Validate origin
  validateOrigin() {
    const currentDomain = window.location.hostname;
    const isValidDomain = this.allowedDomains.some(domain => 
      currentDomain === domain || currentDomain.endsWith('.' + domain)
    );

    if (!isValidDomain && this.isProduction) {
      this.logSecurityEvent('invalid_origin', {
        current: currentDomain,
        allowed: this.allowedDomains
      });
    }
  }

  // Get security logs for debugging
  getSecurityLogs() {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  }

  // Clear security logs
  clearSecurityLogs() {
    localStorage.removeItem('security_logs');
  }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Run security checks on load
document.addEventListener('DOMContentLoaded', () => {
  securityManager.runSecurityChecks();
});

// Export for testing/debugging
window.securityManager = securityManager;

export default SecurityManager;