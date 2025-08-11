// src/components/multi-gymmy-ui/shared/PerformanceUtils.tsx
// Performance optimization utilities for Multi-Gymmy UI components

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface PerformanceConfig {
  enableNativeDriver?: boolean;
  maxAnimationDuration?: number;
  throttleInterval?: number;
  maxRenderItems?: number;
  lazyLoadThreshold?: number;
  memoryWarningThreshold?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  animationFrameRate: number;
  componentCount: number;
}

export interface OptimizationSettings {
  reduceAnimations: boolean;
  enableVirtualization: boolean;
  limitParticleEffects: boolean;
  cacheStaticContent: boolean;
  throttleUpdates: boolean;
}

// ==============================================================================
// PERFORMANCE MONITORING HOOK
// ==============================================================================

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const renderStartTime = useRef(0);
  const lastRenderTime = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      lastRenderTime.current = renderTime;
      
      if (renderTime > 16.67) { // More than one frame at 60fps
        console.warn(
          `[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms ` +
          `(render #${renderCount.current})`
        );
      }
    };
  });
  
  const getMetrics = useCallback((): PerformanceMetrics => ({
    renderTime: lastRenderTime.current,
    memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    animationFrameRate: 60, // Would be calculated from actual frame timing
    componentCount: renderCount.current,
  }), []);
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    getMetrics,
  };
};

// ==============================================================================
// THROTTLING AND DEBOUNCING
// ==============================================================================

export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number,
  deps: React.DependencyList
) => {
  const lastCall = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    (...args: T) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay, ...deps]
  );
};

export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number,
  deps: React.DependencyList
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  );
};

// ==============================================================================
// LAZY LOADING AND VIRTUALIZATION
// ==============================================================================

export const useLazyLoad = <T extends any>(
  items: T[],
  pageSize: number = 20,
  threshold: number = 5
) => {
  const loadedCount = useRef(pageSize);
  const isLoading = useRef(false);
  
  const loadMoreItems = useCallback(() => {
    if (isLoading.current || loadedCount.current >= items.length) {
      return false;
    }
    
    isLoading.current = true;
    
    // Use InteractionManager to ensure smooth animations
    InteractionManager.runAfterInteractions(() => {
      const newCount = Math.min(loadedCount.current + pageSize, items.length);
      loadedCount.current = newCount;
      isLoading.current = false;
    });
    
    return true;
  }, [items.length, pageSize]);
  
  const shouldLoadMore = useCallback((index: number) => {
    return index >= loadedCount.current - threshold;
  }, [threshold]);
  
  const visibleItems = useMemo(() => {
    return items.slice(0, loadedCount.current);
  }, [items, loadedCount.current]);
  
  return {
    visibleItems,
    loadMoreItems,
    shouldLoadMore,
    hasMore: loadedCount.current < items.length,
    isLoading: isLoading.current,
  };
};

// ==============================================================================
// MEMORY OPTIMIZATION
// ==============================================================================

export const useMemoryOptimization = (config: PerformanceConfig = {}) => {
  const cacheRef = useRef(new Map());
  const gcTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    memoryWarningThreshold = 50 * 1024 * 1024, // 50MB
  } = config;
  
  // Memory monitoring
  useEffect(() => {
    const checkMemoryUsage = () => {
      const memInfo = (performance as any).memory;
      if (memInfo && memInfo.usedJSHeapSize > memoryWarningThreshold) {
        console.warn('[Performance] High memory usage detected:', {
          used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        });
        
        // Trigger garbage collection hint
        if (cacheRef.current.size > 100) {
          clearCache();
        }
      }
    };
    
    const interval = setInterval(checkMemoryUsage, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [memoryWarningThreshold]);
  
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('[Performance] Cache cleared due to memory pressure');
  }, []);
  
  const memoizeValue = useCallback(<T extends any>(key: string, factory: () => T): T => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key);
    }
    
    const value = factory();
    cacheRef.current.set(key, value);
    
    // Schedule cleanup
    if (gcTimeoutRef.current) {
      clearTimeout(gcTimeoutRef.current);
    }
    gcTimeoutRef.current = setTimeout(() => {
      if (cacheRef.current.size > 50) { // Keep cache size reasonable
        const keys = Array.from(cacheRef.current.keys());
        const keysToDelete = keys.slice(0, Math.floor(keys.length / 2));
        keysToDelete.forEach(k => cacheRef.current.delete(k));
      }
    }, 30000); // Cleanup after 30 seconds of inactivity
    
    return value;
  }, []);
  
  return {
    memoizeValue,
    clearCache,
    cacheSize: cacheRef.current.size,
  };
};

