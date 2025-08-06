import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestDisplay = ({ quests, achievements }) => {
  const renderQuest = (quest) => (
    <View key={quest.id} style={[styles.questCard, quest.completed && styles.completedQuest]}>
      <View style={styles.questHeader}>
        <View style={styles.questInfo}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>
        <View style={styles.questReward}>
          <Ionicons name="star" size={16} color="#ffd700" />
          <Text style={styles.rewardText}>{quest.xpReward} XP</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(quest.progress / quest.maxProgress) * 100}%`,
                backgroundColor: quest.completed ? '#22c55e' : '#007AFF',
              },
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {quest.progress}/{quest.maxProgress}
        </Text>
      </View>
      
      {quest.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );

  const renderAchievement = (achievement) => (
    <View key={achievement.id} style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <Ionicons name={achievement.icon} size={24} color="#007AFF" />
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        <View style={styles.achievementReward}>
          <Ionicons name="star" size={16} color="#ffd700" />
          <Text style={styles.rewardText}>{achievement.xpReward} XP</Text>
        </View>
      </View>
      <Text style={styles.unlockedText}>
        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Daily Quests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        {quests?.daily?.map(renderQuest)}
      </View>

      {/* Weekly Quests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Quests</Text>
        {quests?.weekly?.map(renderQuest)}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements?.unlocked?.map(renderAchievement)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedQuest: {
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#666',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  completedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default QuestDisplay; 