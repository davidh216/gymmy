// Test error boundary system
import React from 'react';
import {
  ScreenErrorBoundary,
  WidgetErrorBoundary,
  ListItemErrorBoundary,
  AutoRetryErrorBoundary,
  useErrorReporting,
  useAutoRetry,
} from '../components/common';

// Component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return React.createElement('div', null, 'Normal component');
};

describe('Error Boundary System', () => {
  test('Error boundaries can be imported successfully', () => {
    expect(ScreenErrorBoundary).toBeDefined();
    expect(WidgetErrorBoundary).toBeDefined();
    expect(ListItemErrorBoundary).toBeDefined();
    expect(AutoRetryErrorBoundary).toBeDefined();
  });

  test('Error reporting hook can be imported', () => {
    expect(useErrorReporting).toBeDefined();
    expect(typeof useErrorReporting).toBe('function');
  });

  test('Auto retry hook can be imported', () => {
    expect(useAutoRetry).toBeDefined();
    expect(typeof useAutoRetry).toBe('function');
  });

  test('Error boundaries are React components', () => {
    expect(typeof ScreenErrorBoundary).toBe('function');
    expect(typeof WidgetErrorBoundary).toBe('function');
    expect(typeof ListItemErrorBoundary).toBe('function');
  });
});

describe('Performance Optimization System', () => {
  test('Performance components can be imported', () => {
    const { 
      MemoryOptimizedComponent,
      usePerformanceContext,
      useDebouncedValue,
      useMemoryMonitor,
      OptimizedList,
      OptimizedImage,
      PerformanceMonitor,
      useLazyLoad,
      withMemoization,
      useBatchUpdate,
    } = require('../components/PerformanceOptimizer');

    expect(MemoryOptimizedComponent).toBeDefined();
    expect(usePerformanceContext).toBeDefined();
    expect(useDebouncedValue).toBeDefined();
    expect(useMemoryMonitor).toBeDefined();
    expect(OptimizedList).toBeDefined();
    expect(OptimizedImage).toBeDefined();
    expect(PerformanceMonitor).toBeDefined();
    expect(useLazyLoad).toBeDefined();
    expect(withMemoization).toBeDefined();
    expect(useBatchUpdate).toBeDefined();
  });
}); 