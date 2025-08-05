import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AchievementQuestDisplay = ({ achievements, activeQuests, completedQuests }) => {
  const getAchievementIcon = (achievementId) => {
    const iconMap = {
      'first_workout': 'fitness-outline',
      'workout_5': 'fitness',
      'workout_25': 'trophy-outline',
      'workout_50': 'trophy',
      'workout_100': 'diamond-outline',
      'workout_500': 'diamond',
      'streak_7': 'flame',
      'streak_30': 'fire',
      'perfect_workout': 'star',
      'template_master': 'bookmark',
      'template_legend': 'bookmark'
    };
    return iconMap[achievementId] || 'star-outline';
  };

  const getQuestIcon = (questId) => {
    const iconMap = {
      'daily_workout': 'calendar-outline',
      'daily_streak': 'flame-outline',
      'weekly_consistency': 'calendar'
    };
    return iconMap[questId] || 'bookmark-outline';
  };

  const getRarityColor = (xp) => {
    if (xp >= 1000) return '#FFD700'; // Gold
    if (xp >= 500) return '#C0C0C0'; // Silver
    if (xp >= 200) return '#CD7F32'; // Bronze
    return '#10B981'; // Green
  };

  return (
    <View style={styles.container}>
      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.slice(-3).map((achievement, index) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: getRarityColor(achievement.xp) }]}>
                  <Ionicons 
                    name={getAchievementIcon(achievement.id)} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Active Quests */}
      {activeQuests && activeQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Quests</Text>
          {activeQuests.map((quest, index) => (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <View style={styles.questIconContainer}>
                  <Ionicons 
                    name={getQuestIcon(quest.id)} 
                    size={20} 
                    color="#007AFF" 
                  />
                </View>
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                </View>
                <View style={styles.questReward}>
                  <Text style={styles.questXP}>+{quest.xp} XP</Text>
                </View>
              </View>
              <View style={styles.questProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(quest.progress / quest.maxProgress) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {quest.progress}/{quest.maxProgress}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Completed Quests */}
      {completedQuests && completedQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Today</Text>
          {completedQuests.map((quest, index) => (
            <View key={quest.id} style={styles.completedQuestCard}>
              <View style={styles.questHeader}>
                <View style={[styles.questIconContainer, { backgroundColor: '#10B981' }]}>
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                </View>
                <View style={styles.questReward}>
                  <Text style={styles.completedXP}>+{quest.xp} XP</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  achievementCard: {
    alignItems: 'center',
    marginRight: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 80,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementXP: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: 'bold',
  },
  questCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  completedQuestCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  questDescription: {
    fontSize: 12,
    color: '#666',
  },
  questReward: {
    alignItems: 'flex-end',
  },
  questXP: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  completedXP: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    minWidth: 30,
  },
});

export default AchievementQuestDisplay; 