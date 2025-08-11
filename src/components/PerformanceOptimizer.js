// src/components/PerformanceOptimizer.js
// Performance optimization utilities for memory reduction and efficiency

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Memory-optimized component wrapper with automatic cleanup
 */
export const MemoryOptimizedComponent = memo(({ 
  children, 
  cleanupOnUnmount = true,
  debugName = 'Component'
}) => {
  const timeoutRefs = useRef(new Set());
  const intervalRefs = useRef(new Set());
  const animationRefs = useRef(new Set());

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();

    // Clear all intervals
    intervalRefs.current.forEach(interval => clearInterval(interval));
    intervalRefs.current.clear();

    // Cancel all animation frames
    animationRefs.current.forEach(animation => cancelAnimationFrame(animation));
    animationRefs.current.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log(`Cleaned up resources for ${debugName}`);
    }
  }, [debugName]);

  // Cleanup on unmount
  useEffect(() => {
    if (cleanupOnUnmount) {
      return cleanup;
    }
  }, [cleanup, cleanupOnUnmount]);

  // Enhanced timeout that auto-tracks for cleanup
  const createTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutRefs.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutRefs.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Enhanced interval that auto-tracks for cleanup
  const createInterval = useCallback((callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervalRefs.current.add(intervalId);
    return intervalId;
  }, []);

  // Enhanced requestAnimationFrame that auto-tracks for cleanup
  const createAnimationFrame = useCallback((callback) => {
    const animationId = requestAnimationFrame(() => {
      animationRefs.current.delete(animationId);
      callback();
    });
    animationRefs.current.add(animationId);
    return animationId;
  }, []);

  // Provide utilities to children via context or props
  const enhancedChildren = React.cloneElement(children, {
    createTimeout,
    createInterval,
    createAnimationFrame,
    cleanup,
  });

  return enhancedChildren;
});

/**
 * Lazy loading wrapper with memory optimization
 */
export const LazyComponent = ({ 
  loader, 
  fallback = <div>Loading...</div>,
  delay = 100,
  ...props 
}) => {
  const LazyLoadedComponent = useMemo(() => {
    return React.lazy(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(loader());
        }, delay);
      });
    });
  }, [loader, delay]);

  return (
    <React.Suspense fallback={fallback}>
      <LazyLoadedComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Virtual list component for large datasets
 */
export const VirtualizedList = memo(({ 
  items = [], 
  renderItem, 
  itemHeight = 60, 
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Handle scroll with throttling
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Spacer before visible items */}
      <div style={{ height: visibleRange.start * itemHeight }} />
      
      {/* Visible items */}
      {visibleItems.map((item, index) => (
        <div
          key={visibleRange.start + index}
          style={{ height: itemHeight }}
        >
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
      
      {/* Spacer after visible items */}
      <div style={{ 
        height: (items.length - visibleRange.end) * itemHeight 
      }} />
    </div>
  );
});

/**
 * Image lazy loading with memory optimization
 */
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  width, 
  height,
  placeholder = null,
  onLoad,
  onError,
  ...props 
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = useRef(null);

  const handleLoad = useCallback((event) => {
    setLoaded(true);
    if (onLoad) onLoad(event);
  }, [onLoad]);

  const handleError = useCallback((event) => {
    setError(true);
    if (onError) onError(event);
  }, [onError]);

  // Intersection observer for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src]);

  if (error) {
    return placeholder || <div style={{ width, height, backgroundColor: '#f0f0f0' }} />;
  }

  return (
    <>
      {!loaded && placeholder}
      <img
        ref={imgRef}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: loaded ? 'block' : 'none' }}
        {...props}
      />
    </>
  );
});

/**
 * Debounced component updates
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Memory usage monitor (development only)
 */
export const useMemoryMonitor = (componentName) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startMemory = performance.memory?.usedJSHeapSize;
    
    return () => {
      const endMemory = performance.memory?.usedJSHeapSize;
      if (startMemory && endMemory) {
        const diff = endMemory - startMemory;
        if (diff > 1024 * 1024) { // More than 1MB
          console.warn(`${componentName} used ${(diff / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    };
  }, [componentName]);
};

export default {
  MemoryOptimizedComponent,
  LazyComponent,
  VirtualizedList,
  OptimizedImage,
  useDebouncedValue,
  useMemoryMonitor,
};