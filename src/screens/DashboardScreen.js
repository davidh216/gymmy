import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import WorkoutCalendar from '../components/WorkoutCalendar';

const DashboardScreen = ({ navigation }) => {
  const { workoutHistory, userStats, loading, updateWorkout } = useApp();

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // This week's workouts
    const thisWeekWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= thisWeek;
    });

    // This month's workouts
    const thisMonthWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= thisMonth;
    });

    // Calculate average workout rating for this month
    const avgRating = thisMonthWorkouts.length > 0 
      ? thisMonthWorkouts.reduce((sum, w) => sum + (w.ratings?.workoutRating || 5), 0) / thisMonthWorkouts.length
      : 0;

    // Calculate streak
    let currentStreak = 0;
    if (workoutHistory.length > 0) {
      const sortedWorkouts = [...workoutHistory].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      let foundGap = false;
      
      while (!foundGap && currentStreak < 30) { // Max 30 day check
        const dayWorkouts = sortedWorkouts.filter(workout => {
          const workoutDate = new Date(workout.startTime);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === checkDate.getTime();
        });
        
        if (dayWorkouts.length > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          foundGap = true;
        }
      }
    }

    // Most frequent exercise
    const exerciseCount = {};
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
      });
    });
    
    const favoriteExercise = Object.keys(exerciseCount).length > 0 
      ? Object.keys(exerciseCount).reduce((a, b) => exerciseCount[a] > exerciseCount[b] ? a : b)
      : 'None yet';

    return {
      totalWorkouts: workoutHistory.length,
      thisWeekCount: thisWeekWorkouts.length,
      thisMonthCount: thisMonthWorkouts.length,
      avgRating: Math.round(avgRating * 10) / 10,
      currentStreak,
      totalDuration: workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0),
      favoriteExercise,
    };
  }, [workoutHistory]);

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#22c55e';
    if (rating >= 6) return '#84cc16';
    if (rating >= 4) return '#eab308';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
  };

  const handleWorkoutPress = async (workout, action = 'view') => {
    if (action === 'update') {
      try {
        await updateWorkout(workout);
        console.log('Workout updated successfully:', workout.id);
      } catch (error) {
        console.error('Error updating workout:', error);
        Alert.alert('Update Error', 'There was an issue updating your workout. Please try again.');
      }
    } else {
      // Handle view action if needed
      console.log('Workout viewed:', workout.id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your fitness journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Fitness Journey</Text>
            <Text style={styles.subtitle}>
              {workoutHistory.length > 0 
                ? `${dashboardStats.totalWorkouts} workouts completed`
                : 'Ready to start your first workout?'
              }
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.quickStartButton}
            onPress={() => navigation.navigate('Workout')}
          >
            <Ionicons name="add-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Compact Stats Row */}
        {workoutHistory.length > 0 && (
          <View style={styles.compactStatsContainer}>
            <View style={styles.compactStatCard}>
              <Ionicons name="calendar" size={18} color="#007AFF" />
              <Text style={styles.compactStatNumber}>{dashboardStats.thisWeekCount}</Text>
              <Text style={styles.compactStatLabel}>This Week</Text>
            </View>
            
            <View style={styles.compactStatCard}>
              <Ionicons name="flame" size={18} color="#ff6b35" />
              <Text style={styles.compactStatNumber}>{dashboardStats.currentStreak}</Text>
              <Text style={styles.compactStatLabel}>Streak</Text>
            </View>
            
            <View style={styles.compactStatCard}>
              <Ionicons name="star" size={18} color="#ffd700" />
              <Text style={[styles.compactStatNumber, { color: getRatingColor(dashboardStats.avgRating) }]}>
                {dashboardStats.avgRating || '0.0'}
              </Text>
              <Text style={styles.compactStatLabel}>Avg Rating</Text>
            </View>

            <View style={styles.compactStatCard}>
              <Ionicons name="time" size={18} color="#8b5cf6" />
              <Text style={styles.compactStatNumber}>{Math.round(dashboardStats.totalDuration / 60)}</Text>
              <Text style={styles.compactStatLabel}>Hours</Text>
            </View>
            
            <View style={styles.compactStatCard}>
              <Ionicons name="fitness" size={18} color="#10b981" />
              <Text style={styles.compactStatNumber}>{dashboardStats.thisMonthCount}</Text>
              <Text style={styles.compactStatLabel}>This Month</Text>
            </View>
          </View>
        )}

        {/* Workout Calendar */}
        <WorkoutCalendar 
          workoutHistory={workoutHistory}
          onWorkoutPress={handleWorkoutPress}
          navigation={navigation}
        />

        {/* Motivational Section */}
        {workoutHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Start Your Fitness Journey</Text>
            <Text style={styles.emptySubtitle}>
              Track your workouts, monitor progress, and stay motivated with detailed insights.
            </Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('Workout')}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start First Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.motivationSection}>
            <View style={styles.achievementCard}>
              <Ionicons name="trophy" size={24} color="#ffd700" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Favorite Exercise</Text>
                <Text style={styles.achievementText}>{dashboardStats.favoriteExercise}</Text>
              </View>
            </View>
            
            {dashboardStats.currentStreak >= 3 && (
              <View style={styles.streakCard}>
                <Ionicons name="flame" size={24} color="#ff6b35" />
                <View style={styles.streakContent}>
                  <Text style={styles.streakTitle}>
                    {dashboardStats.currentStreak} Day Streak! 🔥
                  </Text>
                  <Text style={styles.streakText}>
                    You're on fire! Keep up the consistency.
                  </Text>
                </View>
              </View>
            )}

            {dashboardStats.thisWeekCount >= 3 && (
              <View style={styles.weeklyCard}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.weeklyContent}>
                  <Text style={styles.weeklyTitle}>Great Week!</Text>
                  <Text style={styles.weeklyText}>
                    {dashboardStats.thisWeekCount} workouts this week. You're crushing it!
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickStartButton: {
    padding: 8,
  },
  
  // Compact Stats Container
  compactStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  compactStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  compactStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  compactStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Motivation Section
  motivationSection: {
    padding: 16,
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementContent: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementText: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  streakContent: {
    marginLeft: 12,
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  streakText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weeklyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  weeklyContent: {
    marginLeft: 12,
    flex: 1,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  weeklyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default DashboardScreen;