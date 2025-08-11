// src/screens/DashboardScreen.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context';
import { 
  ScreenErrorBoundary, 
  WidgetErrorBoundary,
  MemoryOptimizedComponent,
  useMemoryMonitor,
  useDebouncedValue
} from '../components/common';
import { useSystemIntegration } from '../context/SystemIntegrationFix';

// Lazy load heavy components
const AdaptiveDashboard = React.lazy(() => import('../components/AdaptiveDashboard'));
const AnalyticsPreview = React.lazy(() => import('../components/AnalyticsPreview'));
const MotivationalQuote = React.lazy(() => import('../components/MotivationalQuote'));

const DashboardScreen = ({ navigation }) => {
  // Memory monitoring in development
  useMemoryMonitor('DashboardScreen');
  
  // System integration
  const systemIntegration = useSystemIntegration('Dashboard');

  const { 
    userStats, 
    workoutHistory, 
    characterSystem,
    updateUserStats,
    refreshData 
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search for performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Memoized filtered data
  const filteredWorkoutHistory = useMemo(() => {
    if (!debouncedSearchQuery) return workoutHistory;
    return workoutHistory.filter(workout => 
      workout.category?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      workout.exercises?.some(exercise => 
        exercise.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    );
  }, [workoutHistory, debouncedSearchQuery]);

  // Optimized refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshData();
      systemIntegration.emit('dashboard:refreshed', { timestamp: Date.now() });
    } catch (error) {
      systemIntegration.logError(error as Error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, systemIntegration]);

  // Error boundary fallback
  const DashboardErrorFallback = ({ error, resetError }) => (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Dashboard Error</Text>
      <Text style={styles.errorMessage}>
        Unable to load dashboard. Please try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={resetError}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <ScreenErrorBoundary screenName="Dashboard">
      <MemoryOptimizedComponent debugName="DashboardScreen" cleanupOnUnmount={true}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Section */}
            <WidgetErrorBoundary widgetName="Welcome">
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>
                  Welcome back! 💪
                </Text>
                <Text style={styles.subText}>
                  Ready for today's workout?
                </Text>
              </View>
            </WidgetErrorBoundary>

            {/* Motivational Quote */}
            <WidgetErrorBoundary widgetName="MotivationalQuote">
              <React.Suspense fallback={<View style={styles.loadingWidget} />}>
                <MotivationalQuote />
              </React.Suspense>
            </WidgetErrorBoundary>

            {/* Adaptive Dashboard */}
            <WidgetErrorBoundary widgetName="AdaptiveDashboard">
              <React.Suspense fallback={<View style={styles.loadingWidget} />}>
                <AdaptiveDashboard 
                  userStats={userStats}
                  workoutHistory={filteredWorkoutHistory}
                  characterSystem={characterSystem}
                />
              </React.Suspense>
            </WidgetErrorBoundary>

            {/* Analytics Preview */}
            <WidgetErrorBoundary widgetName="AnalyticsPreview">
              <React.Suspense fallback={<View style={styles.loadingWidget} />}>
                <AnalyticsPreview 
                  data={filteredWorkoutHistory}
                  userStats={userStats}
                />
              </React.Suspense>
            </WidgetErrorBoundary>

          </ScrollView>
        </SafeAreaView>
      </MemoryOptimizedComponent>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  loadingWidget: {
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;