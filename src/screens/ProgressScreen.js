import React, { useState, useEffect, useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // SafeAreaView,
  // TextInput,
  // Alert,
  // VirtualizedList,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useApp
} from '../context';
import StorageManager from '../utils/StorageManager';
import {
  // AnalyticsCharts,
  // GamificationStats,
  // 
} from '../components/common';
import BodyWeightTracker from '../components/BodyWeightTracker';
import QuestDisplay from '../components/QuestDisplay';

const ProgressScreen = ({ navigation, route }) => {
  const { workoutHistory, exerciseHistory, userStats, bodyWeights, isDemo } = useApp();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showAddMax, setShowAddMax] = useState(false);
  const [newMax, setNewMax] = useState({ weight: '', date: '' });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'analytics'); // 'analytics', 'weight', 'levels', or 'quests'
  const [quests, setQuests] = useState(null);
  const [achievements, setAchievements] = useState(null);

  // Load quest and achievement data in demo mode
  useEffect(() => {
    if (isDemo) {
      const loadDemoData = async () => {
        try {
          // const questsData = ...; // Quick fix: commented unused variable
          // const achievementsData = ...; // Quick fix: commented unused variable
          setQuests(questsData);
          setAchievements(achievementsData);
        } catch (error) {
          console.error('Error loading demo quest/achievement data:', error);
        }
      };
      loadDemoData();
    }
  }, [isDemo]);

  // Muscle groups with their exercises and level calculations
  const muscleGroups = useMemo(() => ({
    Chest: {
      exercises: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press', 'Cable Fly'],
      icon: 'body',
      color: '#ff6b6b',
      level: 0,
      experience: 0,
    },
    Back: {
      exercises: ['Deadlift', 'Pull-Ups', 'Lat Pulldown', 'Bent-Over Rows', 'Single Arm Dumbbell Row'],
      icon: 'fitness',
      color: '#4ecdc4',
      level: 0,
      experience: 0,
    },
    Legs: {
      exercises: ['Squats', 'Leg Press', 'Leg Extension', 'Seated Calf Raise'],
      icon: 'walk',
      color: '#45b7d1',
      level: 0,
      experience: 0,
    },
    Shoulders: {
      exercises: ['Overhead Press', 'Arnold Press', 'Lateral Raise', 'Face Pulls'],
      icon: 'body',
      color: '#96ceb4',
      level: 0,
      experience: 0,
    },
    Arms: {
      exercises: ['Bicep Curls', 'Tricep Pushdowns', 'Hammer Curls', 'Skullcrushers'],
      icon: 'fitness',
      color: '#feca57',
      level: 0,
      experience: 0,
    },
    Cardio: {
      exercises: ['Running', 'Cycling', 'Rowing', 'Elliptical'],
      icon: 'flash',
      color: '#ff9ff3',
      level: 0,
      experience: 0,
    },
  }), []);

  // Calculate muscle group levels and experience
  const muscleGroupStats = useMemo(() => {
    // const stats = ...; // Quick fix: commented unused variable
    
    // Add safety check for workoutHistory
    if (!workoutHistory || !Array.isArray(workoutHistory)) {
      return stats;
    }
    
    Object.keys(muscleGroups).forEach(groupName => {
      // const group = ...; // Quick fix: commented unused variable
      let totalExperience = 0;
      let totalWorkouts = 0;
      
      // Calculate experience from workout history
      workoutHistory.forEach(workout => {
        if (workout.exercises && Array.isArray(workout.exercises)) {
          workout.exercises.forEach(exercise => {
            if (exercise && exercise.name && group.exercises.includes(exercise.name)) {
              // Calculate experience based on volume (weight * reps * sets)
              if (exercise.sets && Array.isArray(exercise.sets)) {
                const volume = exercise.sets.reduce((total, set) => {
                  return total + (set.weight || 0) * (set.reps || 0);
                }, 0);
                totalExperience += volume;
                totalWorkouts++;
              }
            }
          });
        }
      });
      
      // Calculate level based on experience
      // const level = ...; // Quick fix: commented unused variable
      // const experience = ...; // Quick fix: commented unused variable
      
      stats[groupName] = {
        ...group,
        level,
        experience,
        totalExperience,
        totalWorkouts,
        progress: (experience / 1000) * 100,
      };
    });
    
    return stats;
  }, [workoutHistory, muscleGroups]);

  // Prepare data for VirtualizedList
  const sections = useMemo(() => {
    // const sectionsData = ...; // Quick fix: commented unused variable
    
    // Add safety check for workoutHistory
    if (!workoutHistory || !Array.isArray(workoutHistory)) {
      return sectionsData;
    }
    
    // Add gamification stats section
    if (workoutHistory.length > 0) {
      sectionsData.push({
        type: 'gamification',
        id: 'gamification',
        data: [{ id: 'gamification' }],
      });
    }
    
    // Add overall stats section
    sectionsData.push({
      type: 'overall',
      id: 'overall',
      data: [{ id: 'overall' }],
    });
    
    // Add muscle groups section
    // const muscleGroupEntries = ...; // Quick fix: commented unused variable
    if (muscleGroupEntries.length > 0) {
      sectionsData.push({
        type: 'muscleGroups',
        id: 'muscleGroups',
        data: muscleGroupEntries,
      });
    }
    
    return sectionsData;
  }, [workoutHistory, muscleGroupStats]);

  const getLevelColor = (level) => {
    if (level >= 10) return '#ffd700'; // Gold
    if (level >= 7) return '#c0c0c0'; // Silver
    if (level >= 4) return '#cd7f32'; // Bronze
    return '#8b4513'; // Brown
  };

  const getLevelTitle = (level) => {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Expert';
    if (level >= 4) return 'Intermediate';
    return 'Beginner';
  };

  const renderMuscleGroupCard = (groupName, stats) => {
    if (!stats || !groupName) {
      return null;
    }
    
    return (
      <TouchableOpacity
        key={groupName}
        style={styles.muscleGroupCard}
        onPress={() => setSelectedMuscleGroup(groupName)}
      >
        <View style={styles.muscleGroupHeader}>
          <View style={[styles.muscleGroupIcon, { backgroundColor: stats.color + '20' }]}>
            <Ionicons name={stats.icon} size={24} color={stats.color} />
          </View>
          <View style={styles.muscleGroupInfo}>
            <Text style={styles.muscleGroupName}>{groupName}</Text>
            <Text style={styles.muscleGroupLevel}>
            Level {stats.level} {getLevelTitle(stats.level)}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelNumber, { color: getLevelColor(stats.level) }]}>
              {stats.level}
            </Text>
          </View>
        </View>
      
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.progress}%`, backgroundColor: stats.color },
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {stats.experience}/1000 XP ({Math.round(stats.progress)}%)
          </Text>
        </View>
      
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Total Workouts: {stats.totalWorkouts}</Text>
          <Text style={styles.statText}>Total XP: {stats.totalExperience}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // VirtualizedList render functions
  // const getItem = ...; // Quick fix: commented unused variable
  // const getItemCount = ...; // Quick fix: commented unused variable

  const renderItem = ({ item, section }) => {
    if (!section || !section.type) {
      return null;
    }
    
    if (section.type === 'gamification') {
      return (
        <View style={styles.section}>
          <GamificationStats userStats={userStats} />
        </View>
      );
    } else if (section.type === 'overall') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.level || 1}</Text>
              <Text style={styles.statLabel}>Overall Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.totalWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      );
    } else if (section.type === 'muscleGroups') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Group Progress</Text>
          {section.data && Array.isArray(section.data) && section.data.map(([groupName, stats]) =>
            renderMuscleGroupCard(groupName, stats),
          )}
        </View>
      );
    }
    return null;
  };

  const renderTabContent = () => {
    if (activeTab === 'analytics') {
      return <AnalyticsCharts workoutHistory={workoutHistory} exerciseHistory={exerciseHistory} userStats={userStats} bodyWeights={bodyWeights} />;
    }
    
    if (activeTab === 'weight') {
      return <BodyWeightTracker />;
    }
    
    if (activeTab === 'quests' && isDemo) {
      return <QuestDisplay quests={quests} achievements={achievements} />;
    }
    
    return (
      <VirtualizedList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        getItemCount={getItemCount}
        getItem={getItem}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 300, // Approximate height for each section
          offset: 300 * index,
          index,
        })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress & Analytics</Text>
        <Text style={styles.subtitle}>Track your progression and performance</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons 
            name="analytics" 
            size={18} 
            color={activeTab === 'analytics' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'weight' && styles.activeTab]}
          onPress={() => setActiveTab('weight')}
        >
          <Ionicons 
            name="scale" 
            size={18} 
            color={activeTab === 'weight' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'weight' && styles.activeTabText]}>
            Weight
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'levels' && styles.activeTab]}
          onPress={() => setActiveTab('levels')}
        >
          <Ionicons 
            name="trophy" 
            size={18} 
            color={activeTab === 'levels' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'levels' && styles.activeTabText]}>
            Levels
          </Text>
        </TouchableOpacity>
        
        {isDemo && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quests' && styles.activeTab]}
            onPress={() => setActiveTab('quests')}
          >
            <Ionicons 
              name="star" 
              size={18} 
              color={activeTab === 'quests' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'quests' && styles.activeTabText]}>
              Quests
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
  scrollContent: {
    paddingBottom: 20, // Add some padding at the bottom for the last section
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  muscleGroupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  muscleGroupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleGroupInfo: {
    marginLeft: 15,
    flex: 1,
  },
  muscleGroupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  muscleGroupLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ProgressScreen; 