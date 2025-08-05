import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SimpleLineChart, SimpleBarChart, HorizontalBarChart } from './SimpleCharts';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const AnalyticsCharts = React.memo(({ workoutHistory, exerciseHistory, userStats, bodyWeights }) => {

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
      
      const weekWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.workoutDate || workout.startTime);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      let totalVolume = 0;
      weekWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (exercise.sets) {
            exercise.sets.forEach(set => {
              if (set.weight && set.reps) {
                totalVolume += set.weight * set.reps;
              }
            });
          }
        });
      });
      
      volumes.push(totalVolume);
      if (i === 0) {
        labels.push('This Week');
      } else {
        labels.push(`${i}w ago`);
      }
    }
    
    return { data: volumes, labels };
  }, [workoutHistory]);

  // Body weight trends (last 10 entries)
  const bodyWeightData = useMemo(() => {
    if (!bodyWeights || bodyWeights.length === 0) {
      return { data: [], labels: [] };
    }
    
    const recentWeights = bodyWeights.slice(-10);
    const data = recentWeights.map(w => w.weight);
    const labels = recentWeights.map((w, index) => {
      const date = new Date(w.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    return { data, labels };
  }, [bodyWeights]);

  function getRatingColor(rating) {
    if (rating >= 8) return '#22c55e';
    if (rating >= 6) return '#84cc16';
    if (rating >= 4) return '#eab308';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Workout Frequency Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Workout Frequency (Last 8 Weeks)</Text>
        <SimpleBarChart
          data={workoutFrequencyData.data}
          labels={workoutFrequencyData.labels}
          width={chartWidth}
          height={200}
          color="#007AFF"
        />
      </View>

      {/* Duration Trends */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Duration Trends (Last 10 Workouts)</Text>
        <SimpleLineChart
          data={durationTrendData.data}
          labels={durationTrendData.labels}
          width={chartWidth}
          height={200}
          color="#10b981"
        />
      </View>

      {/* Ratings Distribution */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Workout Ratings Distribution</Text>
        <HorizontalBarChart
          data={ratingsData}
          width={chartWidth}
          height={250}
        />
      </View>

      {/* Exercise Frequency */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Most Frequent Exercises</Text>
        <SimpleBarChart
          data={exerciseFrequencyData.data}
          labels={exerciseFrequencyData.labels}
          width={chartWidth}
          height={200}
          color="#8b5cf6"
        />
      </View>

      {/* Volume Trends */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Volume Trends (Last 8 Weeks)</Text>
        <SimpleLineChart
          data={volumeTrendData.data}
          labels={volumeTrendData.labels}
          width={chartWidth}
          height={200}
          color="#f59e0b"
        />
      </View>

      {/* Body Weight Trends */}
      {bodyWeightData.data.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Body Weight Trends</Text>
          <SimpleLineChart
            data={bodyWeightData.data}
            labels={bodyWeightData.labels}
            width={chartWidth}
            height={200}
            color="#ec4899"
          />
        </View>
      )}
    </ScrollView>
  );
});

AnalyticsCharts.displayName = 'AnalyticsCharts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default AnalyticsCharts;