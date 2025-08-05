import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { FITNESS_CLASSES } from '../screens/ClassSelectionScreen';

const EnhancedGamificationStats = ({ navigation }) => {
  const { userStats, calculateClassXPRequired } = useApp();
  const [levelProgress] = useState(new Animated.Value(0));
  const [classProgress] = useState(new Animated.Value(0));
  
  const classData = userStats.selectedClass ? FITNESS_CLASSES[userStats.selectedClass] : null;
  
  useEffect(() => {
    // Animate overall level progress
    const currentLevelXP = calculateLevelXP(userStats.level);
    const nextLevelXP = calculateLevelXP(userStats.level + 1);
    const progress = (userStats.experience - currentLevelXP) / (nextLevelXP - currentLevelXP);
    
    Animated.timing(levelProgress, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    // Animate class progress if class selected
    if (classData) {
      const classProgressValue = userStats.classXP / calculateClassXPRequired(userStats.classLevel + 1);
      Animated.timing(classProgress, {
        toValue: classProgressValue,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [userStats.experience, userStats.level, userStats.classXP, userStats.classLevel]);
  
  const levelProgressWidth = levelProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  const classProgressWidth = classProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={styles.gamificationContainer}>
      {/* Overall Level */}
      <View style={styles.levelSection}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>WARRIOR LEVEL</Text>
          <Text style={styles.levelNumber}>{userStats.level}</Text>
        </View>
        
        <View style={styles.progressBar}>
          <Animated.View 
            style={[styles.progressFill, { width: levelProgressWidth }]} 
          />
        </View>
        
        <Text style={styles.experienceText}>
          {userStats.experience} XP
        </Text>
      </View>
      
      {/* Class Level (if selected) */}
      {classData && (
        <View style={styles.classSection}>
          <View style={styles.classLevelHeader}>
            <Text style={styles.classEmoji}>{classData.emoji}</Text>
            <View>
              <Text style={styles.classLevelTitle}>{classData.name}</Text>
              <Text style={styles.classLevelNumber}>Level {userStats.classLevel}</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: classProgressWidth, backgroundColor: classData.color }
              ]} 
            />
          </View>
          
          <Text style={styles.classXPText}>
            {userStats.classXP} / {calculateClassXPRequired(userStats.classLevel + 1)} Class XP
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gamificationContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  levelSection: {
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  classSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  classLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  classEmoji: {
    fontSize: 24,
  },
  classLevelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  classLevelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  classXPText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
});

// Helper function
const calculateLevelXP = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(i - 1, 1.5));
  }
  return total;
};

export default EnhancedGamificationStats; 