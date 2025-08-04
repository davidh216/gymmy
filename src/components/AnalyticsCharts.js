import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SimpleLineChart, SimpleBarChart, HorizontalBarChart } from './SimpleCharts';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const AnalyticsCharts = ({ workoutHistory, exerciseHistory, userStats, bodyWeights }) => {

  // Workout frequency over time (last 8 weeks)
  const workoutFrequencyData = useMemo(() => {
    const counts = [];
    const labels = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.workoutDate || workout.startTime);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      counts.push(weekWorkouts.length);
      // Create week labels
      if (i === 0) {
        labels.push('This Week');
      } else {
        labels.push(`${i}w ago`);
      }
    }
    
    return { data: counts, labels };
  }, [workoutHistory]);

  // Workout duration trends (last 10 workouts)
  const durationTrendData = useMemo(() => {
    const recentWorkouts = workoutHistory.slice(0, 10).reverse();
    const data = recentWorkouts.map(w => w.duration || 0);
    const labels = recentWorkouts.map((w, index) => `W${index + 1}`); // W1, W2, etc.
    return { data, labels };
  }, [workoutHistory]);

  // Workout ratings distribution for horizontal bar chart
  const ratingsData = useMemo(() => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    
    workoutHistory.forEach(workout => {
      const rating = workout.ratings?.workoutRating || 5;
      const roundedRating = Math.round(rating);
      if (ratingCounts[roundedRating] !== undefined) {
        ratingCounts[roundedRating]++;
      }
    });
    
    const data = Object.entries(ratingCounts)
      .filter(([_, count]) => count > 0)
      .map(([rating, count]) => ({
        label: `${rating}/10`,
        value: count,
        color: getRatingColor(parseInt(rating)),
      }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label)); // Sort by rating ascending
    
    return data.length > 0 ? data : [{ label: 'No Data', value: 1, color: '#ccc' }];
  }, [workoutHistory]);

  // Exercise frequency (top 6 exercises)
  const exerciseFrequencyData = useMemo(() => {
    const exerciseCounts = {};
    
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
      });
    });
    
    const sortedExercises = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
    
    return {
      data: sortedExercises.map(([, count]) => count),
      labels: sortedExercises.map(([name]) => name.length > 10 ? name.substring(0, 10) + '...' : name)
    };
  }, [workoutHistory]);

  // Volume trends for strength exercises (last 8 weeks)
  const volumeTrendData = useMemo(() => {
    const volumes = [];
    const labels = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      let weekVolume = 0;
      const weekWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.workoutDate || workout.startTime);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      weekWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (exercise.sets && !exercise.cardioData) {
            exercise.sets.forEach(set => {
              if (set.weight && set.reps) {
                weekVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
              }
            });
          }
        });
      });
      
      volumes.push(Math.round(weekVolume));
      // Create week labels
      if (i === 0) {
        labels.push('This Week');
      } else {
        labels.push(`${i}w ago`);
      }
    }
    
    return { data: volumes, labels };
  }, [workoutHistory]);

  function getRatingColor(rating) {
    if (rating >= 9) return '#22c55e';
    if (rating >= 7) return '#84cc16';
    if (rating >= 5) return '#eab308';
    if (rating >= 3) return '#f97316';
    return '#ef4444';
  }

  if (workoutHistory.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No workout data available</Text>
        <Text style={styles.emptyStateSubtext}>Complete some workouts to see your analytics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Workout Analytics</Text>
      
      {/* Workout Frequency Chart */}
      <SimpleLineChart
        data={workoutFrequencyData}
        title="Weekly Workout Frequency"
        subtitle="Workouts completed per week (last 8 weeks)"
        color="#007AFF"
      />

      {/* Duration Trends Chart */}
      <SimpleLineChart
        data={durationTrendData}
        title="Workout Duration Trends"
        subtitle="Duration in minutes (last 10 workouts)"
        color="#22c55e"
      />

      {/* Volume Trends Chart */}
      <SimpleLineChart
        data={volumeTrendData}
        title="Weekly Training Volume"
        subtitle="Total weight × reps (last 8 weeks)"
        color="#ef4444"
      />

      {/* Exercise Frequency Bar Chart */}
      <SimpleBarChart
        data={exerciseFrequencyData.data}
        labels={exerciseFrequencyData.labels}
        title="Most Frequent Exercises"
        subtitle="Times performed across all workouts"
        color="#8b5cf6"
      />

      {/* Body Weight Trend Chart */}
      {bodyWeights && bodyWeights.length > 1 && (
        <SimpleLineChart
          data={{
            data: bodyWeights.slice(-12).map(entry => entry.weight),
            labels: bodyWeights.slice(-12).map(entry => 
              new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            )
          }}
          title="Body Weight Trend"
          subtitle="Weight changes over time (last 12 entries)"
          color="#8b5cf6"
        />
      )}

      {/* Workout Ratings Horizontal Bar Chart */}
      <HorizontalBarChart
        data={ratingsData}
        title="Workout Rating Distribution"
        subtitle="How you've rated your workouts"
        height={Math.max(200, ratingsData.length * 40 + 80)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default AnalyticsCharts;