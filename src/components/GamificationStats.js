import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GamificationStats = ({ userStats }) => {
  // Debug logging
  console.log('GamificationStats - userStats:', userStats);
  
  // Handle null/undefined userStats
  if (!userStats) {
    console.log('GamificationStats - userStats is null/undefined');
    return (
      <View style={styles.container}>
        <Text style={styles.levelTitle}>Loading stats...</Text>
      </View>
    );
  }

  const calculateProgress = () => {
    const currentLevelExp = (userStats.totalExperience || 0) % 100;
    return (currentLevelExp / 100) * 100;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: "Beginner",
      2: "Novice",
      3: "Apprentice",
      4: "Intermediate",
      5: "Advanced",
      6: "Expert",
      7: "Master",
      8: "Legend",
      9: "Champion",
      10: "Elite"
    };
    return titles[level] || `Level ${level}`;
  };

  const getLevelColor = (level) => {
    if (level >= 8) return '#FFD700'; // Gold
    if (level >= 6) return '#C0C0C0'; // Silver
    if (level >= 4) return '#CD7F32'; // Bronze
    return '#007AFF'; // Blue
  };

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(userStats.level || 1) }]}>
          <Text style={styles.levelText}>{userStats.level || 1}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{getLevelTitle(userStats.level || 1)}</Text>
          <Text style={styles.experienceText}>
            {userStats.totalExperience || 0} XP • {userStats.totalWorkouts || 0} workouts
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${calculateProgress()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {(userStats.totalExperience || 0) % 100}/100 XP to next level
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.statValue}>{userStats.streaks?.current || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.statValue}>{userStats.streaks?.best || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color="#007AFF" />
          <Text style={styles.statValue}>{Math.round((userStats.totalDuration || 0) / 60)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default GamificationStats; 