import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { FITNESS_CLASSES } from '../screens/ClassSelectionScreen';

const ClassDashboardWidget = ({ navigation }) => {
  const { userStats, selectClass, calculateClassXPRequired } = useApp();
  const [progressAnim] = useState(new Animated.Value(0));
  const [skillPointPulse] = useState(new Animated.Value(1));
  
  const classData = userStats.selectedClass ? FITNESS_CLASSES[userStats.selectedClass] : null;
  
  // Animate progress bar
  useEffect(() => {
    if (classData) {
      const progress = userStats.classXP / calculateClassXPRequired(userStats.classLevel + 1);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [userStats.classXP, userStats.classLevel]);
  
  // Pulse skill points when available
  useEffect(() => {
    if (userStats.skillPoints > 0) {
      const pulse = Animated.sequence([
        Animated.timing(skillPointPulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(skillPointPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]);
      Animated.loop(pulse, { iterations: 3 }).start();
    }
  }, [userStats.skillPoints]);
  
  // No class selected - show selection prompt
  if (!userStats.selectedClass) {
    return (
      <TouchableOpacity 
        style={styles.noClassContainer}
        onPress={() => navigation.navigate('ClassSelection')}
      >
        <View style={styles.noClassContent}>
          <Text style={styles.noClassEmoji}>⚔️</Text>
          <Text style={styles.noClassTitle}>Choose Your Fighting Style</Text>
          <Text style={styles.noClassSubtitle}>Unlock class bonuses and skill trees</Text>
          <View style={styles.selectClassButton}>
            <Text style={styles.selectClassText}>SELECT CLASS</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  // Class selected - show class stats
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  const nextLevelXP = calculateClassXPRequired(userStats.classLevel + 1);
  const progressPercent = Math.round((userStats.classXP / nextLevelXP) * 100);
  
  return (
    <View style={[styles.classWidget, { borderTopColor: classData.color }]}>
      {/* Class Header */}
      <View style={styles.classHeader}>
        <View style={styles.classInfo}>
          <Text style={styles.classEmoji}>{classData.emoji}</Text>
          <View>
            <Text style={styles.className}>{classData.name}</Text>
            <Text style={styles.classSubtitle}>{classData.subtitle}</Text>
          </View>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.classLevel}>LVL {userStats.classLevel}</Text>
          {userStats.skillPoints > 0 && (
            <Animated.View 
              style={[
                styles.skillPointsBadge, 
                { transform: [{ scale: skillPointPulse }] }
              ]}
            >
              <Text style={styles.skillPointsText}>
                {userStats.skillPoints} SP
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: progressWidth, backgroundColor: classData.color }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {userStats.classXP} / {nextLevelXP} XP ({progressPercent}%)
        </Text>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Battles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.unlockedSkills.length}</Text>
          <Text style={styles.statLabel}>Skills</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: classData.color }]}>
            {userStats.level}
          </Text>
          <Text style={styles.statLabel}>Overall</Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: classData.color }]}
          onPress={() => navigation.navigate('SkillTree')}
        >
          <Text style={styles.actionButtonText}>SKILL TREE</Text>
        </TouchableOpacity>
        
        {userStats.skillPoints > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.urgentButton]}
            onPress={() => navigation.navigate('SkillTree')}
          >
            <Text style={styles.actionButtonText}>SPEND SP!</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // No Class Selected Styles
  noClassContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noClassContent: {
    alignItems: 'center',
  },
  noClassEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  noClassTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  noClassSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    textAlign: 'center',
  },
  selectClassButton: {
    backgroundColor: '#ff6347',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectClassText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Class Widget Styles
  classWidget: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  classSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  classLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  skillPointsBadge: {
    backgroundColor: '#ff6347',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  skillPointsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Progress Styles
  progressSection: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  urgentButton: {
    backgroundColor: '#ff6347',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ClassDashboardWidget; 