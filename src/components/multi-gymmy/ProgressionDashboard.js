// src/components/multi-gymmy/ProgressionDashboard.js
// Character progression dashboard with growth tracking and analytics

import React, { useState, useMemo, useEffect } from 'react';
import {
  // View,
  // Text,
  // ScrollView,
  // TouchableOpacity,
  // StyleSheet,
  // Dimensions,
  // Modal,
  // Alert,
  // Animated,
  // Platform,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // LineChart,
  // BarChart,
  // PieChart
} from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

// Mock progression data - this would come from ProgressionTracker
const mockProgressionStats = {
  total_experience_gained: 12450,
  total_levels_gained: 48,
  total_evolutions_completed: 7,
  active_days: 23,
  characters_owned: 8,
  max_character_level: 42,
  average_character_level: 28,
  fully_evolved_characters: 2,
  workout_sessions_completed: 67,
  total_workout_duration: 3420, // minutes
  favorite_activity: 'strength_training',
  consistency_streak: 5,
  longest_streak: 12,
  achievements_unlocked: 15,
  achievement_score: 425,
  completion_percentage: 78.5,
  daily_experience_average: 541,
  weekly_level_ups: 14,
  monthly_evolutions: 9,
};

const mockAchievements = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first training session',
    category: 'milestone',
    rarity: 'common',
    icon: '👶',
    unlock_date: '2024-01-15T10:00:00Z',
  },
  {
    id: 'level_up_master',
    name: 'Level Up Master',
    description: 'Level up 3 characters in a single session',
    category: 'experience',
    rarity: 'rare',
    icon: '📈',
    unlock_date: '2024-01-22T15:30:00Z',
  },
  {
    id: 'evolution_pioneer',
    name: 'Evolution Pioneer',
    description: 'Complete your first character evolution',
    category: 'evolution',
    rarity: 'epic',
    icon: '🦋',
    unlock_date: '2024-01-28T09:15:00Z',
  },
  {
    id: 'dedication_streak',
    name: 'Dedication Streak',
    description: 'Train for 7 consecutive days',
    category: 'special',
    rarity: 'epic',
    icon: '🔥',
    unlock_date: '2024-02-03T18:45:00Z',
  },
];

const mockWeeklyData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    data: [1200, 1850, 2100, 1950],
    color: () => '#4CAF50',
    strokeWidth: 3,
  }],
};

const mockCharacterProgress = [
  { id: 'titan_forge', name: 'Titan Forge', level: 42, progress: 85, evolution_stage: 2 },
  { id: 'zen_master', name: 'Zen Master', level: 35, progress: 62, evolution_stage: 2 },
  { id: 'cardio_queen', name: 'Cardio Queen', level: 28, progress: 45, evolution_stage: 1 },
  { id: 'rookie_power', name: 'Rookie Power', level: 22, progress: 78, evolution_stage: 1 },
];

