import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const AchievementsScreen = ({ navigation }) => {
  const { workoutHistory } = useApp();

  // Reuse the same achievements logic from DashboardScreen
  const achievements = useMemo(() => {
    const totalWorkouts = workoutHistory.length;
    const totalDuration = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalHours = totalDuration / 60;
    const avgRating = workoutHistory.length > 0 
      ? workoutHistory.reduce((sum, w) => sum + (w.ratings?.workoutRating || 0), 0) / workoutHistory.length
      : 0;
    
    // Calculate streak data
    const sortedWorkouts = [...workoutHistory].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastWorkoutDate = null;
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].startTime);
      const workoutDay = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
      
      if (lastWorkoutDate === null) {
        lastWorkoutDate = workoutDay;
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((lastWorkoutDate - workoutDay) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
          currentStreak = tempStreak;
        } else if (daysDiff === 0) {
          // Same day workout, don't break streak
        } else {
          tempStreak = 1;
        }
        lastWorkoutDate = workoutDay;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate weekly consistency
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    const recentWorkouts = workoutHistory.filter(w => new Date(w.startTime) >= fourWeeksAgo);
    const weeklyConsistency = recentWorkouts.length / 4;

    // Define all achievements
    const allAchievements = [
      // Workout Count Achievements
      {
        id: 'first_workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: 'fitness-outline',
        color: '#10b981',
        condition: totalWorkouts >= 1,
        progress: Math.min(totalWorkouts, 1),
        maxProgress: 1,
        category: 'milestone'
      },
      {
        id: 'workout_5',
        title: 'Getting Started',
        description: 'Complete 5 workouts',
        icon: 'fitness',
        color: '#10b981',
        condition: totalWorkouts >= 5,
        progress: Math.min(totalWorkouts, 5),
        maxProgress: 5,
        category: 'milestone'
      },
      {
        id: 'workout_25',
        title: 'Dedicated Athlete',
        description: 'Complete 25 workouts',
        icon: 'trophy-outline',
        color: '#f59e0b',
        condition: totalWorkouts >= 25,
        progress: Math.min(totalWorkouts, 25),
        maxProgress: 25,
        category: 'milestone'
      },
      {
        id: 'workout_50',
        title: 'Fitness Enthusiast',
        description: 'Complete 50 workouts',
        icon: 'trophy',
        color: '#f59e0b',
        condition: totalWorkouts >= 50,
        progress: Math.min(totalWorkouts, 50),
        maxProgress: 50,
        category: 'milestone'
      },
      {
        id: 'workout_100',
        title: 'Century Club',
        description: 'Complete 100 workouts',
        icon: 'diamond-outline',
        color: '#8b5cf6',
        condition: totalWorkouts >= 100,
        progress: Math.min(totalWorkouts, 100),
        maxProgress: 100,
        category: 'milestone'
      },
      {
        id: 'workout_500',
        title: 'Legendary',
        description: 'Complete 500 workouts',
        icon: 'diamond',
        color: '#8b5cf6',
        condition: totalWorkouts >= 500,
        progress: Math.min(totalWorkouts, 500),
        maxProgress: 500,
        category: 'milestone'
      },

      // Duration Achievements
      {
        id: 'hours_10',
        title: 'Time Warrior',
        description: 'Log 10 hours of workouts',
        icon: 'time-outline',
        color: '#8b5cf6',
        condition: totalHours >= 10,
        progress: Math.min(totalHours, 10),
        maxProgress: 10,
        category: 'duration'
      },
      {
        id: 'hours_50',
        title: 'Endurance Master',
        description: 'Log 50 hours of workouts',
        icon: 'time',
        color: '#8b5cf6',
        condition: totalHours >= 50,
        progress: Math.min(totalHours, 50),
        maxProgress: 50,
        category: 'duration'
      },
      {
        id: 'hours_100',
        title: 'Time Legend',
        description: 'Log 100 hours of workouts',
        icon: 'infinite-outline',
        color: '#8b5cf6',
        condition: totalHours >= 100,
        progress: Math.min(totalHours, 100),
        maxProgress: 100,
        category: 'duration'
      },

      // Streak Achievements
      {
        id: 'streak_3',
        title: 'Consistency Starter',
        description: 'Maintain a 3-day workout streak',
        icon: 'flame-outline',
        color: '#f97316',
        condition: longestStreak >= 3,
        progress: Math.min(longestStreak, 3),
        maxProgress: 3,
        category: 'streak'
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        icon: 'flame',
        color: '#f97316',
        condition: longestStreak >= 7,
        progress: Math.min(longestStreak, 7),
        maxProgress: 7,
        category: 'streak'
      },
      {
        id: 'streak_30',
        title: 'Month Master',
        description: 'Maintain a 30-day workout streak',
        icon: 'fire',
        color: '#ef4444',
        condition: longestStreak >= 30,
        progress: Math.min(longestStreak, 30),
        maxProgress: 30,
        category: 'streak'
      },

      // Rating Achievements
      {
        id: 'rating_8',
        title: 'Quality Focus',
        description: 'Maintain an average rating of 8+',
        icon: 'star-outline',
        color: '#ffd700',
        condition: avgRating >= 8,
        progress: Math.min(avgRating, 8),
        maxProgress: 8,
        category: 'quality'
      },
      {
        id: 'rating_9',
        title: 'Perfectionist',
        description: 'Maintain an average rating of 9+',
        icon: 'star',
        color: '#ffd700',
        condition: avgRating >= 9,
        progress: Math.min(avgRating, 9),
        maxProgress: 9,
        category: 'quality'
      },

      // Consistency Achievements
      {
        id: 'weekly_3',
        title: 'Regular Routine',
        description: 'Average 3+ workouts per week',
        icon: 'calendar-outline',
        color: '#22c55e',
        condition: weeklyConsistency >= 3,
        progress: Math.min(weeklyConsistency, 3),
        maxProgress: 3,
        category: 'consistency'
      },
      {
        id: 'weekly_5',
        title: 'Fitness Fanatic',
        description: 'Average 5+ workouts per week',
        icon: 'calendar',
        color: '#22c55e',
        condition: weeklyConsistency >= 5,
        progress: Math.min(weeklyConsistency, 5),
        maxProgress: 5,
        category: 'consistency'
      },

      // Special Achievements
      {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Complete 7 workouts in 7 days',
        icon: 'checkmark-circle',
        color: '#22c55e',
        condition: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        maxProgress: 7,
        category: 'special'
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete 5 workouts before 8 AM',
        icon: 'sunny-outline',
        color: '#f59e0b',
        condition: workoutHistory.filter(w => {
          const workoutHour = new Date(w.startTime).getHours();
          return workoutHour < 8;
        }).length >= 5,
        progress: Math.min(workoutHistory.filter(w => {
          const workoutHour = new Date(w.startTime).getHours();
          return workoutHour < 8;
        }).length, 5),
        maxProgress: 5,
        category: 'special'
      },
      {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete 5 workouts after 10 PM',
        icon: 'moon-outline',
        color: '#8b5cf6',
        condition: workoutHistory.filter(w => {
          const workoutHour = new Date(w.startTime).getHours();
          return workoutHour >= 22;
        }).length >= 5,
        progress: Math.min(workoutHistory.filter(w => {
          const workoutHour = new Date(w.startTime).getHours();
          return workoutHour >= 22;
        }).length, 5),
        maxProgress: 5,
        category: 'special'
      }
    ];

    const unlockedAchievements = allAchievements.filter(achievement => achievement.condition);
    const lockedAchievements = allAchievements.filter(achievement => !achievement.condition);
    
    // Calculate total progress
    const totalProgress = unlockedAchievements.length;
    const totalAchievements = allAchievements.length;
    const completionPercentage = totalAchievements > 0 ? (totalProgress / totalAchievements) * 100 : 0;

    return {
      allAchievements,
      unlockedAchievements,
      lockedAchievements,
      totalProgress,
      totalAchievements,
      completionPercentage,
      currentStreak,
      longestStreak,
      weeklyConsistency
    };
  }, [workoutHistory]);

  const categoryTitles = {
    milestone: 'Milestones',
    duration: 'Duration',
    streak: 'Streaks',
    quality: 'Quality',
    consistency: 'Consistency',
    special: 'Special'
  };

  const categoryColors = {
    milestone: '#10b981',
    duration: '#8b5cf6',
    streak: '#f97316',
    quality: '#ffd700',
    consistency: '#22c55e',
    special: '#f59e0b'
  };

  const renderAchievementCard = (achievement) => (
    <View key={achievement.id} style={[
      styles.achievementCard,
      achievement.condition && styles.unlockedCard
    ]}>
      <View style={[
        styles.achievementIcon,
        { backgroundColor: achievement.condition ? achievement.color + '20' : '#f3f4f6' }
      ]}>
        <Ionicons 
          name={achievement.icon} 
          size={24} 
          color={achievement.condition ? achievement.color : '#9ca3af'} 
        />
      </View>
      <Text style={[
        styles.achievementTitle,
        achievement.condition && styles.unlockedTitle
      ]}>
        {achievement.title}
      </Text>
      <Text style={styles.achievementDescription}>
        {achievement.description}
      </Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                backgroundColor: achievement.condition ? achievement.color : '#007AFF'
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.category === 'milestone' || achievement.category === 'streak' 
            ? Math.round(achievement.progress) 
            : achievement.progress.toFixed(1)}/{achievement.maxProgress}
        </Text>
      </View>
      {achievement.condition && (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={achievement.color} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Overall Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressStats}>
              {achievements.totalProgress}/{achievements.totalAchievements}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${achievements.completionPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>
            {achievements.completionPercentage.toFixed(1)}% Complete
          </Text>
        </View>

        {/* Streak Info */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>Your Streaks</Text>
          <View style={styles.streakCards}>
            <View style={styles.streakCard}>
              <Ionicons name="flame" size={24} color="#f97316" />
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakNumber}>{Math.round(achievements.currentStreak)} days</Text>
            </View>
            <View style={styles.streakCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.streakLabel}>Longest Streak</Text>
              <Text style={styles.streakNumber}>{Math.round(achievements.longestStreak)} days</Text>
            </View>
          </View>
        </View>

        {/* Achievement Categories */}
        {Object.keys(categoryTitles).map(category => {
          const categoryAchievements = achievements.allAchievements.filter(
            achievement => achievement.category === category
          );
          
          if (categoryAchievements.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColors[category] + '20' }]}>
                  <Ionicons name="trophy" size={16} color={categoryColors[category]} />
                </View>
                <Text style={styles.categoryTitle}>{categoryTitles[category]}</Text>
                <Text style={styles.categoryProgress}>
                  {categoryAchievements.filter(a => a.condition).length}/{categoryAchievements.length}
                </Text>
              </View>
              <View style={styles.achievementsGrid}>
                {categoryAchievements.map(renderAchievementCard)}
              </View>
            </View>
          );
        })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressStats: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  streakSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  streakCards: {
    flexDirection: 'row',
    gap: 12,
  },
  streakCard: {
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
  streakLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categorySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  categoryProgress: {
    fontSize: 14,
    color: '#666',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unlockedCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#333',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default AchievementsScreen; 