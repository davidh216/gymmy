import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import WorkoutCalendar from '../components/WorkoutCalendar';
import AnalyticsPreview from '../components/AnalyticsPreview';
import MiniWeeklyChart from '../components/MiniWeeklyChart';
import GamificationStats from '../components/GamificationStats';
import ClassDashboardWidget from '../components/ClassDashboardWidget';
import EnhancedGamificationStats from '../components/EnhancedGamificationStats';

const DashboardScreen = ({ navigation }) => {
  const { workoutHistory, userStats, loading, updateWorkout, workoutTemplates, bodyWeights, isDemo } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Handle month change from calendar
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

      // Calculate dashboard stats based on selected month
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Use selected month instead of current month
    const selectedMonthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const selectedMonthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // This week's workouts
    const thisWeekWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= thisWeek;
    });

    // Selected month's workouts
    const selectedMonthWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= selectedMonthStart && workoutDate <= selectedMonthEnd;
    });

    // Most frequent exercise in selected month
    const exerciseCount = {};
    selectedMonthWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
      });
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
      totalWorkouts: workoutHistory.length,
      thisWeekCount: thisWeekWorkouts.length,
      selectedMonthCount: selectedMonthWorkouts.length,
      avgWorkoutsPerWeek: avgWorkoutsPerWeek,
      avgRating: selectedMonthAvgRating,
      totalDuration: workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0),
      selectedMonthDuration: selectedMonthDuration,
      favoriteExercise,
      templatesCount: workoutTemplates.length
    };
  }, [workoutHistory, userStats, workoutTemplates, selectedMonth]);

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#22c55e';
    if (rating >= 6) return '#84cc16';
    if (rating >= 4) return '#eab308';
    if (rating >= 2) return '#f97316';
    return '#ef4444';
  };

  // Achievements System
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
    const weeklyConsistency = recentWorkouts.length / 4; // workouts per week average

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
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Gymmy</Text>
            <Text style={styles.subtitle}>
              {workoutHistory.length > 0 
                ? 'Ready for your next workout?'
                : 'Ready to start your first workout?'
              }
            </Text>
            {isDemo && (
              <View style={styles.demoIndicator}>
                <Ionicons name="eye" size={14} color="#ff6b35" />
                <Text style={styles.demoIndicatorText}>Demo Mode</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.quickStartButton}
            onPress={() => setShowTemplateMenu(true)}
          >
            <Ionicons name="add-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Class Dashboard Widget */}
        <ClassDashboardWidget navigation={navigation} />

        {/* Enhanced Level Progress Section */}
        {workoutHistory.length > 0 && (
          <EnhancedGamificationStats navigation={navigation} />
        )}

        {/* Workout Calendar */}
        <WorkoutCalendar 
          workoutHistory={workoutHistory}
          onWorkoutPress={handleWorkoutPress}
          navigation={navigation}
          onMonthChange={handleMonthChange}
          selectedMonth={selectedMonth}
        />

        {/* Compact Stats Row */}
        {workoutHistory.length > 0 && (
          <View style={styles.kpiSection}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Key Metrics</Text>
              <TouchableOpacity
                style={styles.viewAllAnalyticsButton}
                onPress={() => navigation.navigate('Progress', { initialTab: 'analytics' })}
              >
                <Text style={styles.viewAllAnalyticsText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.compactStatsContainer}>
              <View style={styles.compactStatCard}>
                <Ionicons name="trending-up" size={18} color="#ff6b35" />
                <Text style={styles.compactStatNumber}>{dashboardStats.avgWorkoutsPerWeek.toFixed(2)}</Text>
                <Text style={styles.compactStatLabel}>Avg/Week</Text>
              </View>
              
              <View style={styles.compactStatCard}>
                <Ionicons name="star" size={18} color="#ffd700" />
                <Text style={[styles.compactStatNumber, { color: getRatingColor(dashboardStats.avgRating) }]}>
                  {dashboardStats.avgRating.toFixed(2)}
                </Text>
                <Text style={styles.compactStatLabel}>Avg Rating</Text>
              </View>

              <View style={styles.compactStatCard}>
                <Ionicons name="time" size={18} color="#8b5cf6" />
                <Text style={styles.compactStatNumber}>{(dashboardStats.selectedMonthDuration / 60).toFixed(2)}</Text>
                <Text style={styles.compactStatLabel}>Hours</Text>
              </View>
              
              <View style={styles.compactStatCard}>
                <Ionicons name="fitness" size={18} color="#10b981" />
                <Text style={styles.compactStatNumber}>{Math.round(dashboardStats.selectedMonthCount)}</Text>
                <Text style={styles.compactStatLabel}>Monthly Total</Text>
              </View>

              <View style={styles.compactStatCard}>
                <Ionicons name="trophy" size={18} color="#22c55e" />
                <Text style={styles.compactStatNumber}>{Math.round(dashboardStats.totalWorkouts)}</Text>
                <Text style={styles.compactStatLabel}>All Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Motivational Section */}
        {workoutHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Start Your Workout</Text>
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

        {/* Template Menu Modal */}
        <Modal
          visible={showTemplateMenu}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTemplateMenu(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Workout</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTemplateMenu(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* New Workout Option */}
              <TouchableOpacity 
                style={styles.templateMenuOption}
                onPress={() => {
                  setShowTemplateMenu(false);
                  navigation.navigate('Workout');
                }}
              >
                <View style={styles.templateMenuIcon}>
                  <Ionicons name="add-circle" size={32} color="#007AFF" />
                </View>
                <View style={styles.templateMenuContent}>
                  <Text style={styles.templateMenuTitle}>New Workout</Text>
                  <Text style={styles.templateMenuSubtitle}>Start a fresh workout from scratch</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              {/* Template Options */}
              {workoutTemplates.length > 0 && (
                <>
                  <View style={styles.menuDivider}>
                    <Text style={styles.menuDividerText}>Templates</Text>
                  </View>
                  
                  {workoutTemplates.map(template => (
                    <TouchableOpacity 
                      key={template.id}
                      style={styles.templateMenuOption}
                      onPress={() => {
                        setShowTemplateMenu(false);
                        navigation.navigate('Workout', { templateId: template.id });
                      }}
                    >
                      <View style={styles.templateMenuIcon}>
                        <Ionicons name="document-text" size={32} color="#34c759" />
                      </View>
                      <View style={styles.templateMenuContent}>
                        <Text style={styles.templateMenuTitle}>{template.name}</Text>
                        <Text style={styles.templateMenuSubtitle}>
                          {template.exercises.length} exercises • {template.estimatedDuration || 45} min
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Achievements Section */}
        {workoutHistory.length > 0 && (
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.achievementStats}>
                <Text style={styles.achievementProgress}>
                  {achievements.totalProgress}/{achievements.totalAchievements}
                </Text>
                <Text style={styles.achievementPercentage}>
                  {achievements.completionPercentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${achievements.completionPercentage}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Recent Achievements */}
            {achievements.unlockedAchievements.length > 0 && (
              <View style={styles.recentAchievements}>
                <Text style={styles.subsectionTitle}>Recent Unlocks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {achievements.unlockedAchievements.slice(0, 5).map(achievement => (
                    <View key={achievement.id} style={styles.achievementCard}>
                      <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                        <Ionicons name={achievement.icon} size={24} color={achievement.color} />
                      </View>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Next Achievements */}
            {achievements.lockedAchievements.length > 0 && (
              <View style={styles.nextAchievements}>
                <Text style={styles.subsectionTitle}>Next Goals</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {achievements.lockedAchievements.slice(0, 3).map(achievement => (
                    <View key={achievement.id} style={styles.achievementCard}>
                      <View style={[styles.achievementIcon, { backgroundColor: '#f3f4f6' }]}>
                        <Ionicons name={achievement.icon} size={24} color="#9ca3af" />
                      </View>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                      <View style={styles.progressContainer}>
                        <View style={styles.miniProgressBar}>
                          <View 
                            style={[
                              styles.miniProgressFill, 
                              { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
                            ]} 
                          />
                        </View>
                                                 <Text style={styles.progressText}>
                           {Math.round(achievement.progress)}/{achievement.maxProgress}
                         </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* View All Achievements Button */}
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.viewAllText}>View All Achievements</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
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
  headerContent: {
    flex: 1,
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
  demoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  demoIndicatorText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
  },
  quickStartButton: {
    padding: 8,
  },
  
  // KPI Section
  kpiSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllAnalyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllAnalyticsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Compact Stats Container
  compactStatsContainer: {
    flexDirection: 'row',
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

  // Month Indicator
  monthIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthIndicatorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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

  // Motivational Section
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

   // Achievements Section
   achievementsSection: {
     marginVertical: 16,
     paddingHorizontal: 16,
   },
   achievementStats: {
     alignItems: 'flex-end',
   },
   achievementProgress: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#007AFF',
   },
   achievementPercentage: {
     fontSize: 12,
     color: '#666',
     marginTop: 2,
   },
   progressContainer: {
     marginVertical: 8,
   },
   progressBar: {
     height: 8,
     backgroundColor: '#f3f4f6',
     borderRadius: 4,
     overflow: 'hidden',
   },
   progressFill: {
     height: '100%',
     backgroundColor: '#007AFF',
     borderRadius: 4,
   },
   streakContainer: {
     flexDirection: 'row',
     gap: 12,
     marginVertical: 16,
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
   recentAchievements: {
     marginVertical: 16,
   },
   nextAchievements: {
     marginVertical: 16,
   },
   subsectionTitle: {
     fontSize: 16,
     fontWeight: '600',
     color: '#333',
     marginBottom: 12,
   },
   achievementCard: {
     backgroundColor: '#fff',
     padding: 16,
     borderRadius: 12,
     marginHorizontal: 4,
     width: 160,
     alignItems: 'center',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
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
     color: '#333',
     textAlign: 'center',
     marginBottom: 4,
   },
   achievementDescription: {
     fontSize: 11,
     color: '#666',
     textAlign: 'center',
     lineHeight: 14,
   },
   miniProgressBar: {
     height: 4,
     backgroundColor: '#f3f4f6',
     borderRadius: 2,
     overflow: 'hidden',
     marginTop: 8,
     marginBottom: 4,
   },
   miniProgressFill: {
     height: '100%',
     backgroundColor: '#007AFF',
     borderRadius: 2,
   },
   progressText: {
     fontSize: 10,
     color: '#666',
     textAlign: 'center',
   },
   viewAllButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#fff',
     padding: 16,
     borderRadius: 12,
     marginTop: 16,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   viewAllText: {
     fontSize: 16,
     fontWeight: '600',
     color: '#007AFF',
     marginRight: 8,
   },

   // Modal Styles
   modalContainer: {
     flex: 1,
     backgroundColor: '#f8f9fa',
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 20,
     backgroundColor: '#fff',
     borderBottomWidth: 1,
     borderBottomColor: '#e9ecef',
   },
   modalTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#333',
   },
   closeButton: {
     padding: 4,
   },
   modalContent: {
     flex: 1,
     padding: 16,
   },
   templateMenuOption: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#fff',
     padding: 16,
     borderRadius: 12,
     marginBottom: 12,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
     elevation: 1,
   },
   templateMenuIcon: {
     marginRight: 16,
   },
   templateMenuContent: {
     flex: 1,
   },
   templateMenuTitle: {
     fontSize: 16,
     fontWeight: '600',
     color: '#333',
     marginBottom: 2,
   },
   templateMenuSubtitle: {
     fontSize: 14,
     color: '#666',
   },
   menuDivider: {
     paddingVertical: 16,
     alignItems: 'center',
   },
   menuDividerText: {
     fontSize: 14,
     fontWeight: '500',
     color: '#999',
     textTransform: 'uppercase',
     letterSpacing: 1,
   },
 });

export default DashboardScreen;