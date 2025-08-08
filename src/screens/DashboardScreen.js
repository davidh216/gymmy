import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context';
import WorkoutCalendar from '../components/WorkoutCalendar';
import { 
  EnhancedGamificationStats,
} from '../components/common';
import MiniWeeklyChart from '../components/MiniWeeklyChart';


const DashboardScreen = ({ navigation }) => {
  const { 
    loading, 
    workoutHistory = [], // Add default empty array
    isDemo, 
    setDemoMode,
  } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Handle month change from calendar
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Use memoized stats from context instead of calculating locally
  const dashboardStats = useMemo(() => {
    const history = Array.isArray(workoutHistory) ? workoutHistory : [];
    if (history.length === 0) {
      return {
        totalWorkouts: 0,
        thisWeekCount: 0,
        selectedMonthCount: 0,
        avgWorkoutsPerWeek: 0,
        avgRating: 0,
        totalDuration: 0,
        selectedMonthDuration: 0,
        favoriteExercise: 'None yet',
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    const thisWeekWorkouts = history.filter(w => new Date(w.startTime || w.workoutDate) >= startOfWeek);
    const selectedMonthWorkouts = history.filter(w => {
      const d = new Date(w.startTime || w.workoutDate);
      return d >= monthStart && d <= monthEnd;
    });

    const totalDuration = history.reduce((sum, w) => sum + (w.duration || 0), 0);
    const selectedMonthDuration = selectedMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    const selectedMonthRatings = selectedMonthWorkouts
      .map(w => w?.ratings?.workoutRating)
      .filter(r => typeof r === 'number');
    const avgRating = selectedMonthRatings.length > 0
      ? selectedMonthRatings.reduce((a, b) => a + b, 0) / selectedMonthRatings.length
      : 0;

    const exerciseCount = {};
    selectedMonthWorkouts.forEach(w => (w.exercises || []).forEach(ex => {
      if (ex?.name) exerciseCount[ex.name] = (exerciseCount[ex.name] || 0) + 1;
    }));
    const favoriteExercise = Object.keys(exerciseCount).length
      ? Object.entries(exerciseCount).sort((a,b) => b[1]-a[1])[0][0]
      : 'None yet';

    const weeksInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime() + 1) / (1000 * 60 * 60 * 24 * 7));
    const avgWorkoutsPerWeek = weeksInMonth > 0 ? selectedMonthWorkouts.length / weeksInMonth : 0;

    return {
      totalWorkouts: history.length,
      thisWeekCount: thisWeekWorkouts.length,
      selectedMonthCount: selectedMonthWorkouts.length,
      avgWorkoutsPerWeek,
      avgRating,
      totalDuration,
      selectedMonthDuration,
      favoriteExercise,
    };
  }, [workoutHistory, selectedMonth]);


  const handleAnalyticsPress = () => {
    // Analytics charts are already shown inline in the dashboard
    // No separate analytics screen needed
    console.log('Analytics charts are displayed inline in the dashboard');
  };

  const handleAchievementsPress = () => {
    navigation.navigate('Achievements');
  };

  const handleGachaPress = () => {
    navigation.navigate('Gacha');
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
          <View style={styles.headerActions}>
            {/* Demo toggle pill */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  await setDemoMode && setDemoMode(!isDemo);
                } catch (e) {
                  console.warn('Failed to toggle demo mode', e);
                }
              }}
              style={[styles.demoToggle, isDemo ? styles.demoToggleOn : styles.demoToggleOff]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDemo ? 'eye' : 'eye-off'}
                size={14}
                color={isDemo ? '#fff' : '#6b7280'}
              />
              <Text style={[styles.demoToggleText, isDemo ? styles.demoToggleTextOn : styles.demoToggleTextOff]}>
                {isDemo ? 'Demo On' : 'Demo Off'}
              </Text>
            </TouchableOpacity>

            {/* Analytics shortcut */}
            <TouchableOpacity 
              style={styles.analyticsButton}
              onPress={handleAnalyticsPress}
            >
              <Ionicons name="analytics-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gamification Stats */}
        <EnhancedGamificationStats navigation={navigation} />

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
          </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyticsButton: {
    padding: 8,
  },
  demoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  demoToggleOn: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  demoToggleOff: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  demoToggleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  demoToggleTextOn: {
    color: '#fff',
  },
  demoToggleTextOff: {
    color: '#6b7280',
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