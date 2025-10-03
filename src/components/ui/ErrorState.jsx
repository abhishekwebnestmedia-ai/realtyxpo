import React from 'react';

/**
 * Error State Component for handling different types of errors
 * @param {Object} props - Component props
 * @param {string} props.type - Error type: 'no-data', 'api-error', 'loading'
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Array} props.actions - Array of action objects with {label, onClick, variant}
 * @param {React.ReactNode} props.children - Additional content
 */
const ErrorState = ({ 
  type = 'api-error',
  title,
  message,
  actions = [],
  children 
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'no-data':
        return (
          <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'api-error':
        return (
          <svg className="h-16 w-16 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getContainerClasses = () => {
    switch (type) {
      case 'no-data':
        return 'bg-white rounded-lg border p-8';
      case 'api-error':
        return 'bg-red-50 border border-red-200 rounded-lg p-4';
      default:
        return 'bg-white rounded-lg border p-8';
    }
  };

  const getTitleClasses = () => {
    switch (type) {
      case 'no-data':
        return 'text-lg font-medium text-gray-900 mb-2';
      case 'api-error':
        return 'text-red-800 font-medium';
      default:
        return 'text-lg font-medium text-gray-900 mb-2';
    }
  };

  const getMessageClasses = () => {
    switch (type) {
      case 'no-data':
        return 'text-gray-600 mb-1';
      case 'api-error':
        return 'text-red-600 text-sm mt-1';
      default:
        return 'text-gray-600 mb-1';
    }
  };

  return (
    <div className="p-6">
      <div className={getContainerClasses()}>
        <div className="text-center py-12">
          <div className="mx-auto mb-4">
            {getErrorIcon()}
          </div>
          <h3 className={getTitleClasses()}>{title}</h3>
          <p className={getMessageClasses()}>
            {message}
          </p>
          
          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-4 py-2 text-sm rounded transition-colors ${
                    action.variant === 'primary' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;