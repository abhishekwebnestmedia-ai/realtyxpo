import axios from "axios";
import config from "../utils/config";
import logger from "../utils/logger";

// Create axios instance with production-ready configuration
const api = axios.create({
  baseURL: config.getApiUrl('/api'),
  timeout: config.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Allow browser to include cookies on requests to the API origin
  withCredentials: true,
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API requests in development
    if (!import.meta.env.PROD) {
      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });
    }

    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (!import.meta.env.PROD) {
      logger.debug(`API Response: ${response.status} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging
    logger.apiError(
      `${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      error,
      originalRequest?.data
    );

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            // Clear invalid token
            localStorage.removeItem('token');
            
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          // Forbidden - show access denied message
          logger.warn('Access denied', { url: originalRequest?.url, status });
          break;

        case 404:
          // Not found
          logger.warn('Resource not found', { url: originalRequest?.url, status });
          break;

        case 422:
          // Validation error - handle form errors
          logger.warn('Validation error', { url: originalRequest?.url, errors: data });
          break;

        case 429:
          // Rate limit exceeded
          logger.warn('Rate limit exceeded', { url: originalRequest?.url, status });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          logger.error('Server error', error, { url: originalRequest?.url, status });
          break;

        default:
          logger.error('Unknown API error', error, { url: originalRequest?.url, status });
      }

      // Enhance error object with user-friendly messages
      error.userMessage = getUserFriendlyErrorMessage(status, data);
      
    } else if (error.request) {
      // Network error
      logger.error('Network error - no response received', error);
      error.userMessage = 'Network connection error. Please check your internet connection and try again.';
      
    } else {
      // Request setup error
      logger.error('Request setup error', error);
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }

    return Promise.reject(error);
  }
);

// Helper function to generate user-friendly error messages
function getUserFriendlyErrorMessage(status, data) {
  const defaultMessages = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Please log in to continue.',
    403: 'You don\'t have permission to perform this action.',
    404: 'The requested resource was not found.',
    422: 'Please check your input for errors.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
    504: 'Request timeout. Please try again.'
  };

  // Use server-provided message if available and user-friendly
  if (data?.message && typeof data.message === 'string' && data.message.length < 200) {
    return data.message;
  }

  // Use default message based on status code
  return defaultMessages[status] || 'An unexpected error occurred. Please try again.';
}

// Enhanced API methods with better error handling
const apiService = {
  // Standard CRUD operations
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      logger.apiSuccess(`GET ${url}`, response.data);
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'GET', url);
    }
  },

  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config);
      logger.apiSuccess(`POST ${url}`, response.data);
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'POST', url);
    }
  },

  // Broker requirement creation (single) - wraps POST /broker
  async createBrokerRequirement(data) {
    try {
      // Ensure required fields mapping
      const payload = {
        brokerName: data.brokerName || data.name || '',
        companyName: data.companyName || data.company || '',
        contactNumber: data.contactNumber || data.phone || '',
        followUpDate: data.followUpDate || data.followUp || '',
        status: data.status || '',
        source: data.source || '',
        capturedBy: data.capturedBy || '',
        requirement: data.requirement || '',
        remark: data.remark || data.remarks || '',
      };
      const response = await api.post('/broker', payload);
      logger.apiSuccess('POST /broker', response.data);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'POST', '/broker');
    }
  },

  // Bulk broker upload convenience (expects array of records)
  async bulkUploadBrokers(records = []) {
    try {
      const response = await api.post('/broker/bulk-upload', { records });
      logger.apiSuccess('POST /broker/bulk-upload', { count: records.length });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'POST', '/broker/bulk-upload');
    }
  },

  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config);
      logger.apiSuccess(`PUT ${url}`, response.data);
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'PUT', url);
    }
  },

  async patch(url, data, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      logger.apiSuccess(`PATCH ${url}`, response.data);
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'PATCH', url);
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      logger.apiSuccess(`DELETE ${url}`, response.data);
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'DELETE', url);
    }
  },

  // File upload with progress
  async uploadFile(url, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        } : undefined,
      };

      const response = await api.post(url, formData, config);
      logger.apiSuccess(`UPLOAD ${url}`, { size: formData.size });
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'UPLOAD', url);
    }
  },

  // Batch requests
  async batch(requests) {
    try {
      const responses = await Promise.allSettled(
        requests.map(request => api(request))
      );
      
      const results = responses.map((response, index) => ({
        success: response.status === 'fulfilled',
        data: response.status === 'fulfilled' ? response.value.data : null,
        error: response.status === 'rejected' ? response.reason : null,
        originalRequest: requests[index]
      }));

      logger.info('Batch API request completed', {
        total: requests.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return results;
    } catch (error) {
      logger.error('Batch API request failed', error);
      throw error;
    }
  },

  // Error handler
  handleApiError(error, method, url) {
    // Add additional context to error
    error.context = {
      method,
      url,
      timestamp: new Date().toISOString()
    };

    return error;
  }
};

// Export both the enhanced service and raw axios instance
export default apiService;
export { api as axiosInstance };