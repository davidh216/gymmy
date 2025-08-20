// src/components/ErrorBoundaryWrapper.js
// Enhanced error boundary system with multiple fallback modes

import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Alert
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

// Screen-level error boundary for full-screen error handling
export const ScreenErrorBoundary = ({ children, onError, ...props }) => {
  const handleError = (error, errorInfo) => {
    console.error('Screen Error Boundary caught error:', error, errorInfo);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      FallbackComponent={ScreenErrorFallback}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
};

// Widget-level error boundary for inline component error handling
export const WidgetErrorBoundary = ({ children, onError, ...props }) => {
  const handleError = (error, errorInfo) => {
    console.error('Widget Error Boundary caught error:', error, errorInfo);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      FallbackComponent={WidgetErrorFallback}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
};

// List item error boundary for minimal error display
export const ListItemErrorBoundary = ({ children, onError, ...props }) => {
  const handleError = (error, errorInfo) => {
    console.error('List Item Error Boundary caught error:', error, errorInfo);
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      FallbackComponent={ListItemErrorFallback}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
};

// Screen Error Fallback Component
const ScreenErrorFallback = ({ error, resetError }) => {
  return (
    <View style={styles.screenContainer}>
      <ErrorFallback error={error} resetError={resetError} />
    </View>
  );
};

// Widget Error Fallback Component
const WidgetErrorFallback = ({ error, resetError }) => {
  return (
    <View style={styles.widgetContainer}>
      <View style={styles.widgetErrorCard}>
        <Ionicons name="warning" size={32} color="#ef4444" />
        <Text style={styles.widgetTitle}>Widget Error</Text>
        <Text style={styles.widgetMessage}>
          This widget encountered an error. Please try again.
        </Text>
        <TouchableOpacity style={styles.widgetRetryButton} onPress={resetError}>
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.widgetRetryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// List Item Error Fallback Component
const ListItemErrorFallback = ({ error, resetError }) => {
  return (
    <View style={styles.listItemContainer}>
      <View style={styles.listItemErrorCard}>
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text style={styles.listItemText}>Item unavailable</Text>
        <TouchableOpacity style={styles.listItemRetryButton} onPress={resetError}>
          <Ionicons name="refresh" size={14} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Error reporting hook for production monitoring
export const useErrorReporting = () => {
  const reportError = React.useCallback((error, errorInfo, context = {}) => {
    // In production, this would send to error reporting service
    console.error('Error Report:', {
      error: error?.message || error,
      stack: error?.stack,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
    });
    
    // Example: Send to analytics or error tracking service
    // Analytics.track('app_error', { error, context });
  }, []);

  return { reportError };
};

// Auto-retry functionality hook
export const useAutoRetry = (maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async (operation) => {
    if (retryCount >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded`);
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, delay * retryCount));
      // const result = ...; // Quick fix: commented unused variable
      setIsRetrying(false);
      setRetryCount(0);
      return result;
    } catch (error) {
      setIsRetrying(false);
      throw error;
    }
  }, [retryCount, maxRetries, delay]);

  return { retry, retryCount, isRetrying };
};

// Enhanced error boundary with auto-retry
export const AutoRetryErrorBoundary = ({ 
  children, 
  maxRetries = 3, 
  onError, 
  ...props 
}) => {
  const { retry, retryCount, isRetrying } = useAutoRetry(maxRetries);
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback(async (error, errorInfo) => {
    console.error('AutoRetry Error Boundary caught error:', error, errorInfo);
    setError(error);
    setHasError(true);

    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry logic
    try {
      await retry(async () => {
        setHasError(false);
        setError(null);
        return Promise.resolve();
      });
    } catch (retryError) {
      console.error('Auto-retry failed:', retryError);
    }
  }, [retry, onError]);

  if (hasError && !isRetrying) {
    return (
      <View style={styles.autoRetryContainer}>
        <View style={styles.autoRetryCard}>
          <Ionicons name="refresh" size={32} color="#007AFF" />
          <Text style={styles.autoRetryTitle}>Retrying...</Text>
          <Text style={styles.autoRetryMessage}>
            Attempt {retryCount} of {maxRetries}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary onError={handleError} {...props}>
      {children}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  widgetContainer: {
    padding: 16,
  },
  widgetErrorCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 8,
    marginBottom: 4,
  },
  widgetMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  widgetRetryButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
  widgetRetryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  listItemContainer: {
    padding: 8,
  },
  listItemErrorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  listItemText: {
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
    marginLeft: 8,
  },
  listItemRetryButton: {
    padding: 4,
  },
  autoRetryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  autoRetryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  autoRetryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 4,
  },
  autoRetryMessage: {
    fontSize: 14,
    color: '#666',
  },
});

export default {
  ScreenErrorBoundary,
  WidgetErrorBoundary,
  ListItemErrorBoundary,
  AutoRetryErrorBoundary,
  useErrorReporting,
  useAutoRetry,
}; 