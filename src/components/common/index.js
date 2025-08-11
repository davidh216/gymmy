// src/components/common/index.js
// Centralized export for all common/shared components

// Existing components
export { default as LoadingFallback } from '../LoadingFallback';
export { default as ErrorFallback } from '../ErrorFallback';
export { default as ErrorBoundary } from '../ErrorBoundary';
export { default as MotivationalQuote } from '../MotivationalQuote';
export { default as SimpleCharts } from '../SimpleCharts';
export { default as GamificationStats } from '../GamificationStats';
export { default as EnhancedGamificationStats } from '../EnhancedGamificationStats';
export { default as AnalyticsCharts } from '../AnalyticsCharts';
export { default as AnalyticsPreview } from '../AnalyticsPreview';

// Enhanced Error Boundary System
export {
  ScreenErrorBoundary,
  WidgetErrorBoundary,
  ListItemErrorBoundary,
  AutoRetryErrorBoundary,
  useErrorReporting,
  useAutoRetry,
  ErrorBoundaryWrapper,
} from '../ErrorBoundaryWrapper';

// Performance Optimization System
export {
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
} from '../PerformanceOptimizer';