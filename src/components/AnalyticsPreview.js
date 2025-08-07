import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SimpleLineChart } from './SimpleCharts';

// const { width } = Dimensions.get('window');

const AnalyticsPreview = ({ workoutHistory, bodyWeights, navigation }) => {
  // Calculate key metrics for preview
  const analytics = useMemo(() => {
    if (workoutHistory.length === 0) {
      return {
        weeklyFrequency: [],
        totalWorkouts: 0,
        avgDuration: 0,
        currentStreak: 0,
        weightTrend: 'stable',
        weightChange: 0,
      };
    }

    // Weekly frequency (last 4 weeks for mini chart)
    const weeklyFrequency = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.workoutDate || workout.startTime);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      weeklyFrequency.push(weekWorkouts.length);
    }

    // Average duration
    const totalDuration = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = Math.round(totalDuration / workoutHistory.length);

    // Weight trend analysis
    let weightTrend = 'stable';
    let weightChange = 0;
    
    if (bodyWeights && bodyWeights.length >= 2) {
      const recent = bodyWeights[0].weight;
      const previous = bodyWeights[1].weight;
      weightChange = recent - previous;
      
      if (weightChange > 0.5) weightTrend = 'increasing';
      else if (weightChange < -0.5) weightTrend = 'decreasing';
    }

    return {
      weeklyFrequency,
      totalWorkouts: workoutHistory.length,
      avgDuration,
      weightTrend,
      weightChange: Math.abs(weightChange),
    };
  }, [workoutHistory, bodyWeights]);

  const getTrendIcon = (trend) => {
    switch (trend) {
    case 'increasing': return 'trending-up';
    case 'decreasing': return 'trending-down';
    default: return 'remove';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
    case 'increasing': return '#ef4444';
    case 'decreasing': return '#22c55e';
    default: return '#6b7280';
    }
  };

  if (workoutHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={32} color="#ccc" />
        <Text style={styles.emptyText}>Complete workouts to see analytics</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="analytics" size={20} color="#007AFF" />
          <Text style={styles.headerTitle}>Quick Insights</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Progress', { initialTab: 'analytics' })}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Key Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{analytics.totalWorkouts}</Text>
          <Text style={styles.metricLabel}>Total Workouts</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{analytics.avgDuration}m</Text>
          <Text style={styles.metricLabel}>Avg Duration</Text>
        </View>
        
        {bodyWeights && bodyWeights.length > 1 && (
          <View style={styles.metricCard}>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon(analytics.weightTrend)} 
                size={16} 
                color={getTrendColor(analytics.weightTrend)} 
              />
              <Text style={[styles.metricValue, { fontSize: 14 }]}>
                {analytics.weightChange.toFixed(1)} lbs
              </Text>
            </View>
            <Text style={styles.metricLabel}>Weight Change</Text>
          </View>
        )}
      </View>

      {/* Mini Frequency Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Activity (Last 4 Weeks)</Text>
        <View style={styles.miniChart}>
          <SimpleLineChart
            data={analytics.weeklyFrequency}
            height={80}
            color="#007AFF"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  miniChart: {
    height: 80,
    overflow: 'hidden',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AnalyticsPreview;