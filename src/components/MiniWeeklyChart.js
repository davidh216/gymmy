import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const MiniWeeklyChart = ({ workoutHistory = [] }) => { // Add default empty array
  const weeklyData = useMemo(() => {
    // Add safety check at the beginning
    if (!workoutHistory || !Array.isArray(workoutHistory) || workoutHistory.length === 0) {
      return [];
    }

    const weeks = [];
    const now = new Date();
    
    // Get last 7 weeks of data
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.workoutDate || workout.startTime);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      weeks.push({
        count: weekWorkouts.length,
        week: i === 0 ? 'This Week' : `${i}w ago`,
      });
    }
    
    return weeks;
  }, [workoutHistory]);

  const maxCount = Math.max(...weeklyData.map(w => w.count), 1);
  const chartWidth = screenWidth - 64; // Account for margins and padding
  const barWidth = (chartWidth - (weeklyData.length - 1) * 8) / weeklyData.length;

  // Return early if no data
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weekly Activity Trend</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No workout data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity Trend</Text>
      <View style={styles.chartContainer}>
        {weeklyData.map((week, index) => {
          const barHeight = Math.max((week.count / maxCount) * 40, 4); // Min height of 4
          const isCurrentWeek = index === weeklyData.length - 1;
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: isCurrentWeek ? '#007AFF' : '#e5e5e5',
                    },
                  ]}
                />
                {week.count > 0 && (
                  <Text style={[styles.barValue, { color: isCurrentWeek ? '#007AFF' : '#666' }]}>
                    {week.count}
                  </Text>
                )}
              </View>
              <Text style={[styles.barLabel, { color: isCurrentWeek ? '#007AFF' : '#999' }]}>
                {index === weeklyData.length - 1 ? 'Now' : `${7-index}w`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 50,
    marginBottom: 4,
  },
  bar: {
    borderRadius: 2,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  // New styles for no data state
  noDataContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default MiniWeeklyChart;