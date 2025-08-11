// src/components/PerformanceOptimizer.js
// Memory-optimized component wrapper and performance utilities

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

// Memory-optimized component wrapper with automatic cleanup
export const MemoryOptimizedComponent = ({ 
  children, 
  cleanupOnUnmount = true,
  onMemoryWarning,
  ...props 
}) => {
  const timersRef = useRef(new Set());
  const intervalsRef = useRef(new Set());
  const animationsRef = useRef(new Set());
  const listenersRef = useRef(new Set());

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    timersRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach(intervalId => {
      clearInterval(intervalId);
    });
    intervalsRef.current.clear();

    // Stop all animations
    animationsRef.current.forEach(animation => {
      if (animation && typeof animation.stop === 'function') {
        animation.stop();
      }
    });
    animationsRef.current.clear();

    // Remove all listeners
    listenersRef.current.forEach(({ target, event, handler }) => {
      if (target && target.removeEventListener) {
        target.removeEventListener(event, handler);
      }
    });
    listenersRef.current.clear();
  }, []);

  // Memory warning handler
  useEffect(() => {
    const handleMemoryWarning = () => {
      console.warn('Memory warning received - cleaning up resources');
      cleanup();
      if (onMemoryWarning) {
        onMemoryWarning();
      }
    };

    // In React Native, you might listen to memory warnings
    // This is a placeholder for actual memory warning handling
    return () => {
      if (cleanupOnUnmount) {
        cleanup();
      }
    };
  }, [cleanup, cleanupOnUnmount, onMemoryWarning]);

  // Expose cleanup function to children
  const contextValue = React.useMemo(() => ({
    addTimer: (timerId) => timersRef.current.add(timerId),
    addInterval: (intervalId) => intervalsRef.current.add(intervalId),
    addAnimation: (animation) => animationsRef.current.add(animation),
    addListener: (target, event, handler) => {
      listenersRef.current.add({ target, event, handler });
      if (target && target.addEventListener) {
        target.addEventListener(event, handler);
      }
    },
    cleanup,
  }), [cleanup]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Performance context for sharing cleanup functions
const PerformanceContext = React.createContext(null);

// Hook to access performance context
export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within MemoryOptimizedComponent');
  }
  return context;
};

// Debounced value hook for performance optimization
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memory monitoring hook (development only)
export const useMemoryMonitor = (componentName = 'Component') => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const { addTimer } = usePerformanceContext();

  useEffect(() => {
    if (__DEV__) {
      const updateMemoryInfo = () => {
        // In React Native, you might use Performance API or other methods
        // This is a placeholder for actual memory monitoring
        const mockMemoryInfo = {
          used: Math.random() * 100,
          total: 100,
          timestamp: Date.now(),
        };
        setMemoryInfo(mockMemoryInfo);
      };

      const timerId = setInterval(updateMemoryInfo, 5000);
      addTimer(timerId);

      return () => {
        clearInterval(timerId);
      };
    }
  }, [addTimer]);

  return memoryInfo;
};

// Optimized list component with virtualization support
export const OptimizedList = ({ 
  data, 
  renderItem, 
  keyExtractor,
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  removeClippedSubviews = true,
  ...props 
}) => {
  const { addAnimation } = usePerformanceContext();

  const optimizedRenderItem = useCallback(({ item, index }) => {
    return (
      <MemoryOptimizedComponent key={keyExtractor ? keyExtractor(item, index) : index}>
        {renderItem({ item, index })}
      </MemoryOptimizedComponent>
    );
  }, [renderItem, keyExtractor]);

  return (
    <FlatList
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      {...props}
    />
  );
};

// Image optimization component
export const OptimizedImage = ({ 
  source, 
  onLoad, 
  onError,
  placeholder,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError();
    }
  }, [onError]);

  if (hasError && placeholder) {
    return placeholder;
  }

  return (
    <Image
      source={source}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// Performance monitoring component (development only)
export const PerformanceMonitor = ({ children, componentName }) => {
  const memoryInfo = useMemoryMonitor(componentName);
  const [renderCount, setRenderCount] = useState(0);
  const renderTimeRef = useRef(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    renderTimeRef.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderTimeRef.current;
    if (__DEV__ && renderTime > 16) { // 60fps threshold
      console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  });

  if (!__DEV__) {
    return children;
  }

  return (
    <View style={styles.monitorContainer}>
      {children}
      <View style={styles.monitorOverlay}>
        <Text style={styles.monitorText}>
          Renders: {renderCount}
        </Text>
        {memoryInfo && (
          <Text style={styles.monitorText}>
            Memory: {memoryInfo.used.toFixed(1)}MB
          </Text>
        )}
      </View>
    </View>
  );
};

// Lazy loading hook for performance optimization
export const useLazyLoad = (dependencies, loadFunction, options = {}) => {
  const { delay = 100, enabled = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { addTimer } = usePerformanceContext();

  const load = useCallback(async () => {
    if (!enabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const timerId = setTimeout(async () => {
        const result = await loadFunction();
        setData(result);
        setIsLoading(false);
      }, delay);
      
      addTimer(timerId);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  }, [dependencies, loadFunction, delay, enabled, isLoading, addTimer]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load };
};

// Component memoization utility
export const withMemoization = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

// Batch update hook for performance
export const useBatchUpdate = (initialState) => {
  const [state, setState] = useState(initialState);
  const batchRef = useRef([]);
  const { addTimer } = usePerformanceContext();

  const batchUpdate = useCallback((updates) => {
    batchRef.current.push(...updates);
    
    const timerId = setTimeout(() => {
      if (batchRef.current.length > 0) {
        setState(prevState => {
          let newState = prevState;
          batchRef.current.forEach(update => {
            newState = typeof update === 'function' ? update(newState) : { ...newState, ...update };
          });
          batchRef.current = [];
          return newState;
        });
      }
    }, 0);

    addTimer(timerId);
  }, [addTimer]);

  return [state, batchUpdate];
};

const styles = StyleSheet.create({
  monitorContainer: {
    position: 'relative',
  },
  monitorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 4,
  },
  monitorText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'monospace',
  },
}); 