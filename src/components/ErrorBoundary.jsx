import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error with context
    logger.error('React Error Boundary caught an error', error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Report to error tracking service in production
    if (import.meta.env.PROD && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          errorBoundary: this.constructor.name,
          errorId
        },
        extra: {
          errorInfo,
          props: this.props
        }
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportIssue = () => {
    const { error, errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
URL: ${window.location.href}
Error: ${error?.message || 'Unknown error'}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
`);
    
    window.open(`mailto:support@realtyxpo.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const { fallback, level = 'page' } = this.props;

      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback(error, this.handleRetry, errorId);
      }

      // Different UI based on error level
      if (level === 'component') {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
            </div>
            <p className="text-sm text-red-700 mb-3">
              This component encountered an error. You can try refreshing or contact support.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={this.handleRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
              {errorId && (
                <span className="text-xs text-red-600">Error ID: {errorId}</span>
              )}
            </div>
          </div>
        );
      }

      // Full page error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Oops! Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We encountered an unexpected error. Our team has been notified.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details</h3>
                  {errorId && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Error ID:</strong> {errorId}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Message:</strong> {error?.message || 'Unknown error occurred'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reload Page
                  </button>

                  <button
                    onClick={this.handleReportIssue}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Report Issue
                  </button>
                </div>

                <div className="text-center">
                  <a
                    href="/"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    ← Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Development-only error details */}
          {import.meta.env.DEV && this.state.errorInfo && (
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-900 mb-4">Debug Information (Development Only)</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-red-800">Error Stack:</h4>
                    <pre className="mt-1 text-sm text-red-700 bg-red-100 p-2 rounded overflow-auto">
                      {error?.stack}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800">Component Stack:</h4>
                    <pre className="mt-1 text-sm text-red-700 bg-red-100 p-2 rounded overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;