// ==============================================================================
// ADAPTIVE PERFORMANCE
// ==============================================================================

export const useAdaptivePerformance = () => {
  const performanceLevel = useRef<'high' | 'medium' | 'low'>('high');
  const frameDropCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  
  const checkPerformance = useCallback(() => {
    const now = performance.now();
    const frameDelta = now - lastFrameTime.current;
    lastFrameTime.current = now;
    
    // If frame took longer than ~16.67ms (60fps), it's a drop
    if (frameDelta > 20) {
      frameDropCount.current++;
    }
    
    // Adjust performance level based on frame drops
    if (frameDropCount.current > 10) {
      if (performanceLevel.current === 'high') {
        performanceLevel.current = 'medium';
        console.log('[Performance] Switched to medium performance mode');
      } else if (performanceLevel.current === 'medium') {
        performanceLevel.current = 'low';
        console.log('[Performance] Switched to low performance mode');
      }
      frameDropCount.current = 0;
    }
    
    // Reset frame drop count periodically
    setTimeout(() => {
      frameDropCount.current = Math.max(0, frameDropCount.current - 1);
    }, 1000);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(checkPerformance, 100);
    return () => clearInterval(interval);
  }, [checkPerformance]);
  
  const getOptimizationSettings = useCallback((): OptimizationSettings => {
    switch (performanceLevel.current) {
      case 'low':
        return {
          reduceAnimations: true,
          enableVirtualization: true,
          limitParticleEffects: true,
          cacheStaticContent: true,
          throttleUpdates: true,
        };
      case 'medium':
        return {
          reduceAnimations: false,
          enableVirtualization: true,
          limitParticleEffects: true,
          cacheStaticContent: true,
          throttleUpdates: false,
        };
      default: // high
        return {
          reduceAnimations: false,
          enableVirtualization: false,
          limitParticleEffects: false,
          cacheStaticContent: false,
          throttleUpdates: false,
        };
    }
  }, []);
  
  return {
    performanceLevel: performanceLevel.current,
    optimizationSettings: getOptimizationSettings(),
    frameDropCount: frameDropCount.current,
  };
};

// ==============================================================================
// PLATFORM-SPECIFIC OPTIMIZATIONS
// ==============================================================================

export const usePlatformOptimizations = () => {
  const optimizations = useMemo(() => {
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';
    
    return {
      // iOS optimizations
      useNativeDriver: isIOS, // iOS handles native driver better
      enableHardwareAcceleration: isIOS,
      useCoreAnimation: isIOS,
      
      // Android optimizations
      useTextureView: isAndroid,
      enableRenderThread: isAndroid,
      optimizeListScrolling: isAndroid,
      
      // Common optimizations
      enableFastImage: true,
      useImageCaching: true,
      enableInteractionManager: true,
    };
  }, []);
  
  const getAnimationConfig = useCallback((baseConfig: any) => ({
    ...baseConfig,
    useNativeDriver: optimizations.useNativeDriver && baseConfig.useNativeDriver !== false,
  }), [optimizations.useNativeDriver]);
  
  return {
    optimizations,
    getAnimationConfig,
  };
};

// ==============================================================================
// PERFORMANCE UTILITIES
// ==============================================================================

export const PerformanceUtils = {
  // Measure execution time
  measureExecutionTime: <T>(fn: () => T, label?: string): T => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    if (label) {
      console.log(`[Performance] ${label}: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  },
  
  // Check if device is low-end
  isLowEndDevice: (): boolean => {
    if (Platform.OS === 'web') {
      return navigator.hardwareConcurrency <= 2;
    }
    
    // This would need platform-specific implementation
    // For now, assume false
    return false;
  },
  
  // Get optimal batch size based on device performance
  getOptimalBatchSize: (baseSize: number = 20): number => {
    if (PerformanceUtils.isLowEndDevice()) {
      return Math.floor(baseSize * 0.5);
    }
    return baseSize;
  },
  
  // Schedule work to avoid blocking animations
  scheduleWork: (work: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
    switch (priority) {
      case 'high':
        // Run immediately
        work();
        break;
      case 'normal':
        // Run after current interactions
        InteractionManager.runAfterInteractions(work);
        break;
      case 'low':
        // Run when idle
        setTimeout(work, 0);
        break;
    }
  },
};

export default {
  usePerformanceMonitor,
  useThrottle,
  useDebounce,
  useLazyLoad,
  useMemoryOptimization,
  useAdaptivePerformance,
  usePlatformOptimizations,
  PerformanceUtils,
};