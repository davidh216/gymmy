// src/components/ErrorBoundaryWrapper.js
// Enhanced error boundary wrapper for comprehensive error handling

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

/**
 * Enhanced error boundary wrapper with different fallback modes
 * Provides comprehensive error handling for different types of components
 */
export const ErrorBoundaryWrapper = ({ 
  children, 
  fallbackMode = 'full',
  componentName = 'Component',
  onError,
  enableRetry = true,
  enableReporting = true 
}) => {
  
  // Different fallback UI based on mode
  const getFallbackComponent = () => {
    switch (fallbackMode) {
      case 'minimal':
        return MinimalErrorFallback;
      case 'inline':
        return InlineErrorFallback;
      case 'silent':
        return SilentErrorFallback;
      default:
        return ErrorFallback;
    }
  };

  const handleError = (error, errorInfo) => {
    // Enhanced error reporting
    const errorReport = {
      timestamp: new Date().toISOString(),
      component: componentName,
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error(`Error in ${componentName}:`, errorReport);

    // Report to error tracking service in production
    if (enableReporting && process.env.NODE_ENV === 'production') {
      // You can integrate with services like Sentry, Bugsnag, etc.
      // reportErrorToService(errorReport);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorReport);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={getFallbackComponent()}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Minimal error fallback for small components
const MinimalErrorFallback = ({ error, resetError }) => (
  <div style={{ 
    padding: '8px', 
    backgroundColor: '#ffebee', 
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#d32f2f'
  }}>
    Something went wrong
    {resetError && (
      <button 
        onClick={resetError}
        style={{
          marginLeft: '8px',
          padding: '2px 6px',
          fontSize: '11px',
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

// Inline error fallback for components within layouts
const InlineErrorFallback = ({ error, resetError }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#fff3e0',
    border: '1px dashed #ff9800',
    borderRadius: '8px',
    margin: '8px',
  }}>
    <span style={{ color: '#f57c00', marginRight: '8px' }}>⚠️</span>
    <span style={{ color: '#f57c00', fontSize: '14px' }}>Component error occurred</span>
    {resetError && (
      <button 
        onClick={resetError}
        style={{
          marginLeft: '12px',
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

// Silent error fallback - just logs error and shows nothing
const SilentErrorFallback = ({ error, resetError }) => {
  // Auto-retry after 2 seconds
  React.useEffect(() => {
    if (resetError) {
      const timer = setTimeout(resetError, 2000);
      return () => clearTimeout(timer);
    }
  }, [resetError]);

  return null;
};

// Convenience wrapper for screen-level components
export const ScreenErrorBoundary = ({ children, screenName }) => (
  <ErrorBoundaryWrapper
    fallbackMode="full"
    componentName={`${screenName}Screen`}
    enableRetry={true}
    enableReporting={true}
  >
    {children}
  </ErrorBoundaryWrapper>
);

// Convenience wrapper for widget components
export const WidgetErrorBoundary = ({ children, widgetName }) => (
  <ErrorBoundaryWrapper
    fallbackMode="inline"
    componentName={`${widgetName}Widget`}
    enableRetry={true}
    enableReporting={false}
  >
    {children}
  </ErrorBoundaryWrapper>
);

// Convenience wrapper for list items
export const ListItemErrorBoundary = ({ children, itemType }) => (
  <ErrorBoundaryWrapper
    fallbackMode="minimal"
    componentName={`${itemType}ListItem`}
    enableRetry={false}
    enableReporting={false}
  >
    {children}
  </ErrorBoundaryWrapper>
);

export default ErrorBoundaryWrapper;