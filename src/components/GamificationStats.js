import React, { useEffect, useRef } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Animated
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';

const GamificationStats = ({ userStats }) => {
  // const progressAnimation = ...; // Quick fix: commented unused variable
  // const scaleAnimation = ...; // Quick fix: commented unused variable
  
  // Debug logging
  console.log('GamificationStats - userStats:', userStats);
  
  useEffect(() => {
    if (!userStats) return;
    
    // const progress = ...; // Quick fix: commented unused variable
    
    // Animate progress bar with more subtle timing
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
    
    // Animate scale with more subtle spring
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 30,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [userStats?.totalExperience]);
  
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
    // Use the new exponential XP system
    // const totalExperience = ...; // Quick fix: commented unused variable
    // const currentLevel = ...; // Quick fix: commented unused variable
    
    // Calculate XP needed for current level
    const calculateLevelRequirement = (level) => {
      // const baseXP = ...; // Quick fix: commented unused variable
      return Math.floor(baseXP * Math.pow(level - 1, 1.5));
    };
    
    const calculateTotalXPForLevel = (level) => {
      let totalXP = 0;
      for (let i = 1; i <= level; i++) {
        totalXP += calculateLevelRequirement(i);
      }
      return totalXP;
    };
    
    // const xpForCurrentLevel = ...; // Quick fix: commented unused variable
    // const xpForNextLevel = ...; // Quick fix: commented unused variable
    // const xpInCurrentLevel = ...; // Quick fix: commented unused variable
    // const xpNeededForNextLevel = ...; // Quick fix: commented unused variable
    
    return (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Beginner',
      2: 'Novice',
      3: 'Apprentice',
      4: 'Intermediate',
      5: 'Advanced',
      6: 'Expert',
      7: 'Master',
      8: 'Legend',
      9: 'Champion',
      10: 'Elite',
    };
    return titles[level] || `Level ${level}`;
  };

  const getLevelColor = (level) => {
    if (level >= 10) return '#FF6B35'; // Legendary Orange
    if (level >= 8) return '#FFD700'; // Gold
    if (level >= 6) return '#C0C0C0'; // Silver
    if (level >= 4) return '#CD7F32'; // Bronze
    if (level >= 2) return '#4ECDC4'; // Teal
    return '#007AFF'; // Blue
  };

  // const getLevelGradient = (level) => {
  //   if (level >= 10) return ['#FF6B35', '#FF8E53']; // Legendary gradient
  //   if (level >= 8) return ['#FFD700', '#FFA500']; // Gold gradient
  //   if (level >= 6) return ['#C0C0C0', '#E5E5E5']; // Silver gradient
  //   if (level >= 4) return ['#CD7F32', '#DAA520']; // Bronze gradient
  //   if (level >= 2) return ['#4ECDC4', '#45B7D1']; // Teal gradient
  //   return ['#007AFF', '#0056CC']; // Blue gradient
  // };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnimation }] }]}>
      <View style={styles.levelContainer}>
        <Animated.View style={[
          styles.levelBadge, 
          { 
            backgroundColor: getLevelColor(userStats.level || 1),
            shadowColor: getLevelColor(userStats.level || 1),
          },
        ]}>
          <Text style={styles.levelText}>{userStats.level || 1}</Text>
        </Animated.View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{getLevelTitle(userStats.level || 1)}</Text>
          <Text style={styles.experienceText}>
            {userStats.totalExperience || 0} XP • {userStats.totalWorkouts || 0} workouts
          </Text>
        </View>
      </View>
      
      <View style={styles.hoursContainer}>
        <Ionicons name="time" size={16} color="#007AFF" />
        <Text style={styles.hoursText}>{Math.round((userStats.totalDuration || 0) / 60)} hours</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getLevelColor(userStats.level || 1),
                shadowColor: getLevelColor(userStats.level || 1),
              },
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {(() => {
            // const totalExperience = ...; // Quick fix: commented unused variable
            // const currentLevel = ...; // Quick fix: commented unused variable
            
            const calculateLevelRequirement = (level) => {
              // const baseXP = ...; // Quick fix: commented unused variable
              return Math.floor(baseXP * Math.pow(level - 1, 1.5));
            };
            
            const calculateTotalXPForLevel = (level) => {
              let totalXP = 0;
              for (let i = 1; i <= level; i++) {
                totalXP += calculateLevelRequirement(i);
              }
              return totalXP;
            };
            
            // const xpForCurrentLevel = ...; // Quick fix: commented unused variable
            // const xpForNextLevel = ...; // Quick fix: commented unused variable
            // const xpInCurrentLevel = ...; // Quick fix: commented unused variable
            // const xpNeededForNextLevel = ...; // Quick fix: commented unused variable
            
            return `${xpInCurrentLevel}/${xpNeededForNextLevel} XP to next level`;
          })()}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 15,
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  hoursText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default GamificationStats; 