const ProgressionDashboard = ({ 
  onClose,
  progressionStats = mockProgressionStats,
  achievements = mockAchievements, 
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [animatedValues] = useState({
    fadeIn: new Animated.Value(0),
    slideUp: new Animated.Value(50),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValues.fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythical: '#E91E63',
    };
    return colors[rarity] || colors.common;
  };

  const formatDuration = (minutes) => {
    // const hours = ...; // Quick fix: commented unused variable
    // const mins = ...; // Quick fix: commented unused variable
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Overview Tab Content
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Key Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{formatNumber(progressionStats.total_experience_gained)}</Text>
          <Text style={styles.statLabel}>Total EXP</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{progressionStats.total_levels_gained}</Text>
          <Text style={styles.statLabel}>Level Ups</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="diamond" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{progressionStats.total_evolutions_completed}</Text>
          <Text style={styles.statLabel}>Evolutions</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{progressionStats.active_days}</Text>
          <Text style={styles.statLabel}>Active Days</Text>
        </View>
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Experience Progress</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={mockWeeklyData}
            width={width - 32}
            height={200}
            chartConfig={{
              backgroundColor: '#F8F9FA',
              backgroundGradientFrom: '#F8F9FA',
              backgroundGradientTo: '#F8F9FA',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Character Progress Overview */}
      <View style={styles.characterProgressSection}>
        <Text style={styles.sectionTitle}>Character Progress</Text>
        {mockCharacterProgress.map(character => (
          <View key={character.id} style={styles.characterProgressCard}>
            <View style={styles.characterProgressInfo}>
              <Text style={styles.characterProgressName}>{character.name}</Text>
              <Text style={styles.characterProgressLevel}>Level {character.level}</Text>
            </View>
            
            <View style={styles.characterProgressBars}>
              <View style={styles.progressBar}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${character.progress}%`, backgroundColor: '#4CAF50' },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>{character.progress}%</Text>
              </View>
              
              <View style={styles.evolutionDots}>
                {Array.from({ length: 3 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.evolutionDot,
                      { backgroundColor: i < character.evolution_stage ? '#FF9800' : '#E0E0E0' },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsSection}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        
        <View style={styles.quickStatRow}>
          <Text style={styles.quickStatLabel}>Daily Average EXP</Text>
          <Text style={styles.quickStatValue}>{formatNumber(progressionStats.daily_experience_average)}</Text>
        </View>
        
        <View style={styles.quickStatRow}>
          <Text style={styles.quickStatLabel}>Current Streak</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color="#FF6B6B" />
            <Text style={styles.quickStatValue}>{progressionStats.consistency_streak} days</Text>
          </View>
        </View>
        
        <View style={styles.quickStatRow}>
          <Text style={styles.quickStatLabel}>Completion Rate</Text>
          <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>
            {progressionStats.completion_percentage.toFixed(1)}%
          </Text>
        </View>
        
        <View style={styles.quickStatRow}>
          <Text style={styles.quickStatLabel}>Favorite Activity</Text>
          <Text style={styles.quickStatValue}>
            {progressionStats.favorite_activity.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // Achievements Tab Content
  const renderAchievementsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.achievementStats}>
        <View style={styles.achievementStatCard}>
          <Text style={styles.achievementStatValue}>{achievements.length}</Text>
          <Text style={styles.achievementStatLabel}>Unlocked</Text>
        </View>
        <View style={styles.achievementStatCard}>
          <Text style={styles.achievementStatValue}>{progressionStats.achievement_score}</Text>
          <Text style={styles.achievementStatLabel}>Total Score</Text>
        </View>
        <View style={styles.achievementStatCard}>
          <Text style={styles.achievementStatValue}>{progressionStats.completion_percentage.toFixed(0)}%</Text>
          <Text style={styles.achievementStatLabel}>Complete</Text>
        </View>
      </View>

      <View style={styles.achievementsList}>
        {achievements.map(achievement => (
          <TouchableOpacity
            key={achievement.id}
            style={[styles.achievementCard, { borderLeftColor: getRarityColor(achievement.rarity) }]}
            onPress={() => {
              setSelectedAchievement(achievement);
              setShowAchievementModal(true);
            }}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={[styles.achievementRarity, { color: getRarityColor(achievement.rarity) }]}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.achievementDate}>
              <Text style={styles.achievementUnlockDate}>
                {new Date(achievement.unlock_date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Analytics Tab Content
  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Activity Distribution */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Training Distribution</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={[
              { name: 'Strength', population: 35, color: '#FF6B6B', legendFontColor: '#333', legendFontSize: 12 },
              { name: 'Cardio', population: 25, color: '#4ECDC4', legendFontColor: '#333', legendFontSize: 12 },
              { name: 'Flexibility', population: 20, color: '#45B7D1', legendFontColor: '#333', legendFontSize: 12 },
              { name: 'Mental', population: 15, color: '#96CEB4', legendFontColor: '#333', legendFontSize: 12 },
              { name: 'Recovery', population: 5, color: '#FFEAA7', legendFontColor: '#333', legendFontSize: 12 },
            ]}
            width={width - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Level Distribution */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Character Level Distribution</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: ['1-10', '11-20', '21-30', '31-40', '41-50'],
              datasets: [{
                data: [1, 2, 3, 1, 1],
              }],
            }}
            width={width - 32}
            height={200}
            chartConfig={{
              backgroundColor: '#F8F9FA',
              backgroundGradientFrom: '#F8F9FA',
              backgroundGradientTo: '#F8F9FA',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
        </View>
      </View>

      {/* Advanced Stats */}
      <View style={styles.advancedStatsSection}>
        <Text style={styles.sectionTitle}>Advanced Analytics</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Ionicons name="time" size={20} color="#FF9800" />
            <Text style={styles.analyticsValue}>{formatDuration(progressionStats.total_workout_duration)}</Text>
            <Text style={styles.analyticsLabel}>Total Training Time</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Ionicons name="fitness" size={20} color="#4CAF50" />
            <Text style={styles.analyticsValue}>{progressionStats.workout_sessions_completed}</Text>
            <Text style={styles.analyticsLabel}>Sessions Completed</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.analyticsValue}>{progressionStats.longest_streak}</Text>
            <Text style={styles.analyticsLabel}>Best Streak</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Ionicons name="people" size={20} color="#2196F3" />
            <Text style={styles.analyticsValue}>{progressionStats.characters_owned}</Text>
            <Text style={styles.analyticsLabel}>Characters Owned</Text>
          </View>
        </View>

        {/* Efficiency Metrics */}
        <View style={styles.efficiencySection}>
          <Text style={styles.subsectionTitle}>Efficiency Metrics</Text>
          
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>EXP per Session</Text>
            <Text style={styles.efficiencyValue}>
              {Math.round(progressionStats.total_experience_gained / progressionStats.workout_sessions_completed)}
            </Text>
          </View>
          
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>Levels per Week</Text>
            <Text style={styles.efficiencyValue}>{progressionStats.weekly_level_ups}</Text>
          </View>
          
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>Evolutions per Month</Text>
            <Text style={styles.efficiencyValue}>{progressionStats.monthly_evolutions}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Achievement Detail Modal
  const renderAchievementModal = () => (
    <Modal
      visible={showAchievementModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAchievementModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.achievementModalContent}>
          {selectedAchievement && (
            <>
              <View style={[styles.achievementModalHeader, { backgroundColor: getRarityColor(selectedAchievement.rarity) }]}>
                <Text style={styles.achievementModalEmoji}>{selectedAchievement.icon}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowAchievementModal(false)}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.achievementModalBody}>
                <Text style={styles.achievementModalName}>{selectedAchievement.name}</Text>
                <Text style={[styles.achievementModalRarity, { color: getRarityColor(selectedAchievement.rarity) }]}>
                  {selectedAchievement.rarity.toUpperCase()} ACHIEVEMENT
                </Text>
                <Text style={styles.achievementModalDescription}>{selectedAchievement.description}</Text>
                
                <View style={styles.achievementModalStats}>
                  <View style={styles.achievementModalStat}>
                    <Text style={styles.achievementModalStatLabel}>Category</Text>
                    <Text style={styles.achievementModalStatValue}>
                      {selectedAchievement.category.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.achievementModalStat}>
                    <Text style={styles.achievementModalStatLabel}>Unlocked</Text>
                    <Text style={styles.achievementModalStatValue}>
                      {new Date(selectedAchievement.unlock_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: animatedValues.fadeIn,
          transform: [{ translateY: animatedValues.slideUp }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progression Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview', icon: 'analytics' },
          { key: 'achievements', label: 'Achievements', icon: 'trophy' },
          { key: 'analytics', label: 'Analytics', icon: 'bar-chart' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedTab === tab.key ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.tabLabel,
              selectedTab === tab.key && styles.activeTabLabel,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'achievements' && renderAchievementsTab()}
        {selectedTab === 'analytics' && renderAnalyticsTab()}
      </View>

      {/* Modals */}
      {renderAchievementModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Tab Navigation Styles
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  
  // Content Styles
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  
  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Chart Styles
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  
  // Character Progress Styles
  characterProgressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  characterProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  characterProgressInfo: {
    flex: 1,
  },
  characterProgressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  characterProgressLevel: {
    fontSize: 14,
    color: '#666',
  },
  characterProgressBars: {
    flex: 2,
    alignItems: 'flex-end',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 35,
  },
  evolutionDots: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  evolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  
  // Quick Stats Styles
  quickStatsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Achievement Styles
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  achievementStatCard: {
    alignItems: 'center',
  },
  achievementStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  achievementsList: {
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementRarity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementDate: {
    alignItems: 'flex-end',
  },
  achievementUnlockDate: {
    fontSize: 12,
    color: '#999',
  },
  
  // Analytics Styles
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsCard: {
    width: (width - 48) / 2,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  advancedStatsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  efficiencySection: {
    marginTop: 16,
  },
  efficiencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: '#666',
  },
  efficiencyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
    overflow: 'hidden',
  },
  achievementModalHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  achievementModalEmoji: {
    fontSize: 64,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  achievementModalBody: {
    padding: 24,
    alignItems: 'center',
  },
  achievementModalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementModalRarity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementModalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  achievementModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  achievementModalStat: {
    alignItems: 'center',
  },
  achievementModalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  achievementModalStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ProgressionDashboard;