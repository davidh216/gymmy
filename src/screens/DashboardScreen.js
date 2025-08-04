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
  const { workoutHistory, userStats, loading, updateWorkout, workoutTemplates } = useApp();

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
      avgWorkoutsPerWeek: userStats?.avgWorkoutsPerWeek || 0,
      avgRating: userStats?.avgRating || 0,
      totalDuration: workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0),
      favoriteExercise,
      templatesCount: workoutTemplates.length
    };
  }, [workoutHistory, userStats, workoutTemplates]);

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
              <Ionicons name="trending-up" size={18} color="#ff6b35" />
              <Text style={styles.compactStatNumber}>{dashboardStats.avgWorkoutsPerWeek}</Text>
              <Text style={styles.compactStatLabel}>Avg/Week</Text>
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

        {/* Templates Quick Access */}
        {workoutTemplates.length > 0 && (
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Start Templates</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Workout', { showTemplates: true })}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
              {workoutTemplates.slice(0, 3).map(template => (
                <TouchableOpacity 
                  key={template.id} 
                  style={styles.templateCard}
                  onPress={() => navigation.navigate('Workout', { templateId: template.id })}
                >
                  <View style={styles.templateIcon}>
                    <Ionicons name="document-text" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateExercises}>{template.exercises.length} exercises</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            
            {dashboardStats.avgWorkoutsPerWeek >= 3 && (
              <View style={styles.consistencyCard}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.consistencyContent}>
                  <Text style={styles.consistencyTitle}>Great Consistency!</Text>
                  <Text style={styles.consistencyText}>
                    Averaging {dashboardStats.avgWorkoutsPerWeek} workouts per week
                  </Text>
                </View>
              </View>
            )}

            {dashboardStats.avgRating >= 7 && (
              <View style={styles.qualityCard}>
                <Ionicons name="star-outline" size={24} color="#ffd700" />
                <View style={styles.qualityContent}>
                  <Text style={styles.qualityTitle}>High Quality Workouts</Text>
                  <Text style={styles.qualityText}>
                    Your average rating is {dashboardStats.avgRating}/10
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

  // Templates Section
  templatesSection: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  templatesScroll: {
    paddingHorizontal: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateIcon: {
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateExercises: {
    fontSize: 12,
    color: '#666',
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
  consistencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  consistencyContent: {
    marginLeft: 12,
    flex: 1,
  },
  consistencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  consistencyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
  },
  qualityContent: {
    marginLeft: 12,
    flex: 1,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  qualityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default DashboardScreen;