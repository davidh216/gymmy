// src/components/AdaptiveDashboard.js

import React, { useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // Dimensions
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useUnifiedApp
} from '../context/UnifiedAppProvider';

const { width } = Dimensions.get('window');

export const AdaptiveDashboard = ({ navigation }) => {
  const { state, getCurrentSegment, getSegmentConfig } = useUnifiedApp();
  const { userStats, workoutHistory, personalizedGoals } = state;
  
  // const currentSegment = ...; // Quick fix: commented unused variable
  // const segmentConfig = ...; // Quick fix: commented unused variable
  
  // Memoized segment-specific data
  const dashboardData = useMemo(() => {
    if (!currentSegment || !segmentConfig) {
      return getDefaultDashboardData();
    }
    
    return getSegmentSpecificData(currentSegment, segmentConfig, userStats, workoutHistory);
  }, [currentSegment, segmentConfig, userStats, workoutHistory]);

  // const activeGoals = ...; // Quick fix: commented unused variable

  if (!currentSegment) {
    return <DefaultDashboard navigation={navigation} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personalized Header */}
      <View style={[styles.headerSection, { backgroundColor: segmentConfig.colorScheme }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {dashboardData.greeting}
            </Text>
            <Text style={styles.segmentName}>
              {segmentConfig.name}
            </Text>
            <Text style={styles.motivationalMessage}>
              {dashboardData.motivationalMessage}
            </Text>
          </View>
          
          <View style={styles.gymmyContainer}>
            <View style={styles.gymmyAvatar}>
              <Text style={styles.gymmyEmoji}>{dashboardData.gymmyEmoji}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Primary Metrics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your {segmentConfig.name} Progress</Text>
        <View style={styles.metricsGrid}>
          {dashboardData.primaryMetrics.map((metric, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.metricCard, { borderLeftColor: segmentConfig.colorScheme }]}
              onPress={() => handleMetricPress(metric)}
            >
              <View style={styles.metricHeader}>
                <Ionicons name={metric.icon} size={24} color={segmentConfig.colorScheme} />
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricChange}>{metric.change}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Goals Section */}
      {activeGoals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Current Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={[styles.sectionAction, { color: segmentConfig.colorScheme }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeGoals.slice(0, 3).map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  goal.priority === 'high' && styles.highPriority,
                  goal.priority === 'medium' && styles.mediumPriority,
                  goal.priority === 'low' && styles.lowPriority,
                ]}>
                  <Text style={styles.priorityText}>{goal.priority}</Text>
                </View>
              </View>
              
              <View style={styles.goalProgress}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`,
                        backgroundColor: segmentConfig.colorScheme, 
                      },
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Segment-Specific Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{dashboardData.insightsTitle}</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name={dashboardData.insightIcon} size={28} color={segmentConfig.colorScheme} />
            <Text style={styles.insightTitle}>{dashboardData.insightTitle}</Text>
          </View>
          <Text style={styles.insightDescription}>{dashboardData.insightDescription}</Text>
          
          {dashboardData.actionButton && (
            <TouchableOpacity 
              style={[styles.insightButton, { backgroundColor: segmentConfig.colorScheme }]}
              onPress={() => handleInsightAction(dashboardData.actionButton.action)}
            >
              <Text style={styles.insightButtonText}>{dashboardData.actionButton.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {workoutHistory.length > 0 ? (
          <View style={styles.activityList}>
            {workoutHistory.slice(0, 3).map((workout) => (
              <View key={workout.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="fitness" size={20} color={segmentConfig.colorScheme} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {getWorkoutTitle(workout, currentSegment)}
                  </Text>
                  <Text style={styles.activityDate}>
                    {formatWorkoutDate(workout.workoutDate)}
                  </Text>
                </View>
                <Text style={styles.activityMetric}>
                  {getWorkoutMetric(workout, currentSegment)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color="#dee2e6" />
            <Text style={styles.emptyStateText}>No workouts yet</Text>
            <Text style={styles.emptyStateSubtext}>Start your first workout to see your progress!</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {dashboardData.quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionButton, { borderColor: segmentConfig.colorScheme }]}
              onPress={() => handleQuickAction(action.action)}
            >
              <Ionicons name={action.icon} size={24} color={segmentConfig.colorScheme} />
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // Helper functions
  function handleMetricPress(metric) {
    // Navigate to detailed metric view
    navigation.navigate('MetricDetail', { metric });
  }

  function handleInsightAction(action) {
    switch (action) {
    case 'start_workout':
      navigation.navigate('Workout');
      break;
    case 'view_progress':
      navigation.navigate('Progress');
      break;
    case 'set_goals':
      navigation.navigate('Goals');
      break;
      // Add more actions as needed
    }
  }

  function handleQuickAction(action) {
    switch (action) {
    case 'start_workout':
      navigation.navigate('Workout');
      break;
    case 'log_progress':
      navigation.navigate('Progress');
      break;
    case 'view_achievements':
      navigation.navigate('Achievements');
      break;
    case 'social_feed':
      navigation.navigate('Social');
      break;
      // Add more actions as needed
    }
  }
};

// Segment-specific data generation
const getSegmentSpecificData = (segment, config, userStats, workoutHistory) => {
  const baseData = {
    greeting: getSegmentGreeting(segment),
    gymmyEmoji: getSegmentEmoji(segment),
    motivationalMessage: getMotivationalMessage(segment, userStats),
    primaryMetrics: getPrimaryMetrics(segment, userStats, workoutHistory),
    insightsTitle: `${config.name} Insights`,
    insightIcon: getInsightIcon(segment),
    insightTitle: getInsightTitle(segment, userStats, workoutHistory),
    insightDescription: getInsightDescription(segment, userStats, workoutHistory),
    actionButton: getActionButton(segment),
    quickActions: getQuickActions(segment),
  };

  return baseData;
};

const getSegmentGreeting = (segment) => {
  const greetings = {
    strength_seeker: 'Ready to dominate?',
    calorie_crusher: 'Time to ignite!',
    body_optimizer: 'Transform today!',
    wellness_seeker: 'Find your flow',
    endurance_athlete: 'Chase your limits',
    habit_builder: 'Consistency wins',
    social_enthusiast: 'Let\'s do this together!',
  };
  return greetings[segment] || 'Let\'s get moving!';
};

const getSegmentEmoji = (segment) => {
  const emojis = {
    strength_seeker: '💪',
    calorie_crusher: '🔥',
    body_optimizer: '⚖️',
    wellness_seeker: '🧘',
    endurance_athlete: '🏃',
    habit_builder: '🎯',
    social_enthusiast: '🤝',
  };
  return emojis[segment] || '💪';
};

const getMotivationalMessage = (segment, userStats) => {
  // const level = ...; // Quick fix: commented unused variable
  const messages = {
    strength_seeker: `Level ${level} Powerhouse! Every rep builds your empire.`,
    calorie_crusher: `Level ${level} Energy Machine! Let's burn bright today.`,
    body_optimizer: `Level ${level} Transformer! Your progress is inspiring.`,
    wellness_seeker: `Level ${level} Mindful Mover! Balance grows stronger daily.`,
    endurance_athlete: `Level ${level} Performer! Your potential is limitless.`,
    habit_builder: `Level ${level} Consistency Champion! Small steps, big results.`,
    social_enthusiast: `Level ${level} Community Builder! Together we're unstoppable.`,
  };
  return messages[segment] || `Level ${level} Fitness Enthusiast! Keep growing!`;
};

const getPrimaryMetrics = (segment, userStats, workoutHistory) => {
  // This would calculate actual metrics based on segment
  // For now, return mock data structure
  const baseMetrics = {
    strength_seeker: [
      { icon: 'barbell-outline', label: 'Max Squat', value: '225 lbs', change: '+10 lbs this month' },
      { icon: 'trending-up', label: 'PR Count', value: '12', change: '+3 this week' },
      { icon: 'calendar', label: 'Strength Days', value: '4/week', change: 'Consistent!' },
    ],
    calorie_crusher: [
      { icon: 'flame', label: 'Calories Burned', value: '2,450', change: '+150 vs last week' },
      { icon: 'time', label: 'Active Minutes', value: '285', change: '+45 this week' },
      { icon: 'heart', label: 'Avg Heart Rate', value: '145 bpm', change: 'In target zone' },
    ],
    body_optimizer: [
      { icon: 'body', label: 'Weight Change', value: '-2.3 lbs', change: 'This month' },
      { icon: 'resize', label: 'Waist', value: '-1.2 in', change: 'Great progress!' },
      { icon: 'camera', label: 'Progress Photos', value: '8', change: 'Keep documenting!' },
    ],
    // Add more segments...
  };

  return baseMetrics[segment] || baseMetrics.strength_seeker;
};

const getInsightIcon = (segment) => {
  const icons = {
    strength_seeker: 'analytics',
    calorie_crusher: 'flash',
    body_optimizer: 'trending-up',
    wellness_seeker: 'leaf',
    endurance_athlete: 'speedometer',
    habit_builder: 'checkmark-circle',
    social_enthusiast: 'people',
  };
  return icons[segment] || 'analytics';
};

const getInsightTitle = (segment, userStats, workoutHistory) => {
  const titles = {
    strength_seeker: 'Progressive Overload Opportunity',
    calorie_crusher: 'Metabolic Momentum Building',
    body_optimizer: 'Transformation Accelerating',
    wellness_seeker: 'Mind-Body Connection Strengthening',
    endurance_athlete: 'Performance Peak Approaching',
    habit_builder: 'Consistency Streak Active',
    social_enthusiast: 'Community Engagement Growing',
  };
  return titles[segment] || 'Progress Insight';
};

const getInsightDescription = (segment, userStats, workoutHistory) => {
  const descriptions = {
    strength_seeker: 'Your squat has improved 8% this month. Consider increasing weight by 5-10 lbs next session.',
    calorie_crusher: 'Your calorie burn rate is up 15% from last month. Your metabolism is responding well!',
    body_optimizer: 'Consistent training is showing results. Your body composition is improving steadily.',
    wellness_seeker: 'Your flexibility scores have improved. Consider adding 5 more minutes to your stretching routine.',
    endurance_athlete: 'Your pace has improved by 12 seconds per mile. You\'re ready for longer distances.',
    habit_builder: 'You\'ve maintained a 6-day streak! Consistency is your superpower.',
    social_enthusiast: 'You\'ve encouraged 5 friends this week. Your community impact is inspiring!',
  };
  return descriptions[segment] || 'Keep up the great work!';
};

const getActionButton = (segment) => {
  const buttons = {
    strength_seeker: { text: 'Plan Next PR Attempt', action: 'start_workout' },
    calorie_crusher: { text: 'Start HIIT Session', action: 'start_workout' },
    body_optimizer: { text: 'Log Progress Photo', action: 'log_progress' },
    wellness_seeker: { text: 'Begin Meditation', action: 'start_workout' },
    endurance_athlete: { text: 'Start Training Run', action: 'start_workout' },
    habit_builder: { text: 'Continue Streak', action: 'start_workout' },
    social_enthusiast: { text: 'Find Workout Buddy', action: 'social_feed' },
  };
  return buttons[segment] || buttons.strength_seeker;
};

const getQuickActions = (segment) => {
  const baseActions = [
    { icon: 'add-circle', text: 'Start Workout', action: 'start_workout' },
    { icon: 'analytics', text: 'View Progress', action: 'view_progress' },
    { icon: 'trophy', text: 'Achievements', action: 'view_achievements' },
  ];

  const segmentSpecific = {
    social_enthusiast: [
      ...baseActions,
      { icon: 'people', text: 'Social Feed', action: 'social_feed' },
    ],
    body_optimizer: [
      ...baseActions,
      { icon: 'camera', text: 'Progress Photo', action: 'log_progress' },
    ],
    // Add more segment-specific actions
  };

  return segmentSpecific[segment] || baseActions;
};

// Default dashboard for users without segmentation
const DefaultDashboard = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Welcome to Gymmy!</Text>
      <Text style={styles.defaultText}>
        Take our quick survey to personalize your experience.
      </Text>
      <TouchableOpacity 
        style={styles.surveyButton}
        onPress={() => navigation.navigate('Survey')}
      >
        <Text style={styles.surveyButtonText}>Personalize My Experience</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const getDefaultDashboardData = () => ({
  greeting: 'Welcome to Gymmy!',
  motivationalMessage: 'Let\'s get to know you better',
  primaryMetrics: [],
  quickActions: [],
});

// Utility functions
const getWorkoutTitle = (workout, segment) => {
  // Generate segment-appropriate workout titles
  if (segment === 'strength_seeker') {
    return `Strength Training - ${workout.exercises?.length || 0} exercises`;
  }
  return `Workout - ${workout.exercises?.length || 0} exercises`;
};

const formatWorkoutDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
  });
};

const getWorkoutMetric = (workout, segment) => {
  // Return segment-relevant metric
  // const duration = ...; // Quick fix: commented unused variable
  return `${duration} min`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerSection: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  segmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  gymmyContainer: {
    marginLeft: 16,
  },
  gymmyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymmyEmoji: {
    fontSize: 24,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highPriority: {
    backgroundColor: '#dc3545',
  },
  mediumPriority: {
    backgroundColor: '#ffc107',
  },
  lowPriority: {
    backgroundColor: '#28a745',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  goalProgress: {
    gap: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#dee2e6',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 12,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  insightButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activityMetric: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f8f9fa',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    textAlign: 'center',
  },
  defaultText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  surveyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  surveyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});