import React from 'react';

// Loading Spinner Component
const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    white: 'border-white'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
};

// Skeleton Loading Component
const SkeletonLoader = ({ className = '', height = 'h-4', width = 'w-full' }) => {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${height} ${width} ${className}`} />
  );
};

// Card Skeleton
const CardSkeleton = ({ lines = 3, showImage = false }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
      {showImage && (
        <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {index === 0 && <div className="h-4 bg-gray-200 rounded w-1/2"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Skeleton
const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Full Page Loading
const FullPageLoading = ({ message = 'Loading...', showLogo = true }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900">RealtyXpo</h1>
          </div>
        )}
        
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
        <p className="text-sm text-gray-600">Please wait while we load your content...</p>
      </div>
    </div>
  );
};

// Button Loading State
const LoadingButton = ({ 
  loading = false, 
  disabled = false, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" color={variant === 'outline' ? 'gray' : 'white'} className="mr-2" />
      )}
      {loading ? loadingText : children}
    </button>
  );
};

// Progress Bar
const ProgressBar = ({ progress = 0, showPercentage = true, className = '', color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

// Page Loading Wrapper
const PageLoader = ({ loading, error, children, skeleton, minHeight = 'min-h-[400px]' }) => {
  if (error) {
    return (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="text-center">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500">{error?.message || 'An error occurred while loading content'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    if (skeleton) {
      return skeleton;
    }
    
    return (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

// Lazy Loading Wrapper for Components
const LazyWrapper = ({ children, fallback }) => {
  return (
    <React.Suspense fallback={fallback || <FullPageLoading />}>
      {children}
    </React.Suspense>
  );
};

// Export all components
export {
  LoadingSpinner,
  SkeletonLoader,
  CardSkeleton,
  TableSkeleton,
  FullPageLoading,
  LoadingButton,
  ProgressBar,
  PageLoader,
  LazyWrapper
};

// Default export for convenience
export default LoadingSpinner;