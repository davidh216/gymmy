import React, { useMemo, useState, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import WorkoutCalendar from '../components/WorkoutCalendar';
import AnalyticsPreview from '../components/AnalyticsPreview';
import MiniWeeklyChart from '../components/MiniWeeklyChart';
import GamificationStats from '../components/GamificationStats';
import ClassDashboardWidget from '../components/ClassDashboardWidget';
import EnhancedGamificationStats from '../components/EnhancedGamificationStats';
import { DESIGN_TOKENS } from '../constants/designTokens';

// Lazy load the heavy AnalyticsCharts component
const AnalyticsCharts = React.lazy(() => import('../components/AnalyticsCharts'));

// Loading component for lazy-loaded charts
const ChartsLoadingFallback = () => (
  <View style={styles.chartsLoadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.chartsLoadingText}>Loading analytics...</Text>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const { 
    workoutStats, 
    monthlyStats, 
    recentWorkouts = [], // Add default empty array
    userStats, 
    loading, 
    updateWorkout, 
    workoutTemplates = [], // Add default empty array
    bodyWeights = [], // Add default empty array
    workoutHistory = [], // Add default empty array
    isDemo, 
  } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Handle month change from calendar
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Use memoized stats from context instead of calculating locally
  const dashboardStats = useMemo(() => {
    // Add safety checks for all data
    if (!recentWorkouts || !Array.isArray(recentWorkouts)) {
      return {
        totalWorkouts: 0,
        thisWeekCount: 0,
        selectedMonthCount: 0,
        avgWorkoutsPerWeek: 0,
        avgRating: 0,
        totalDuration: 0,
        selectedMonthDuration: 0,
        favoriteExercise: 'None yet',
        templatesCount: 0,
      };
    }

    const now = new Date();
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Use selected month instead of current month
    const selectedMonthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const selectedMonthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // This week's workouts (still need to calculate this locally since it's time-dependent)
    const thisWeekWorkouts = recentWorkouts.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= thisWeek;
    });

    // Selected month's workouts (still need to calculate this locally since it's month-dependent)
    const selectedMonthWorkouts = recentWorkouts.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= selectedMonthStart && workoutDate <= selectedMonthEnd;
    });

    // Most frequent exercise in selected month
    const exerciseCount = {};
    selectedMonthWorkouts.forEach(workout => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach(exercise => {
          if (exercise.name) {
            exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
          }
        });
      }
    });
    
    const favoriteExercise = Object.keys(exerciseCount).length > 0 
      ? Object.keys(exerciseCount).reduce((a, b) => exerciseCount[a] > exerciseCount[b] ? a : b)
      : 'None yet';

    // Calculate total duration for selected month
    const selectedMonthDuration = selectedMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Calculate average rating for selected month
    const selectedMonthRatings = selectedMonthWorkouts
      .filter(w => w.ratings?.workoutRating)
      .map(w => w.ratings.workoutRating);
    
    const selectedMonthAvgRating = selectedMonthRatings.length > 0 
      ? selectedMonthRatings.reduce((sum, rating) => sum + rating, 0) / selectedMonthRatings.length
      : 0;

    // Calculate average workouts per week for the selected month
    const weeksInSelectedMonth = Math.ceil((selectedMonthEnd - selectedMonthStart) / (1000 * 60 * 60 * 24 * 7));
    const avgWorkoutsPerWeek = weeksInSelectedMonth > 0 ? selectedMonthWorkouts.length / weeksInSelectedMonth : 0;

    return {
      totalWorkouts: workoutStats?.totalWorkouts || 0,
      thisWeekCount: thisWeekWorkouts.length,
      selectedMonthCount: selectedMonthWorkouts.length,
      avgWorkoutsPerWeek: avgWorkoutsPerWeek,
      avgRating: selectedMonthAvgRating,
      totalDuration: workoutStats?.totalDuration || 0,
      selectedMonthDuration: selectedMonthDuration,
      favoriteExercise,
      templatesCount: Array.isArray(workoutTemplates) ? workoutTemplates.length : 0,
    };
  }, [workoutStats, monthlyStats, recentWorkouts, workoutTemplates, selectedMonth]);

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#22c55e';
    if (rating >= 6) return '#84cc16';
    if (rating >= 4) return '#eab308';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
  };

  const handleWorkoutPress = async (workout, action = 'view') => {
    if (action === 'edit') {
      // Navigate to workout screen with edit mode
      navigation.navigate('Workout', { 
        workoutId: workout.id,
        mode: 'edit',
      });
    } else if (action === 'delete') {
      Alert.alert(
        'Delete Workout',
        'Are you sure you want to delete this workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await updateWorkout({ ...workout, _delete: true });
              } catch (error) {
                Alert.alert('Error', 'Failed to delete workout');
              }
            },
          },
        ],
      );
    }
  };

  const handleAnalyticsPress = () => {
    // Analytics charts are already shown inline in the dashboard
    // No separate analytics screen needed
    console.log('Analytics charts are displayed inline in the dashboard');
  };

  const handleAchievementsPress = () => {
    navigation.navigate('Achievements');
  };

  const handleClassSelectionPress = () => {
    navigation.navigate('ClassSelection');
  };

  const handleGachaPress = () => {
    navigation.navigate('GachaScreen');
  };

  const handleCharacterCollectionPress = () => {
    navigation.navigate('CharacterCollection');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={handleAnalyticsPress}
          >
            <Ionicons name="analytics-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Class Dashboard Widget */}
        <ClassDashboardWidget />

        {/* Gamification Stats */}
        <EnhancedGamificationStats />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardStats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardStats.thisWeekCount}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round(dashboardStats.avgRating * 10) / 10}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round(dashboardStats.totalDuration / 60)}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>

        {/* Mini Weekly Chart - Pass workoutHistory as prop */}
        <MiniWeeklyChart workoutHistory={workoutHistory} />

        {/* Workout Calendar - Pass workoutHistory as prop */}
        <WorkoutCalendar 
          workoutHistory={workoutHistory}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          navigation={navigation}
        />

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Workout')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recentWorkoutsContainer}
          >
            {recentWorkouts && recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => handleWorkoutPress(workout)}
                  onLongPress={() => {
                    Alert.alert(
                      'Workout Options',
                      'What would you like to do?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'View', onPress: () => handleWorkoutPress(workout) },
                        { text: 'Edit', onPress: () => handleWorkoutPress(workout, 'edit') },
                        { text: 'Delete', style: 'destructive', onPress: () => handleWorkoutPress(workout, 'delete') },
                      ],
                    );
                  }}
                >
                  <View style={styles.workoutCardHeader}>
                    <Text style={styles.workoutDate}>
                      {new Date(workout.startTime).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                      })}
                    </Text>
                    <Text style={styles.workoutTime}>
                      {new Date(workout.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                      })}
                    </Text>
                  </View>
                  
                  <Text style={styles.workoutDuration}>
                    {Math.round(workout.duration || 0)} min
                  </Text>
                  
                  <Text style={styles.workoutExercises}>
                    {workout.exercises?.length || 0} exercises
                  </Text>
                  
                  {workout.ratings?.workoutRating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons 
                        name="star" 
                        size={12} 
                        color={getRatingColor(workout.ratings.workoutRating)} 
                      />
                      <Text style={[
                        styles.ratingText,
                        { color: getRatingColor(workout.ratings.workoutRating) },
                      ]}>
                        {workout.ratings.workoutRating}/10
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyWorkoutsContainer}>
                <Ionicons name="fitness-outline" size={48} color="#ccc" />
                <Text style={styles.emptyWorkoutsText}>No workouts yet</Text>
                <Text style={styles.emptyWorkoutsSubtext}>Start your fitness journey today!</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleAchievementsPress}
            >
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>Achievements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleGachaPress}
            >
              <Ionicons name="gift" size={24} color="#8b5cf6" />
              <Text style={styles.actionText}>Gacha</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleCharacterCollectionPress}
            >
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.actionText}>Characters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleClassSelectionPress}
            >
              <Ionicons name="shield" size={24} color="#ef4444" />
              <Text style={styles.actionText}>Classes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lazy-loaded Analytics Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Preview</Text>
          <Suspense fallback={<ChartsLoadingFallback />}>
            <AnalyticsCharts 
              workoutHistory={workoutHistory}
              exerciseHistory={{}}
              userStats={userStats}
              bodyWeights={bodyWeights}
            />
          </Suspense>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  analyticsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  recentWorkoutsContainer: {
    marginBottom: 8,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutCardHeader: {
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  workoutTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  workoutExercises: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWorkoutsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: 200,
  },
  emptyWorkoutsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyWorkoutsSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 8,
  },
  chartsLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  chartsLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default DashboardScreen;