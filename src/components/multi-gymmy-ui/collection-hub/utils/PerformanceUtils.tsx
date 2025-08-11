import { useCallback, useMemo, useRef } from 'react';
import { FlatList, VirtualizedList } from 'react-native';

// Performance Configuration
export interface PerformanceConfig {
  batchSize: number;
  renderAheadDistance: number;
  maxToRenderPerBatch: number;
  windowSize: number;
  removeClippedSubviews: boolean;
  initialNumToRender: number;
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  batchSize: 10,
  renderAheadDistance: 5,
  maxToRenderPerBatch: 10,
  windowSize: 10,
  removeClippedSubviews: true,
  initialNumToRender: 10,
};

// Virtualization Helpers
export interface VirtualizedItem<T> {
  id: string;
  data: T;
  index: number;
}

export const createVirtualizedData = <T>(
  items: T[],
  getId: (item: T, index: number) => string
): VirtualizedItem<T>[] => {
  return items.map((item, index) => ({
    id: getId(item, index),
    data: item,
    index,
  }));
};

export const getVirtualizedItem = <T>(
  data: VirtualizedItem<T>[],
  index: number
): T | null => {
  return data[index]?.data || null;
};

export const getVirtualizedItemCount = <T>(data: VirtualizedItem<T>[]): number => {
  return data.length;
};

// Memory Management
export interface MemoryManager {
  clearCache: () => void;
  getMemoryUsage: () => number;
  optimizeMemory: () => void;
}

export const createMemoryManager = (): MemoryManager => {
  const cache = new Map<string, any>();
  
  return {
    clearCache: () => {
      cache.clear();
    },
    getMemoryUsage: () => {
      return cache.size;
    },
    optimizeMemory: () => {
      // Simple cache optimization - remove oldest entries if cache is too large
      if (cache.size > 100) {
        const entries = Array.from(cache.entries());
        const toRemove = entries.slice(0, 20); // Remove oldest 20 entries
        toRemove.forEach(([key]) => cache.delete(key));
      }
    },
  };
};

// Rendering Optimization Hooks
export const useOptimizedList = <T>(
  items: T[],
  getId: (item: T, index: number) => string,
  config: Partial<PerformanceConfig> = {}
) => {
  const performanceConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  const virtualizedData = useMemo(
    () => createVirtualizedData(items, getId),
    [items, getId]
  );

  const getItem = useCallback(
    (data: VirtualizedItem<T>[], index: number) => getVirtualizedItem(data, index),
    []
  );

  const getItemCount = useCallback(
    (data: VirtualizedItem<T>[]) => getVirtualizedItemCount(data),
    []
  );

  const keyExtractor = useCallback(
    (item: VirtualizedItem<T>) => item.id,
    []
  );

  return {
    virtualizedData,
    getItem,
    getItemCount,
    keyExtractor,
    performanceConfig,
  };
};

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef(0);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

// Image Loading Optimization
export interface ImageLoadConfig {
  preloadDistance: number;
  cacheSize: number;
  quality: 'low' | 'medium' | 'high';
}

export const DEFAULT_IMAGE_CONFIG: ImageLoadConfig = {
  preloadDistance: 3,
  cacheSize: 50,
  quality: 'medium',
};

export const shouldPreloadImage = (
  currentIndex: number,
  targetIndex: number,
  preloadDistance: number
): boolean => {
  return Math.abs(currentIndex - targetIndex) <= preloadDistance;
};

// Search Optimization
export const createSearchIndex = <T>(
  items: T[],
  searchFields: (keyof T)[]
): Map<string, T[]> => {
  const index = new Map<string, T[]>();

  items.forEach(item => {
    searchFields.forEach(field => {
      const value = String(item[field]).toLowerCase();
      const words = value.split(/\s+/);

      words.forEach(word => {
        if (word.length > 0) {
          if (!index.has(word)) {
            index.set(word, []);
          }
          index.get(word)!.push(item);
        }
      });
    });
  });

  return index;
};

export const searchWithIndex = <T>(
  query: string,
  searchIndex: Map<string, T[]>
): T[] => {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().split(/\s+/);
  const results = new Map<string, T>();

  searchTerms.forEach(term => {
    if (term.length > 0) {
      const matches = searchIndex.get(term) || [];
      matches.forEach(item => {
        const key = JSON.stringify(item);
        results.set(key, item);
      });
    }
  });

  return Array.from(results.values());
};

// Filter Optimization
export const createFilterCache = <T>(
  items: T[],
  filterFunctions: ((item: T) => boolean)[]
): Map<string, T[]> => {
  const cache = new Map<string, T[]>();

  const generateCacheKey = (filterStates: boolean[]): string => {
    return filterStates.map(state => state ? '1' : '0').join('');
  };

  const applyFilters = (filterStates: boolean[]): T[] => {
    return items.filter(item => {
      return filterStates.every((enabled, index) => {
        return !enabled || filterFunctions[index](item);
      });
    });
  };

  // Pre-compute common filter combinations
  const commonCombinations = [
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
    [false, false, false, true],
    [true, true, false, false],
    [true, false, true, false],
    [false, true, true, false],
  ];

  commonCombinations.forEach(combination => {
    const key = generateCacheKey(combination);
    cache.set(key, applyFilters(combination));
  });

  return cache;
};

// Animation Performance
export const useAnimationOptimizer = () => {
  const animationRefs = useRef<Map<string, any>>(new Map());

  const registerAnimation = useCallback((id: string, animation: any) => {
    animationRefs.current.set(id, animation);
  }, []);

  const unregisterAnimation = useCallback((id: string) => {
    animationRefs.current.delete(id);
  }, []);

  const pauseAllAnimations = useCallback(() => {
    animationRefs.current.forEach(animation => {
      if (animation && typeof animation.stop === 'function') {
        animation.stop();
      }
    });
  }, []);

  const resumeAllAnimations = useCallback(() => {
    animationRefs.current.forEach(animation => {
      if (animation && typeof animation.start === 'function') {
        animation.start();
      }
    });
  }, []);

  return {
    registerAnimation,
    unregisterAnimation,
    pauseAllAnimations,
    resumeAllAnimations,
  };
};

// Performance Monitoring
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  interactionTime: number;
}

export const createPerformanceMonitor = () => {
  const metrics: PerformanceMetrics[] = [];

  const recordMetric = (metric: Partial<PerformanceMetrics>) => {
    metrics.push({
      renderTime: 0,
      memoryUsage: 0,
      frameRate: 60,
      interactionTime: 0,
      ...metric,
    });

    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  };

  const getAverageMetrics = (): PerformanceMetrics => {
    if (metrics.length === 0) {
      return {
        renderTime: 0,
        memoryUsage: 0,
        frameRate: 60,
        interactionTime: 0,
      };
    }

    const sum = metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        frameRate: acc.frameRate + metric.frameRate,
        interactionTime: acc.interactionTime + metric.interactionTime,
      }),
      { renderTime: 0, memoryUsage: 0, frameRate: 0, interactionTime: 0 }
    );

    const count = metrics.length;
    return {
      renderTime: sum.renderTime / count,
      memoryUsage: sum.memoryUsage / count,
      frameRate: sum.frameRate / count,
      interactionTime: sum.interactionTime / count,
    };
  };

  return {
    recordMetric,
    getAverageMetrics,
    clearMetrics: () => metrics.splice(0, metrics.length),
  };
}; 